import * as fs from 'fs';
import axios from 'axios';
import converter from 'json-2-csv';
import ora from 'ora';

let stopPointList = [];

const spinner = ora('Requesting new data').start();

(async () => {
    // Get all line statuses
    const lines = await axios.get(`https://api.tfl.gov.uk/line/mode/tube/status`);

    //Loop through each line
    for (const line of lines.data) {
        // Request the stop points for each line
        const tubeStopPoints = await axios.get(`https://api.tfl.gov.uk/line/${line.id}/stoppoints`);

        // Loop through each stop point and check if it's mode is tube
        for (const tubeStopPoint of tubeStopPoints.data) {
            if (tubeStopPoint.modes.includes('tube')) {
                // Add the stop point to the stop points list
                stopPointList.push({
                    naptanID: tubeStopPoint.id,
                    commonName: tubeStopPoint.commonName,
                });
            }
        }
    }

    stopPointList = stopPointList.filter((object, position, array) => {
        return array.map((mapObject) => mapObject.naptanID).indexOf(object.naptanID) == position;
    });

    // Write json to file
    fs.writeFile('./data/naptan.json', JSON.stringify(stopPointList), 'utf8', (err) => {
        if (err) {
            spinner.fail('JSON -> Data failed to update!');
        } else {
            spinner.succeed('JSON -> Data was updated succesfully!');
        }
    });

    // Write CSV to file
    fs.writeFile('./data/naptan.csv', await converter.json2csvAsync(stopPointList), 'utf8', (err) => {
        if (err) {
            spinner.fail('CSV  -> Data failed to update!');
        } else {
            spinner.succeed('CSV  -> Data was updated succesfully!');
        }
    });
})();

spinner.clear();
