(function(win,$){
	"use strict";
	win.coverBrowser = win.coverBrowser || {};
	
	var self = win.coverBrowser;
	
	self.utils = (function(){

		var getDir = function(of){

			var id = of,
				start = id.indexOf("cbcontrol") + 10,
				dir = id.substring(start,id.length);

			return dir;	

		};

		return {
			getDir : getDir
		};

	})();

	self.state = (function(){
		
		var classes = [],
			activeIndex = 0,
			stageDim = {},
			coverDim = {};
		
		return {
			classes : classes,
			activeIndex : activeIndex
		};
		
	})();
	
	self.actions = (function(){
		
		
		
		var moveRight = function(){
				
				if($(document).trigger("startmoveright")!==false){
					self.state.activeIndex = self.state.activeIndex-1;
					doMove();
				
				}
			},
		
			moveLeft = function(){
				
				if($(document).trigger("startmoveleft")!==false){
					
					self.state.activeIndex = self.state.activeIndex+1;
					
					doMove();
				}
			},
			
			doMove = function(){
				
				var activeIndex = self.state.activeIndex,
					$covers = $(".cbImage"),
					newActive,oldActive = $(".cbImage .active");
				
				$covers.each(function(i,e){
					
					if(i<activeIndex){
						
						this.className = "cbImage inactiveLeft inactiveLeft" + (activeIndex - i) ;
						
					}
					else if(i===activeIndex){
						this.className = "cbImage active";
						newActive = this;
					}
					else if(i>activeIndex){
					
						this.className = "cbImage inactiveRight inactiveRight" + ((activeIndex - i)*-1) ;
					
					}
				
				});
				
				$(document).trigger("endmove.cvr",[{"newActive":newActive,"oldActive":oldActive}]);
			
			}; 
		
		return {
			moveRight : moveRight,
			moveLeft : moveLeft,
			doMove : doMove
		};
		
	})();
	
	self.imgs = (function(){

		var report = function(el){
			
			console.log(el);
		
		};
		
		var attachEvents = function(){
			
			$(".cbImage").on("click",function(event){
				//move[dir] the number of times difference 
				//between index of active and index of clicked
				var dir = this.className.search(/left/gi) !==-1 ? "Right" : "Left",
					diff = dir==="Right" ? ($(".cbImage").index($(".cbImage.active")) - $(".cbImage").index(this)) :
							($(".cbImage").index($(".cbImage.active")) - $(".cbImage").index(this)) * -1,
					x;

				for(x=0;x<diff;x++){
					self.actions["move"+dir]();
				}
			});
		
		};

		return{
			attachEvents : attachEvents
		};

	})();

	self.controls = (function(){
		
		var attachEvents = function(){
			
			$(".cbcontrol").on("click",function(event){

				var 
					dir = self.utils.getDir(this.id),
					active = $(".cbImage.active"),
					makeActive = dir === "Right" ? active.prev(".cbImage") : active.next(".cbImage");
					
				if(makeActive.length>0){	
					self.actions["move"+dir]();
				}
			});
		
		};
		
		return {
			attachEvents : attachEvents
		};
	})();
	
	self.init = (function(){
		
		var classes = [],
			$covers = $(".cbImage"),
			cvrLength = $covers.length,
			$active = $covers.filter(".active"),
			activeIndex = $covers.index($active) !== -1 ? $covers.index($active) : 0,
			leftfac,
			rightfac,
			x,
			l = cvrLength*2,
			$newsheet = $("<style type='text/css' id='cbGeneratedClasses'></style>"),
			ss = $newsheet.appendTo("head")[0].sheet,
			z = 100,//TODO figure equation for zindex, increase closer to activeIndex, decrease after
			al;
			
		self.state.stageDim = {x:$(".stage").outerWidth(),y:$(".stage").outerHeight()};
		self.state.coverDim = {x:$active.outerWidth(),y:$active.outerHeight()}
		
		al = (self.state.stageDim.x / 2) - (self.state.coverDim.x / 2);
		
		ss.insertRule(".stage .active{left:"+al+"px;}",0);
		
		for(x=0;x<l;x++){
			
			//create an inactive class for each direction
			//for every element in the set
			leftfac = al - ((self.state.coverDim.x * x)/2) -  (self.state.coverDim.x/2);
			rightfac = al + ((self.state.coverDim.x * x)/2) + (self.state.coverDim.x/2);
			ss.insertRule(".inactiveLeft"+x+"{left:"+leftfac+"px;z-index:"+z+";}",0);
			ss.insertRule(".inactiveRight"+x+"{left:"+rightfac+"px;z-index:"+z+";}",0);
			
		}
		
		self.controls.attachEvents();

		self.imgs.attachEvents();
		
		self.state.activeIndex = activeIndex;
		
		self.actions.doMove();
		
	})();

})(window,jQuery);	