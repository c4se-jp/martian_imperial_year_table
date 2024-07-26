#!/usr/bin/env python3
"""Tasks."""
from contextlib import contextmanager
from shlex import quote
import json
import os
import os.path
import platform
import re
import shutil
import subprocess
import sys
import time

tasks = {}


def cwd_for_docker_volume() -> str:
    """Get current directory for Docker volume. This works both on macOS & WSL."""
    cwd = os.getcwd()
    if cwd.startswith("/mnt/c"):
        cwd = cwd[4:]
    return cwd


@contextmanager
def docker():
    """Run command in Docker."""
    if within_docker():
        yield run
    else:
        yield run_in_docker


def docker_exe() -> str:
    """Get a Docker executable name."""
    if within_wsl():
        return "docker.exe"
    else:
        return "docker"


def kubectl_exe() -> str:
    """Get a kubectl executable name."""
    if within_wsl():
        return "kubectl.exe"
    else:
        return "kubectl"


@contextmanager
def powershell():
    """Run command in PowerShell if it's present."""
    if within_wsl():
        yield run_in_powershell
    else:
        yield run


def run(command: str, capture_output=False, text=None) -> subprocess.CompletedProcess:
    """Run command."""
    command = command.strip()
    print("+ ", command)
    env = os.environ.copy()
    env["COMPOSE_DOCKER_CLI_BUILD"] = "1"
    env["DOCKER_BUILDKIT"] = "1"
    return subprocess.run(
        command,
        env=env,
        capture_output=capture_output,
        check=True,
        shell=True,
        text=text,
    )


def run_in_docker(
    command: str, docker_options="", capture_output=False, text=None
) -> subprocess.CompletedProcess:
    """Run command in Docker."""
    command = command.strip()
    print("+ ", command)
    env = os.environ.copy()
    env["PWD"] = cwd_for_docker_volume()
    return subprocess.run(
        f"{docker_exe()} compose {docker_options} run --rm web {command}",
        env=env,
        capture_output=capture_output,
        check=True,
        shell=True,
        text=text,
    )


def run_in_powershell(
    command: str, capture_output=False, text=None
) -> subprocess.CompletedProcess:
    """Run command in PowerShell if it's present."""
    command = re.sub(r"\\\n", r"`\n", command.strip())
    print("+ ", command)
    env = os.environ.copy()
    env["DOCKER_BUILDKIT"] = "1"
    return subprocess.run(
        f"powershell.exe -Command {quote(command)}",
        env=env,
        capture_output=capture_output,
        check=True,
        shell=True,
        text=text,
    )


def task(function):
    """Define a task."""
    if function.__doc__:
        tasks[function.__name__] = function.__doc__

    def wrapper():
        function()

    return wrapper


def within_docker() -> bool:
    """Detect I'm in a Docker or not."""
    return os.path.exists("/.dockerenv") or os.getenv("CI") == "1"


def within_wsl() -> bool:
    """Detect I'm in a WSL or not."""
    uname = platform.uname()
    return uname[0] == "Linux" and ("Microsoft" in uname[2] or "microsoft" in uname[2])


@task
def build():
    """Build stuffs."""
    os.makedirs("static/css", exist_ok=True)
    os.makedirs("static/js", exist_ok=True)
    if not within_docker():
        run(f"{docker_exe()} compose pull --ignore-pull-failures web-src")
        run(
            rf"""
            {docker_exe()} compose build \
              --build-arg BUILDKIT_INLINE_CACHE=1 \
              --force-rm \
              --pull
            """
        )
        run(
            f"{docker_exe()} compose run --rm web-src /docker-entrypoint.d/precopy_appsync.sh"
        )
    with docker() as _run:
        _run(
            "bash -eux -c {:s}".format(
                quote(r"cp node_modules/bulma/css/* static/css/")
            )
        )
        _run("pipenv run npx webpack --config webpack.development.js")
        _run("bash -eux -c {:s}".format(quote(r"mv dist/* static/js/")))


@task
def clean():
    """Clean built files."""
    if not within_docker():
        run(f"{docker_exe()} compose down -v")
        shutil.rmtree("node_modules", ignore_errors=True)
        run("find . -name '.unison.*' -exec rm -vrf {} +;")
    shutil.rmtree("__target__", ignore_errors=True)
    shutil.rmtree("static/css", ignore_errors=True)
    shutil.rmtree("static/js", ignore_errors=True)


