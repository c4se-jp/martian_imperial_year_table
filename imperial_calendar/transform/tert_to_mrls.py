"""
地球時からMars Ls (Areocentric Solar Longitude; 火星中心太陽黃經) を算出する.

參考ページ
https://www.giss.nasa.gov/tools/mars24/help/algorithm.html
上記ページの計算式は下記の文獻の式(15)-式(19)に基づくが、Allison(2015)(未公開論文)により更新されてゐる。
Allison M, McEwen M. (2000)
"A post-Pathfinder evaluation of areocentric solar coordinates
with improved timing recipes for Mars seasonal/diurnal climate studies"
Planetary and Space Science, 48: pp.215-235
"""
from imperial_calendar.TerrestrialTime import TerrestrialTime
import math


def tert_to_offset_t_j2000(tert):
    """地球時を基にしてJ2000元期からの經過日數を求める."""
    return tert.terrestrial_time - 2451545.0


def offset_t_j2000_to_mars_mean_anomaly(offset_t_j2000):
    """Mを求める."""
    return 19.3871 + 0.52402073 * offset_t_j2000


def offset_t_j2000_to_angle_of_fictitious_mean_sun(offset_t_j2000):
    """α_FMSを求める."""
    return 270.3871 + 0.524038496 * offset_t_j2000


def offset_t_j2000_to_perturbers(offset_t_j2000):
    """PBS=攝動角を求める."""
    amp = [0.0071, 0.0057, 0.0039, 0.0037, 0.0021, 0.0020, 0.0018]
    tau = [2.2353, 2.7543, 1.1177, 15.7866, 2.1354, 2.4694, 32.8493]
    phi = [49.409, 168.173, 191.837, 21.736, 15.704, 95.528, 49.095]
    perturbers = 0
    for i in range(0, len(amp)):
        angle = (360 / 365.25) * offset_t_j2000 / tau[i] + phi[i]
        perturbers += amp[i] * math.cos(math.radians(angle))
    return perturbers


def offset_t_j2000_to_equation_of_center(offset_t_j2000):
    """ν-Mを求める."""
    m_m_a = offset_t_j2000_to_mars_mean_anomaly(offset_t_j2000)
    angle_m = math.radians(m_m_a)
    pbs = offset_t_j2000_to_perturbers(offset_t_j2000)
    return (
        (10.691 + (3.0 * 10**-7) * offset_t_j2000) * math.sin(angle_m)
        + 0.623 * math.sin(2 * angle_m)
        + 0.050 * math.sin(3 * angle_m)
        + 0.005 * math.sin(4 * angle_m)
        + 0.0005 * math.sin(5 * angle_m)
        + pbs
    )


def offset_t_j2000_to_areocentric_solar_longitude(offset_t_j2000):
    """Ls=火星中心太陽黃經を求める."""
    return (
        offset_t_j2000_to_angle_of_fictitious_mean_sun(offset_t_j2000)
        + offset_t_j2000_to_equation_of_center(offset_t_j2000)
    ) % 360


def tert_to_mrls(tert: TerrestrialTime) -> float:
    """地球時からMars Ls (Areocentric Solar Longitude; 火星中心太陽黃經) を算出する."""
    return offset_t_j2000_to_areocentric_solar_longitude(tert_to_offset_t_j2000(tert))
