import * as fs from 'fs';
import axios from 'axios';
import converter from 'json-2-csv';

let mode = 'tube';
let list = [];
let JSONOutput;
let CSVOutput;

(async () => {
    console.log('Updating data...');

    const lines = await axios.get(`https://api.tfl.gov.uk/line/mode/${mode}/status`);

    for (const line of lines.data) {
        const tubeStopPoints = await axios.get(`https://api.tfl.gov.uk/line/${line.id}/stoppoints`);

        for (const tubeStopPoint of tubeStopPoints.data) {
            if (tubeStopPoint.modes.includes(mode)) {
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
        if (err) throw err;
        console.log('CSV data was updated succesfully!');
    });

    fs.writeFile(`./data/naptan.csv`, CSVOutput, 'utf8', (err) => {
        if (err) throw err;
        console.log('JSON data was updated succesfully!');
    });
})();
