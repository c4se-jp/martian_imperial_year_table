from imperial_calendar import *
from imperial_calendar.transform import *


def grdt_all(year, month, day, hour, minute, second, tze, tzm):
    """全部呼び出す"""
    grdt = GregorianDateTime(year, month, day, hour, minute, second, tze)
    juld = grdt_to_juld(grdt)
    tert = juld_to_tert(juld)
    mrls = tert_to_mrls(tert)
    mrsd = tert_to_mrsd(tert)
    imsn = mrsd_to_imsn(mrsd)
    imdt = imsn_to_imdt(imsn, tzm)
    back = juld_to_grdt(
        tert_to_juld(mrsd_to_tert(imsn_to_mrsd(imdt_to_imsn(imdt)))), tze
    )
    print(
        "juld:"
        + str(juld.julian_day)
        + "\n"
        + "dltt:"
        + str(juld.delta_t)
        + "\n"
        + "tert:"
        + str(tert.terrestrial_time)
        + "\n"
        + "mrls:"
        + str(mrls)
        + "\n"
        + "mrsd:"
        + str(mrsd.mars_sol_date)
        + "\n"
        + "imsn:"
        + str(imsn.imperial_sol_number)
        + "\n"
        + "imdt:"
        + str(imdt.year)
        + "-"
        + str(imdt.month)
        + "-"
        + str(imdt.day)
        + "T"
        + str(imdt.hour)
        + ":"
        + str(imdt.minute)
        + ":"
        + str(imdt.second)
        + "tz"
        + str(imdt.offset)
        + "\n"
        + "back:"
        + str(back.year)
        + "-"
        + str(back.month)
        + "-"
        + str(back.day)
        + "T"
        + str(back.hour)
        + ":"
        + str(back.minute)
        + ":"
        + str(back.second)
        + "tz"
        + str(back.offset)
    )


def imdt_all(year, month, day, hour, minute, second, tzm, tze):
    """全部呼び出す"""
    imdt = ImperialDateTime(year, month, day, hour, minute, second, tzm)
    imsn = imdt_to_imsn(imdt)
    mrsd = imsn_to_mrsd(imsn)
    tert = mrsd_to_tert(mrsd)
    mrls = tert_to_mrls(tert)
    juld = tert_to_juld(tert)
    grdt = juld_to_grdt(juld, tze)
    back = imsn_to_imdt(
        mrsd_to_imsn(tert_to_mrsd(juld_to_tert(grdt_to_juld(grdt)))), tzm
    )
    print(
        "imsn:"
        + str(imsn.imperial_sol_number)
        + "\n"
        + "mrsd:"
        + str(mrsd.mars_sol_date)
        + "\n"
        + "mrls:"
        + str(mrls)
        + "\n"
        + "tert:"
        + str(tert.terrestrial_time)
        + "\n"
        + "dltt:"
        + str(juld.delta_t())
        + "\n"
        + "juld:"
        + str(juld.julian_day)
        + "\n"
        + "grdt:"
        + str(grdt.year)
        + "-"
        + str(grdt.month)
        + "-"
        + str(grdt.day)
        + "T"
        + str(grdt.hour)
        + ":"
        + str(grdt.minute)
        + ":"
        + str(grdt.second)
        + "tz"
        + str(grdt.offset)
        + "\n"
        + "back:"
        + str(back.year)
        + "-"
        + str(back.month)
        + "-"
        + str(back.day)
        + "T"
        + str(back.hour)
        + ":"
        + str(back.minute)
        + ":"
        + str(back.second)
        + "tz"
        + str(back.offset)
    )


def year_to_ls270(year):
    """火星年->其の年の天文學上の冬至の日"""
    last_sol_imsn = imdt_to_imsn(ImperialDateTime(year, 24, 27, 0, 0, 0, "+00:00"))
    for i in range(0, 668):
        check_sol = ImperialSolNumber(last_sol_imsn.imperial_sol_number - i)
        after_sol = ImperialSolNumber(last_sol_imsn.imperial_sol_number - i + 1)
        mrls_of_check_sol = tert_to_mrls(mrsd_to_tert(imsn_to_mrsd(check_sol)))
        mrls_of_after_sol = tert_to_mrls(mrsd_to_tert(imsn_to_mrsd(after_sol)))
        if mrls_of_check_sol <= 270 and mrls_of_after_sol > 270:
            return imsn_to_imdt(check_sol, 0)
            break
    else:
        print("error")


def touji_zure(year):
    """1000年の冬至のずれを一覽する"""
    text = str()
    for i in range(0, 1000):
        check_sol = imdt_to_imsn(year_to_ls270(year + i))
        ref_sol = imdt_to_imsn(ImperialDateTime(year + i, 22, 1, 0, 0, 0, "+00:00"))
        dif_sol = (check_sol.imperial_sol_number - ref_sol.imperial_sol_number) // 1
        letter = str(int(dif_sol % 10))
        text += letter
        if i % 40 == 39 and i != 1000:
            text += str("\n")
    print(text)


def leap1000(year):
    """1000年の閏年を一覽する"""
    text = str()
    for i in range(0, 1000):
        check_bool = ImperialYear(year + i).is_leap_year()
        if check_bool == True:
            letter = "1"
        else:
            letter = "0"
        text += letter
        if i % 50 == 49 and i != 1000:
            text += str("\n")
    print(text)


def imdt_to_mrls(imdt):
    """よんだまま"""
    return tert_to_mrls(mrsd_to_tert(imsn_to_mrsd(imdt_to_imsn(imdt))))
