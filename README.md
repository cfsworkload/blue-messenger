# Workload - Scalable Web App

Scalable Web Application example implemented in Cloud Foundry 


## Big Picture

We will be deploying an messaging web application that will utilizes and demonstrates Bluemix services "Monitoring and Analytics",
"Autoscale", and "Cloudant NoSQL DB"

Workflow - 

![Workflow](images/WebHostingAppWorkflow.jpg)

## Introduction

A messaging web application has been created that we will depoly it into our personal space
after you have signed up for the Bluemix and their DevOps servies . We will attach the the
"Monitoring and Analytics", "Autoscale", and "Cloudant NoSQL DB" servcies and provide instruction
into understanding how the applications works and how to monitor the attached services.  

## Sign up for / Log into Bluemix and DevOPs

	//TODO - Making a guide for signing up for bluemix


## Create Cloudant NoSQL DB through Bluemix Dashboard
 

* Log into your Dashboard at https://console.ng.bluemix.net/
* From main select "ADD A SERVICE OR API"
* In the top search bar type "cloudant" and select "Cloudant NoSQL DB"

![Example](images/cloudant.jpg)

* In the "Space" select your desired space in your Bluemix account
* In "App:" select "Leave unbound"
* In "Service name:" put "Cloudant NoSQL DB-xh"
* In your "Selected Plan:" leave it as default "Shared"
* Select "CREATE"

![Example](images/AddService.jpg)

	You have successfully deployed a standalone instance of Cloudant NoSQL DB into your personal Bluemix space. 
For more information on Cloudant please see the docs at - 

https://www.ng.bluemix.net/docs/#services/Cloudant/index.html#Cloudant

## Fork project to personal Jazz Repo space 

* From https://hub.jazz.net/git/ank/Mosca-Cloudant/ select "Fork Project" in top right of page

![Example](images/fork.jpg)

In the Menu that pops up 

* Set desired name of project 
* Make sure URL specified is proper path to your Bluemix space 
* Decide if you want to this repository to be public or private by checking box at "Make it private (not public)"
* Decide if you want to Add features for Scrum development
* Make sure the box is checked for "Make this a Bluemix Project"
* Select your desired Region, Organization, and Space and select "Create"

![Example](images/create.jpg)

	You have successfully forked this application code to your personalJazz Hub space.
To find more about Bluemix's DevOPs features reference the DOCs at - 
https://hub.jazz.net/docs

## Deploy to Bluemix through Jazz Hub

* From the project page in your Jazz Hub at ttps://hub.jazz.net/project/**NameOfProject** select "EDIT CODE" at the top right

![Example](images/editcode.jpg)

* In your "EDIT CODE" window double click the manifest.yml which will display the file
* In the "host:" field you will see "mosca-cloudant" ... we need to append to the end of it to be unique because the host name
will be used as your DNS name and is publicly accessible .. I this case I will add the user name test749 to the end of the "mosca-cloudant"

![Example](images/manifest.jpg)


* In your "EDIT CODE" window click the drop down and select the pencil symbol to edit launch configuration



![Example](images/editlaunch.jpg)

* In the "Edit Launch Configuration" window
	* In the "Launch Config Name*:" field give a Config Name 
	* In the "Target*:" field select your region
	* In the "Organization*:" field select your desired org
	* In the "Space*:" field select your Bluemix Space you want to deploy to
	* In the "Application Name" field put the host name you specified in your manifest.yml
	* In the "Host" field put "Mosca-Cloudant"
	* In the "Domain" field leave default at "mybluemix.net"
	* Click "Save"

![Example](images/launchconfig.jpg)]

* In your "EDIT CODE" window select the "Play" button to deploy your application to bluemix

![Example](images/play.jpg)



## Add Services and Monitor from Bluemix Dashboard

* Log into your Dashboard at https://console.ng.bluemix.net/
* From main select your application you just created ... default is "Mosca-Cloudant"

![Example](images/ourapplication.jpg)

* In the application windows select "ADD A SERVICE OR API"

![Example](images/AddService-1.jpg)

	This will bring up the Bluemix services catalog
	
* In the top search bar type "Monitoring and Analytics" and select "Monitoring and Analytics"

![Example](images/monitoring.jpg)

* In "Space:" select your space our newly created application resides
* In "App:" select your app 
* In "Selected Plan:" select your desired plan
* Select "CREATE" and then select "RESTAGE" when it pops up ( it might do this for you automatically )


* Go back to your application page and select "ADD A SERVICE OR API" again
* In the top search bar type "Auto-Scaling" and select "Auto-Scaling"

![Example](images/autoscale.jpg)

* In "Space:" select your space our newly created application resides
* In "App:" select your app 
* In "Selected Plan:" select your desired plan
* Select "CREATE" and then select "RESTAGE" when it pops up ( it might do this for you automatically )

	You have now successfully binded "Monitoring and Analytics" and "Auto-Scaling" services to your web application


