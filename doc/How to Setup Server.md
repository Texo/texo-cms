# How to Setup Server

* Change directory to **./bin**
* Activate virtual environment: **source ../virtualenv/bin/activate**
* Run the following:
   * fab -H 192.168.1.x build setupAppRequirements setupAppDirectory:user=user setupVirtualEnvironment setupMySQL uploadApp setupUpstartJob:user=user setupNginx:port=8080,serverName=domain.com

## Deploying to Amazon EC2

    $ export AWS_ACCESS_KEY_ID="MYSECRETID"
    $ export AWS_SECRET_ACCESS_KEY="MYSECRETACCESSKEY"

* Use *amazon:keyFile=/path/to/keyfile.pem* instead of "-H 192.168.1.x" for Amazon EC2 deployment