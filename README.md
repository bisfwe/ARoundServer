# ARound - Investments in Locals for Locals.
Project submitted to the SIX Hackathon

App enabling users to invest in a user friendly way in local and international businesses. The augmented reality approach brings investors and companys together in a intuitive way in daily live.

# Backend
Backend handling calls to our server infrastructure deployed and running on Microsoft Azure. The image recognition is outsourced to the Google Cloud. An index of companies is cached in MongoDB tables and Redis is used to handle geolocation requests.

# Usage

## POST: http://sixhackathon2018-server.azurewebsites.net/image
Send a post request including a picture to our server. It returns the companies owning the recognized logos, their tickersymbol used at the stock exchange and the position of the logos in the picture.

### Request body:
```json
{
  "image": "image_represented_as_base_64_string"
 }
```


## POST: http://sixhackathon2018-server.azurewebsites.net/location
This endpoint can be used to get the companies in a radius of 150 meters around the given position by latitude and longitude. A list of tickersymbols ot the companies is returned.
## Request body;
```json
{
   "latitude" : 47.3720248,
     "longitude" : 8.5373825
}
```

## GET: https://sixhackathon2018-server.azurewebsites.net/api
Dummy endpoint to test if the server is running..
