const aws          = require('aws-sdk');
const codepipeline = new aws.CodePipeline();
const https        = require('https');
const url          = require('url');

exports.handler = (event, context, callback) => {
  const detail = event['detail'];
    
  const slack_req_opts   = url.parse(process.env.SLACK_WEBHOOK_URL);
  slack_req_opts.method  = 'POST';
  slack_req_opts.headers = {'Content-Type': 'application/json'};
  
  const payload = {};
  let color = 'warning'
  if (detail.state == 'SUCCEEDED') {
    color = 'good';
  } else if (detail.state == 'FAILED') {
    color = 'danger';
  }
  
  payload.text = `*Pipeline state changed*`;
  payload.attachments = [{
    title: event.resources.join(', '),
    text:  `${event.time}`,
    color: color,
    fields: [{
      title: 'State',
      value: `${detail.state}${detail.state == 'SUCCEEDED' ? ' :beer:' : ''}`,
      short: true
    }, {
      title: 'Stage',
      value: detail.stage,
      short: true
    }, {
      title: 'Execution ID',
      value: detail['execution-id'],
      short: false
    }]
  }];
  
  request(slack_req_opts, payload).then((res) => {
    console.log(res);
    callback(null, 'Hello from Lambda');
  }).catch((err) => {
    console.log(err, err.stack);
  });
};

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (response) => {
      resolve(response);
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(JSON.stringify(body));
        
    req.end();
  });
}
