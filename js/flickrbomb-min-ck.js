/*
 * flickrBomb v1
 * www.ZURB.com/playground
 * Copyright 2011, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/// Optionally pass a Flickr API key on instantiation
var flickrBomb=function e(t){function n(){try{return"localStorage"in window&&window.localStorage!==null}catch(e){return!1}}if(!(this instanceof e))return new e;var r=t||"66b5c17019403c96779e8fe88d5b576d",i="",s,o;if(!r)return new Error("flickr API key required");if(n()){var u=function(){return((1+Math.random())*65536|0).toString(16).substring(1)},a=function(){return u()+u()+"-"+u()+"-"+u()+"-"+u()+"-"+u()+u()+u()},f=function(e){this.name=e;var t=window.localStorage.getItem(this.name);this.data=t&&JSON.parse(t)||{}};_.extend(f.prototype,{save:function(){window.localStorage.setItem(this.name,JSON.stringify(this.data))},create:function(e){return e.id||(e.id=e.attributes.id=a()),this.data[e.id]=e,this.save(),e},update:function(e){return this.data[e.id]=e,this.save(),e},find:function(e){return this.data[e.id]},findAll:function(){return _.values(this.data)},destroy:function(e){return delete this.data[e.id],this.save(),e}}),o=function(e,t,n){var r,i=t.localStorage||t.collection.localStorage;switch(e){case"read":r=t.id?i.find(t):i.findAll();break;case"create":r=i.create(t);break;case"update":r=i.update(t);break;case"delete":r=i.destroy(t)}r&&n&&n.success&&n.success(r)},s=new f("flickrBombImages")}else s=null;var l=Backbone.Model.extend({sync:o,fullsize_url:function(){return this.image_url("medium")},thumb_url:function(){return this.image_url("square")},image_url:function(e){var t;switch(e){case"square":t="_s";break;case"medium":t="_z";break;case"large":t="_b";break;default:t=""}return"http://farm"+this.get("farm")+".static.flickr.com/"+this.get("server")+"/"+this.get("id")+"_"+this.get("secret")+t+".jpg"}}),c=Backbone.Model.extend({sync:o,localStorage:s,initialize:function(){_.bindAll(this,"loadFirstImage"),this.flickrImages=new h,this.flickrImages.fetch(this.get("keywords"),this.loadFirstImage),this.set({id:this.get("id")||this.get("keywords")}),this.bind("change:src",this.changeSrc)},changeSrc:function(){this.save()},loadFirstImage:function(){this.get("src")===undefined&&this.set({src:this.flickrImages.first().image_url()})}}),h=Backbone.Collection.extend({sync:o,model:l,key:r,page:1,fetch:function(e,t){var n=this;t=t||$.noop,this.keywords=e||this.keywords,$.ajax({url:"http://api.flickr.com/services/rest/",data:{api_key:n.key,format:"json",method:"flickr.photos.search",tags:this.keywords,per_page:9,page:this.page,license:i},dataType:"jsonp",jsonp:"jsoncallback",success:function(e){n.add(e.photos.photo),t()}})},nextPage:function(e){this.page+=1,this.remove(this.models),this.fetch(null,e)},prevPage:function(e){this.page>1&&(this.page-=1),this.remove(this.models),this.fetch(null,e)}}),p=Backbone.View.extend({tagName:"a",template:_.template("<img src='<%= thumb_url() %>' />"),className:"photo",events:{click:"setImageSrc"},render:function(){return $(this.el).html(this.template(this.model)),$(this.el).addClass("photo"),this},setImageSrc:function(e){this.options.image.set({src:this.model.fullsize_url()})}}),d=Backbone.View.extend({tagName:"div",className:"flickrbombContainer",lock:!1,template:_.template('<div id="<%= id %>" class="flickrbombWrapper"><img class="flickrbomb" src="" /><a href="#" title="Setup" class="setupIcon"></a></div><div class="flickrbombFlyout"><div class="flickrbombContent"><a href="#" title="Previous Page" class="prev">&#9664;</a><a href="#" title="Next Page" class="next">&#9654;</a></div></div>'),initialize:function(e){_.bindAll(this,"addImage","updateSrc","setDimentions","updateDimentions");var t=e.img.attr("src").replace("flickr://","");this.$el=$(this.el),this.ratio=this.options.img.attr("data-ratio"),this.image=new c({keywords:t,id:e.img.attr("id")}),this.image.flickrImages.bind("add",this.addImage),this.image.bind("change:src",this.updateSrc)},events:{"click .setupIcon":"clickSetup","click .flickrbombFlyout a.photo":"selectImage","click .flickrbombFlyout a.next":"nextFlickrPhotos","click .flickrbombFlyout a.prev":"prevFlickrPhotos"},render:function(){return $(this.el).html(this.template({id:this.image.id.replace(" ","")})),this.image.fetch(),this.ratio?this.$(".flickrbombWrapper").append('<img style="width: 100%;" class="placeholder" src="http://placehold.it/'+this.ratio+'" />'):this.resize(),this},updateSrc:function(e,t){var n=this;this.$("img.flickrbomb").css({top:"auto",left:"auto",width:"auto",height:"auto"}).attr("src","").bind("load",n.setDimentions).attr("src",t)},setDimentions:function(e){this.image.set({width:this.$("img").width(),height:this.$("img").height()}),this.updateDimentions(this.image),$(e.target).unbind("load")},updateDimentions:function(){var e=this.$("img.flickrbomb"),t=this.image.get("width"),n=this.image.get("height"),r=t/n,i=this.$("div.flickrbombWrapper").width(),s=this.$("div.flickrbombWrapper").height(),o=i/s;r<o?(e.css({width:"100%",height:null}),e.css({top:(s-e.height())/2+"px",left:null})):(e.css({height:"100%",width:null}),e.css({left:(i-e.width())/2+"px",top:null}))},addImage:function(e){this.flickrImageView=new p({model:e,image:this.image}),this.$(".flickrbombFlyout").append(this.flickrImageView.render().el)},clickSetup:function(e){e.preventDefault(),this.toggleFlyout()},toggleFlyout:function(e){this.$(".flickrbombFlyout").toggle()},selectImage:function(e){e.preventDefault(),this.toggleFlyout()},nextFlickrPhotos:function(e){e.preventDefault();var t=this;this.lock||(this.lock=!0,this.$(".flickrbombFlyout").find("a.photo").remove(),this.image.flickrImages.nextPage(function(){t.lock=!1}))},prevFlickrPhotos:function(e){e.preventDefault();var t=this;this.lock||(this.lock=!0,this.$(".flickrbombFlyout").find("a.photo").remove(),this.image.flickrImages.prevPage(function(){t.lock=!1}))},resize:function(){this.$("div.flickrbombWrapper").css({width:this.width()+"px",height:this.height()+"px"})},width:function(){return parseInt(this.options.img.width(),10)},height:function(){return parseInt(this.options.img.height(),10)}});$("body").click(function(e){!$(e.target).closest(".setupIcon").length&&!$(e.target).closest(".flickrbombFlyout").length&&$(".flickrbombFlyout").hide()}),this.ImageView=d,this.bomb=function(){var e=this;$("img[src^='flickr://']").each(function(){var t=$(this),n=new e.ImageView({img:t});t.replaceWith(n.render().el)})}};