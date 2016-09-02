$(document).ready(function(){
  var city,
      country,
      countrycode,
      temper,
      icn,
      descr,
      humidity,
      images = ["https://images.unsplash.com/photo-1414541944151-2f3ec1cfd87d?q=80&fm=jpg&s=cfd48a535d22e60cf7a07060408f9ff3",
              "http://41.media.tumblr.com/a8967e5627307f5084f614582a0593dc/tumblr_nsupnvdGZQ1u84dnlo1_1280.jpg",
              "http://data.whicdn.com/images/193790974/large.jpg",
              "https://images.unsplash.com/photo-1414490929659-9a12b7e31907?q=80&fm=jpg&s=27ecf272f87782af7cff05806551ed44"];
 
  $.getJSON("http://ip-api.com/json", function(data){
    city = data.city;
    country = data.country;
    countrycode = data.countryCode.toLowerCase();
    $('.location').text(city + ", "+ country);
    $.getJSON("http://api.openweathermap.org/data/2.5/weather?q="+city +"," +countrycode, function(data){
      temper = data.main.temp;
      descr = data.weather[0].description;
      humidity = data.main.humidity;
      icn = "http://openweathermap.org/img/w/"+data.weather[0].icon+".png";
      
      $('.wicon').attr('src',icn);
      var temp = kelvinToCelsius(temper);
      $('.temp').text(temp);
      $('.descript').text(descr );
      $('.humidity').text("humidity: "+ humidity + "%");
      var wimg = "url("+imageChange(temp)+")";
      $('body').css({"background-image": wimg});
      $(".celc").click(function(){
         $('.celc').css({"color": "white"});
          $('.fahr').css({"color": "grey"});
        $('.temp').text(temp);
      }); //celc btn ends
       $(".fahr").click(function(){
         var ftemp = Math.round(kelvinToFahrenheit(temper));
        $('.temp').text(ftemp);
         $('.fahr').css({"color": "white"});
          $('.celc').css({"color": "grey"});
      });//click fahr btn
      
      
    });//api
    })//ip
 
   function kelvinToCelsius(degreeKelvin) {
     var celcius = Math.round(degreeKelvin - 273.15);
     return celcius;
    }
    
    function kelvinToFahrenheit(degreeKelvin) {
      var fahr = Math.round(degreeKelvin * 1.8 - 459.67);
      return fahr;
    }
  
  function imageChange(temp){
    var image;
        if (temp<=0)
        image = images[0];     
        else if(temp<=18)
        image = images[1];
        else if(temp<=28)
        image = images[2];
        else
        image = images[3];
       
    
    return image;
  }
 var now = new Date();

var days = new Array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday');

var months = new Array('January','February','March','April','May','June','July','August','September','October','November','December');

var date = ((now.getDate()<10) ? "0" : "")+ now.getDate();

function fourdigits(number)	{
	return (number < 1000) ? number + 1900 : number;
								}
today =  days[now.getDay()] + ", " +
         months[now.getMonth()] + " " +
         date + ", " +
         (fourdigits(now.getYear())) ;
$(".time").text(today);
   
})