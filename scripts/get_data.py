import json
import requests
import os
import argparse

requests.packages.urllib3.disable_warnings()


def clean_string(s):
    return " ".join(s.upper().split())

def scrap(db_path,write_csv):
    with open(os.path.join(db_path,"courses.json"), "r") as fl:
        course_json = json.loads(fl.read())

    # Sample Command 
    # curl 'https://academics1.iitd.ac.in/Academics/GenerateExcel.php?page=excel&secret=07d5ba2560b6586a955ec6153ec85ac0a07534d7&uname=2015CS10262' -H 'Cookie: _ga=GA1.3.1716513787.1485603351' -H 'Origin: https://academics1.iitd.ac.in' -H 'Accept-Encoding: gzip, deflate, br' -H 'Accept-Language: en-US,en;q=0.8,hi;q=0.6' -H 'Upgrade-Insecure-Requests: 1' -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36' -H 'Content-Type: application/x-www-form-urlencoded' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8' -H 'Cache-Control: max-age=0' -H 'Referer: https://academics1.iitd.ac.in/Academics/index.php?page=ListCourseN&secret=fc93f3c5a0584122f7339d6e19a3b45d05fbc051&uname=2015CS10262' -H 'Connection: keep-alive' -H 'DNT: 1' --data 'submit=Download+Data+in+CSV+File&EntryNumber=COL100&UserID=2015CS10262' --compressed

    cookies = {
        '_ga': 'GA1.3.1716513787.1485603351',
    }

    headers = {
        'Origin': 'https://academics1.iitd.ac.in',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.8,hi;q=0.6',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://academics1.iitd.ac.in/Academics/index.php?page=ListCourseN&secret=fc93f3c5a0584122f7339d6e19a3b45d05fbc051&uname=2015CS10262',
        'Connection': 'keep-alive',
        'DNT': '1',
    }

    params = (
        ('page', 'excel'),
        ('secret', '07d5ba2560b6586a955ec6153ec85ac0a07534d7'),
        ('uname', '2015CS10262')
    )

    data = {
        'submit': 'Download Data in CSV File',
        'EntryNumber': 'XXXXXX',
        'UserID': '2015CS10262',
    }

    CSV_DIR = os.path.join(db_path, "csv_files")
    os.makedirs(CSV_DIR, exist_ok=True)

    students = {}

    course_codes = list(set([x.upper() for x in course_json]))
    course_codes.sort()


    for idx,code in enumerate(course_codes):
        print("Processing course: %s (%d of %d)" %(code,idx+1,len(course_codes)))
        try:
            data["EntryNumber"] = code
            response = requests.post('https://academics1.iitd.ac.in/Academics/GenerateExcel.php',
                                    headers=headers, params=params, cookies=cookies, data=data, verify=False)

            if(response.status_code == 200):
                csv_content = response.content.decode('utf-8').upper()
                if(write_csv):
                    with open(os.path.join(CSV_DIR, code + ".csv"), "w") as fl:
                        fl.write(csv_content)
                student_data = csv_content.splitlines()[4:]
                student_data = [[clean_string(p) for p in d.split(',')] for d in student_data]
                data_json = [{"name": d[2], "entry":d[1], "group":d[3],
                            "audit_withdraw":d[4], "slot":d[5]} for d in student_data]
                for student in data_json:
                    if student["entry"] not in students:
                        students[student["entry"]] = {
                            "name": student["name"], "courses": []}
                    students[student["entry"]]["courses"].append({"code": code, "slot": student["slot"]})
        except Exception as e:
            print("Error occurred in course: ", code)
            print(e)

    with open(os.path.join(db_path,"student.json"), "w") as fl:
        fl.write(json.dumps(students, indent=4, sort_keys=True))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
            description='Academics1 Scrap IITD')
    parser.add_argument('db_path', metavar='DB_PATH',
                            help='path to the database folder containg courses.json')
    parser.add_argument('--writecsv',action='store_true',
                        help='Turn on to Store the CSV Files scrapped')

    args = parser.parse_args()

    DATABASE_PATH = args.db_path
    WRITE_CSV = args.writecsv
    print (WRITE_CSV,"AAA")
    scrap(DATABASE_PATH,WRITE_CSV)