@task
def deploy_production():
    """Deploy to production."""
    run("git tag -f production")
    run("git push -f origin production")
    commit_sha = run(
        "git rev-parse production", capture_output=True, text=True
    ).stdout.strip()
    with powershell() as _run:
        for i in range(3):
            time.sleep(10)
            process = _run(
                r"""
                gcloud builds list \
                  --filter substitutions.TRIGGER_NAME=martian-imperial-year-table-deploy-production \
                  --format json \
                  --limit 1
                """,
                capture_output=True,
                text=True,
            )
            build = json.loads(process.stdout)[0]
            if build["substitutions"]["COMMIT_SHA"] == commit_sha:
                break
            if i == 2:
                raise Exception("Retry count exceeded")
        build_id = build["id"]
        _run(f"gcloud builds log --stream {quote(build_id)}")
    time.sleep(10)
    run(
        f"""
        {kubectl_exe()} -n martian-imperial-year-table-production \
          wait \
          po \
          -l app=martian-imperial-year-table \
          -l role=web \
          --for=condition=ready \
          --timeout=10m
        """
    )


@task
def format():
    """Format code."""
    run(r"ag -l '\r' | xargs -t -I{} sed -i -e 's/\r//' {}")
    with docker() as _run:
        _run("pipenv run black *.py imperial_calendar stubs tests ui web")
        _run("npx prettier --write README.md templates/*.md")
        _run("npx prettier --write *.js")
        _run(
            "bash -eux -c {:s}".format(
                quote(
                    r"ag --hidden -g \.ya?ml$ | xargs -t npx prettier --parser yaml --write"
                )
            )
        )


@task
def resync():
    """Re-sync the Docker volume."""
    if within_docker():
        return
    run(f"{docker_exe()} compose stop web-src")
    run("find . -name '.unison.*' -exec rm -vrf {} +;")
    run(
        f"{docker_exe()} compose run --rm web-src /docker-entrypoint.d/precopy_appsync.sh"
    )
    run(f"{docker_exe()} compose up -d web-src")


@task
def sh():
    """Run shell in a Docker container."""
    with docker() as _run:
        _run("bash")


@task
def start():
    """Start a development server."""
    run(f"{docker_exe()} compose up")


@task
def start_as_production():
    """Start a production build development server."""
    run(
        rf"""
        {docker_exe()} build \
          -f deployments/staging/Dockerfile \
          -t "asia-docker.pkg.dev/c4se-197915/asia.gcr.io/martian_imperial_year_table:builder" \
          --cache-from "asia-docker.pkg.dev/c4se-197915/asia.gcr.io/martian_imperial_year_table:builder" \
          --target builder \
          .
        """
    )
    run(
        rf"""
        {docker_exe()} build \
          -f deployments/staging/Dockerfile \
          -t "asia-docker.pkg.dev/c4se-197915/asia.gcr.io/martian_imperial_year_table:latest" \
          --cache-from "asia-docker.pkg.dev/c4se-197915/asia.gcr.io/martian_imperial_year_table:builder" \
          --cache-from "asia-docker.pkg.dev/c4se-197915/asia.gcr.io/martian_imperial_year_table:latest" \
          .
        """
    )
    run(
        f"{docker_exe()} run -p 5000:5000 --rm asia-docker.pkg.dev/c4se-197915/asia.gcr.io/martian_imperial_year_table:latest"
    )


@task
def test():
    """Test."""
    if not within_docker():
        for env in ["development", "staging"]:
            run(
                rf"""
               {docker_exe()} run -i \
                 -v {cwd_for_docker_volume()}:/mnt \
                 --rm \
                 hadolint/hadolint \
                 hadolint \
                   --config /mnt/.hadolint.yaml \
                   /mnt/deployments/{env}/Dockerfile
               """
            )
        for env in ["staging", "production"]:
            run(
                "bash -eux -c {:s}".format(
                    quote(
                        f"(cd deployments/{env} && kustomize build) | kubeconform -ignore-missing-schemas -strict"
                    )
                )
            )
    with docker() as _run:
        _run("pipenv check")
        _run("npm audit")
        # _run(
        #     "bash -eux -c {}".format(
        #         quote(r"ag --hidden -g \.ya?ml$ | xargs -t pipenv run yamllint")
        #     )
        # )
        _run("pipenv run black --check *.py imperial_calendar stubs tests ui web")
        _run("pipenv run flake8 .")
        _run("pipenv run mypy *.py")
        _run("pipenv run coverage erase")
        _run("pipenv run coverage run -m unittest discover -s tests/imperial_calendar")
        _run("pipenv run coverage run -m unittest discover -s tests/web")
        _run("pipenv run coverage report -m")


@task
def upgrade():
    """Upgrade dependencies."""
    with docker() as _run:
        _run("npx npm-check-updates -u")
        _run("npm install")
        _run("npm audit fix")
        _run("npm fund")
        _run("pipenv update -d --pre")


if __name__ == "__main__":
    if len(sys.argv) == 1 or sys.argv[1] == "help":
        for task_name, describe in tasks.items():
            print(f"{task_name.ljust(16)}\t{describe}")
        exit(0)
    for task_name in sys.argv[1:]:
        locals()[task_name]()
