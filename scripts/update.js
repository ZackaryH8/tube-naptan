import * as fs from 'fs';
import axios from 'axios';
import converter from 'json-2-csv';
import ora from 'ora';

let list = [];
let JSONOutput;
let CSVOutput;

const spinner = ora('Requesting new data').start();

(async () => {
    const lines = await axios.get(`https://api.tfl.gov.uk/line/mode/tube/status`);

    for (const line of lines.data) {
        const tubeStopPoints = await axios.get(`https://api.tfl.gov.uk/line/${line.id}/stoppoints`);

        for (const tubeStopPoint of tubeStopPoints.data) {
            if (tubeStopPoint.modes.includes("tube")) {
                list.push({
                    naptanID: tubeStopPoint.id,
                    commonName: tubeStopPoint.commonName,
                });
            }
        }
    }
    list = list.filter((obj, pos, arr) => {
        return arr.map((mapObj) => mapObj.naptanID).indexOf(obj.naptanID) == pos;
    });

    JSONOutput = JSON.stringify(list);
    CSVOutput = await converter.json2csvAsync(list);

    fs.writeFile(`./data/naptan.json`, JSONOutput, 'utf8', (err) => {
        if (err) {
            spinner.fail("JSON data failed to update!");
        }
        spinner.succeed("JSON data was updated succesfully!");

    });

    fs.writeFile(`./data/naptan.csv`, CSVOutput, 'utf8', (err) => {
        if (err) {
            spinner.fail("JSON data failed to update!");
        }
        spinner.succeed("CSV data was updated succesfully!");
    });
})();

spinner.clear()