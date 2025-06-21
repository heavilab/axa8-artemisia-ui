import requests
import xml.etree.ElementTree as ET
import csv


def get_ecb_rates():
    url = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml"
    response = requests.get(url)
    tree = ET.fromstring(response.content)

    ns = {
        "gesmes": "http://www.gesmes.org/xml/2002-08-01",
        "xmlns": "http://www.ecb.int/vocabulary/2002-08-01/eurofxref",
    }

    # Get the date
    time_elem = tree.find(".//xmlns:Cube[@time]", ns)
    date = time_elem.attrib["time"] if time_elem is not None else "unknown"

    # EUR is base
    rates = [("EUR/EUR", 1.0, date)]

    for cube in tree.findall(".//xmlns:Cube[@currency]", ns):
        currency = cube.attrib["currency"]
        rate = float(cube.attrib["rate"])
        forex_pair = f"EUR/{currency}"
        rates.append((forex_pair, rate, date))

    return rates


def export_to_csv(rates, filename="/Users/romflorentz/Downloads/ecb_rates.csv"):
    with open(filename, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["forex", "value", "date"])
        writer.writerows(rates)


if __name__ == "__main__":
    rates = get_ecb_rates()
    export_to_csv(rates)
    print(f"✅ Exported {len(rates)} exchange rates to ecb_rates.csv")
