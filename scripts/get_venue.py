import json
import os
import csv
import argparse

def parse_csv(db_path):
    venue_json ={}
    with open(os.path.join(db_path,"venue.csv"), "r") as fl:
        vreader = csv.reader(fl,delimiter=',')
        for row in vreader:
            course = row[1].strip().upper()
            slot = row[0].strip().upper()
            venue = row[2].strip().upper()
            if(course not in venue):
                venue_json[course] = {}
            venue_json[course][slot] = venue

    with open(os.path.join(db_path,"venue.json"), "w") as fl:
        fl.write(json.dumps(venue_json, indent=4, sort_keys=True))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
            description='Academics1 Scrap IITD')
    parser.add_argument('db_path', metavar='DB_PATH',
                            help='path to the database folder containg courses.json and venue.csv')

    args = parser.parse_args()

    DATABASE_PATH = args.db_path
    parse_csv(DATABASE_PATH)