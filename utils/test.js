var request = require('request');

var headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate',
    'Cache-Control': 'no-cache',
    'Content-Length': '1165',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Host': 'atentochile.s1gateway.com',
    'Postman-Token': 'eb3c1abd-78cb-44fd-9611-c60cc0488715,a70160e4-04f7-4a70-9cd7-d2b594a8fd0b',
    'User-Agent': 'PostmanRuntime/7.15.2',
    'cache-control': 'no-cache'
};

var dataString = 'ET=THRvNGdjRklNMFdmaHJ5NmFwM0QyeUZJZ3hWTjY3S2kwcHJiN05GNFhkblFjNmVNaDA3SEt3OU10bjZRa2hEZ24xL0h5aEJrM1IyYzhuTzFyWHV6SlFvNUdmayt0VkNxSFdPbzBQRitvOGdXSGY3dlhsMHp3NFIrWElSWUNaRlF5S25ydGRYYmZSS1pCZ2YzS1lPc25UempCdjUxYlBEU0NQdEtPOFIxK0grd0o1UklkSjRvVWppbkRISUl4ejkvTUtja3lCRHViaXErdDhSQ3ZXc3BJYmhoNnVWVHlqakpvUzFCOVRRb0dkUUZOQlZnMU0zdCsvZTh0VUNnUjIwcw%3D%3D&content=Mensaje%20de%20Prueba&subject=esto%20es%20una%20prueba&ext_date=2019-14-08%2016%3A24%3A00&source=external&cpg_id=8691168&message=%7B%22content%22%3A%20%22Mensaje%20de%20Prueba%22%2C%20%22subject%22%3A%20%22esto%20es%20una%20prueba%22%2C%20%22ext_id%22%3A%20%22392483290843666%22%2C%20%22source%22%3A%20%22external%22%2C%20%22cpg_id%22%3A%20%228691168%22%7D&contact=%7B%22fields%22%3A%20%7B%22first_name%22%3A%20%22Jose%22%2C%22last_name%22%3A%20%22Smith%22%2C%20%22phone_1%22%3A%20null%2C%22phone_2%22%3A%20%22111566667777%22%2C%22external_id%22%3A%20%2231111%20%22%7D%2C%0A%22accounts%22%3A%20%5B%7B%22account_ext_id%22%3A%20%22jose.smith%20%40prueba.com.ar%20%22%2C%22name%22%3A%20%22Jose%20Smith%22%2C%22source%22%3A%20%22external%22%2C%22account%22%3A%20%22jose.smith%20%40prueba.com.ar%22%7D%5D%7D%0A';

var options = {
    url: 'https://atentochile.s1gateway.com/pe/c92d74eebc48d061bee5d96bba6a95213f98674fb79cb789dc4c0842275bb32f5f6e8795010d8b47',
    method: 'POST',
    headers: headers,
    body: dataString
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    } else {
        console.log(error, response)
    }
}

request(options, callback);
