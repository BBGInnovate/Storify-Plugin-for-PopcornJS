function addslashes (str) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Ates Goral (http://magnetiq.com)
    // +   improved by: marrtins
    // +   improved by: Nate
    // +   improved by: Onno Marsman
    // +   input by: Denny Wardhana
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Oskar Larsson Högfeldt (http://oskar-lh.name/)
    // *     example 1: addslashes("kevin's birthday");
    // *     returns 1: 'kevin\'s birthday'
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

function fs(str) {
	return addslashes(str);
}

function animateIt2(num, iDiv) {
	console.log("scroll to " + num);
	var theDiv=document.getElementById('storifyItemNumber'+num);
	var div0=document.getElementById('storifyItemNumber0');
	if (theDiv != null && div0 != null) {
		var theTop=theDiv.offsetTop-div0.offsetTop;
		$('#storifyContainer').animate({
			scrollTop: theTop
		}, 1000);
	}
	
}

function renderStory(story) {
	var htmlStr="";
	for (var i=0; i< story.content.elements.length; i++) {
		var s=story.content.elements[i];
		var oneStr="";
		
		switch (s.type) {
			case "text":
				var quote=s.data.text;
				oneStr+=quote;
			break;
			case "quote":
				var a=s.attribution;
				var avatar="<a title='"+fs(a.name)+"' href='"+a.href+"'><img src='"+a.thumbnail+"' /></a>";
				var quote="<a href='" + s.permalink+"'>"+fs(s.data.quote.text)+"</a>";
				oneStr+=avatar+"<BR>"+quote;
			break;
			case "video":
				var v=s.data.video;
				var thumb="<img border='0' alt='"+v.title+"' src='"+v.thumbnail+"' />";
				var link="<a href='"+v.src+"' title='" + fs(v.title)+ "'>"+thumb+"</a>";
				oneStr+=link;
			break;
			case "image":
				//dont use 'i' for img since its our var
				var im=s.data.image;
				var iStr="<img alt='"+fs(im.caption)+"' src='"+im.src+"' />";
				var thumbSrc= im.src;
				var tWidth=100;
				var tHeight=100;
				var m = s.meta;
				//if possible, adjust the thumbnail height to preserve actual aspect ratio
				if (m && m.entities && m.entities.media && m.entities.media.length > 0) {
					var sizes=m.entities.media[0].sizes;
					if (sizes.small) {
						var realHeight=parseInt(sizes.small.h);
						var realWidth=parseInt(sizes.small.w);
						tHeight=tWidth * realHeight/realWidth;
					}
				}
				if (im.thumbnail != undefined) {
					thumbSrc=im.thumbnail;
				}
				//var tStr="<a href='"+im.src+"' title='"+fs(im.caption)+"'><img class='story-tile-simple-thumbnail-image' width='"+tWidth+"' height='"+tHeight+"' border='0' alt='"+fs(im.caption)+"' src='"+thumbSrc+"' /></a><span class='storifyText'>Hello world</span>";
				var tStr="";
				var alink=s.permalink;
				
				var attribName=s.attribution.username;
				var attribLink=s.attribution.href;
				
				tStr+='<div class="story-tile-simple">';
				tStr+='<div class="story-tile-simple-thumbnail">';
				tStr+='<a  href="'+alink+'" style="background:url('+im.src+')" class="story-tile-simple-thumbnail-image"></a>';
				tStr+='</div>'
				tStr+='<div class="story-tile-simple-info">';
				tStr+='<a href="'+alink+'" class="story-tile-simple-title">'+fs(im.caption)+'</a>';
				tStr+=' ';
				tStr+='<a href="'+attribLink+'" class="story-tile-simple-author">'+attribName+'</a>';
				tStr+=' ';
				tStr+='<a href="'+alink+'" data-timestamp="2011-08-09T02:34:25.000Z" class="timestamp story-tile-simple-date">a year ago</a>';
				tStr+='</div>';
				tStr+='</div>';
				oneStr+=tStr;
			break;
		}
		oneStr="<div class='storifyItem' id='storifyItemNumber"+i+"'>"+oneStr+"</div>";
		htmlStr+=oneStr+"<BR>";
	}
	htmlStr="<div id='storifyContainer' style='height:300px; overflow-y:scroll;'>"+htmlStr+"</div>";
    return htmlStr;
}

// PLUGIN: STORIFY
(function ( Popcorn ) {
   
  Popcorn.plugin( "storify" , {
    manifest: {
      about: {
        name: "Popcorn storify Plugin",
        version: "0.1",
        author: "Joe Flowers",
        website: "http://www.innovation-series.com/"
      },
      options: {
        id: {
          elem: "input",
          type: "text",
          label: "Id",
          optional: true
        },
        start: {
          elem: "input",
          type: "text",
          label: "In"
        },
        end: {
          elem: "input",
          type: "text",
          label: "Out"
        },
        src: {
          elem: "input",
          type: "url",
          label: "Storify URL",
          "default": "http://storify.com/washingtonpost/dcstorm-in-photos"
        },
        target: "iframe-container"
      }
    },
    _setup: function( options ) {
		console.log("STORIFY SETUP ");
		lastFrameTime=-1;
		lastStoryNum=1;
		//duration = Math.min(0.25, options.end - options.start - 0.25);
		duration = options.end - options.start;
		var origTargetURL=options.src
		var apiURL=origTargetURL.replace("http://storify.com/","http://api.storify.com/v1/stories/");
		apiURL=apiURL.replace("http://www.storify.com/","http://api.storify.com/v1/stories/");
		apiURL=apiURL+"?callback=ajsoncallback";
		numStories=1;
		Popcorn.getJSONP(
			apiURL,
			function( data ) {
			  storifyAsJson=data;
			  numStories=data.content.elements.length;
			  storifyResultString=JSON.stringify(data); 
			}
		 );
      var target = document.getElementById( options.target );
      // make an iframe
      options._iframe = document.createElement( "div" );
      options._iframe.setAttribute( "width", "100%" );
      options._iframe.setAttribute( "height", "100%" );
      options._iframe.id = options.id;
      options._iframe.innerHTML = "";
      options._iframe.style.display = "none";

      if ( !target && Popcorn.plugin.debug ) {
        throw new Error( "target container doesn't exist" );
      }
     // add the hidden iframe to the DOM
      target && target.appendChild( options._iframe );

    },
    start: function( event, options ){
      console.log("STORIFY START ");
      var sHTML=renderStory(storifyAsJson);
      options._iframe.innerHTML=sHTML;
      options._iframe.style.display = "inline";
    },
  
    frame: function(event, options, time) {
        console.log("STORIFY ONFRAME ");
        var scale = 1, opacity = 1,
          t = time - options.start,
          div = options.container,
          transform;
	
		if (lastFrameTime != time) {
			
			var percentPlayed=time/duration;
			var storyNum=Math.floor(percentPlayed*numStories);
			if (lastStoryNum != storyNum) {
				animateIt2(storyNum, options._iframe);
			}
			lastStoryNum=storyNum;
		}
		lastFrameTime=time;
        if (!options.container) {
          return;
        }
     },
    
    end: function( event, options ){
      console.log("STORIFY END ");
      options._iframe.style.display = "none";
    },
    _teardown: function( options ) {
      document.getElementById( options.target ) && document.getElementById( options.target ).removeChild( options._iframe );
    }
  });
})( Popcorn );