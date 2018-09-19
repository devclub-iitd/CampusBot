#!/bin/bash
read -p "write csv: Enter Y/N " WRITE_CSV
read -p "path to database folder: " DB_PATH
read -p "commit message: " COMMIT_MESSAGE
read -p "on which branch to push: " BRANCH
get_data_args=''
if [ "$WRITE_CSV" = "Y" ];
then
	get_data_args="--writecsv "$DB_PATH
else
	get_data_args=$DB_PATH
fi

python3 get_venue.py $DB_PATH
python3 get_data.py $get_data_args

git add ..
git commit -m $COMMIT_MESSAGE
git push origin $BRANCH