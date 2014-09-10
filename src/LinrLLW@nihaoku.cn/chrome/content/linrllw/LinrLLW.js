/**
 * @Filename: LinrLLW.js
 * @Name: LinrLightWeb Firefox addon
 * @namespace: linr
 * @Author: Linr Website: http://nihaoku.cn 
 * @Contact: MSN/QQ/Email: www@xiaogezi.cn
 *			 Twitter: vickeychen	
 *
 * Copyright (C) 2009-2012.10.18 Linr.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer. 
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution. 
 * 3.  Neither the name of Linr("LinrStudio") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission. 
 */

var lrLang={
	$LW_BDL:'llw-bundle',
	$LW_STR:function(name){
		return document.getElementById(lrLang.$LW_BDL).getString(name);
	},
	$LW_STRF:function(name, args){
		return document.getElementById(lrLang.$LW_BDL).getFormattedString(name, args);
	}
}


FBL.ns(function() { with (FBL) { 


var linr={
	loaded : false,
	get:function(o){
		return (typeof(o)=='string')?linr.paneDoc.document.getElementById(o):o;
	},
	win:document.defaultView,
	curMsObj:null,
	curMsEle:null,
	paneDoc:null,
	outline:'',
	action:'',
	doc:null,
	panelName:'LinrLLW',
	clipData:'',
	GRT:function(b){var a=b.offsetTop;while(b=b.offsetParent){a+=b.offsetTop}return(a)},
	GRL:function(b){var a=b.offsetLeft;while(b=b.offsetParent){a+=b.offsetLeft}return(a)},
	canHaveChildren:function(ele)
	{
		return !/^(area|base|basefont|col|frame|hr|img|br|input|isindex|link|meta|param)$/i.test(ele.tagName);
	},
	getEvtObj:function(e){
		var evt=window.event||e;
		return evt.srcElement||evt.target;
	},
	stopEvt:function(e){
		e.stopPropagation();
	},
	setOHTML:function(element, html){
		var doc = element.ownerDocument;
		var range = doc.createRange();
		range.selectNode(element || doc.documentElement);
		try
		{
			var fragment = range.createContextualFragment(html);
			var first = fragment.firstChild;
			var last = fragment.lastChild;
			element.parentNode.replaceChild(fragment, element);
			linr.ieMsDn(false, first);
			//linr.setRouterEvent(first,'mousedown',linr.doc);
			return [first, last];
		} catch (e)
		{
			return [element,element]
		}
		
	},
	getOHTML:function(obj){
		var attr;
		var attrs=obj.attributes;
		var str="<"+obj.tagName.toLowerCase();
		for(var i=0;i<attrs.length;i++){
			attr=attrs[i];
			if(attr.specified)
				str+=" "+attr.name+'="'+attr.value+'"';
		}
		if(!linr.canHaveChildren(obj))
			return str+">";
		return str+">"+obj.innerHTML.replace(/(\r?\n){2,}/g,'\r\n\r\n')+"</"+obj.tagName.toLowerCase()+">";
	},
	setHTML:function(obj,str)
	{
		var _tmphtm = linr.getOHTML(obj);
			linr.setOHTML(obj,_tmphtm+str);
	},
	str2obj:function(str,obj,cbk){
		var _jstr='';
		if(arguments.length>2){
			switch(cbk){
				case 0:
					_jstr = "return "+str+";"
				break;
				case 1:
					_jstr = str+";"
				break;
				case 2:
					
				break;
				
				default:
					_jstr = "return "+str+";"
			}
		}else{
			_jstr = "return arguments[0]."+str+"||arguments[0];"
		}
		var _ = (new Function(_jstr))(obj);
		return _;
	},
	setSHTML:function(obj,str)
	{
		var _tmphtm = linr.getSelectCtt();
		var _tphtmA = str.split('>');

		if(_tphtmA[1].indexOf('</')!=-1)
		{
			var _tpEnd = '<'+_tphtmA[1].split('<')[1]+'>';
		}else{
			_tpEnd = _tphtmA[1];
		}

		linr.insertHTML(_tphtmA[0]+'>'+_tmphtm+_tpEnd);
	},
	insertHTML:function(str)
	{
		linr.doc.execCommand('insertHTML',false, str);
	},
	tag:function(tagName,prop,d){var D=d||linr.doc;var A=D.createElement(tagName);if(prop===null)return A;for(p in prop){if(p=="class"){A.className=prop[p];}else if(p=="style"){for(s in prop[p]){A.style[s]=prop[p][s];}}else if(p==="innerHTML"){A.innerHTML=prop[p];}else if(prop[p]==="event"){for(e in prop[p]){A.setAttribute([e], prop[p][e]);}}else if(p==="appendTo"){prop[p].appendChild(A);}else if(p==="append"){A.appendChild(prop[p]);} else {A.setAttribute([p], prop[p]);}}return A;},
	str2num:function(s){
		if(s!='' || s!=null){return parseInt(s);};return 0;
	},
	getRnd:function(a){
		return Math.floor(Math.random()*a)+1;
	},
	mtAbs:function(n){
		return Math.abs(n);
	},
	dbgCss:function(n,o)
	{
		if(o.innerHTML==lrLang.$LW_STR("llwDisable"))
		{
			o.innerHTML=lrLang.$LW_STR("llwEnable");
			linr.doc.styleSheets[n].disabled=true;
		}
		else
		{
			o.innerHTML=lrLang.$LW_STR("llwDisable");
			linr.doc.styleSheets[n].disabled=false;
		}
	},
	createImg:function(o)
	{
		var e=LrGet('MaskImgDiv');
		var p=[linr.str2num(linr.getBgPos(o,0)),linr.str2num(linr.getBgPos(o,1))];
			e.style.top=linr.GRT(o)+p[1]+'px';
			e.style.left=linr.GRL(o)+p[0]+'px';
			e.innerHTML='<img id="llw-cs-img" src="'+linr.getBgUri(o).replace(/\"/g,'')+'" />';
	},
	getStyle:function(e, n){
		return linr.doc.defaultView.getComputedStyle(e,null).getPropertyValue(n);
	},
	getBgPos:function(e,n){
		var _pos = linr.getStyle(e, 'background-position');return (n)?_pos.split(' ')[n].replace('px',''):_pos;
	},
	getBgUri:function(e){
		var _bg = linr.doc.defaultView.getComputedStyle(e,null).getPropertyValue('background-image');return  (_bg.indexOf('url(')==-1)?'':_bg.substring(4,_bg.length-1);
	},
	makeDrag:function(o){
		
			o.addEventListener('mousedown',function(a){
			var d=linr.doc;
			if(!a)a=window.event;
			
			var x=a.layerX?a.layerX:a.offsetX,y=a.layerY?a.layerY:a.offsetY;
			if(o.setCapture)
				o.setCapture();
			else if(window.captureEvents)
				window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
			
			function lmsMvHdl(a){
				if(!a)a=window.event;
				if(!a.pageX)a.pageX=a.clientX;
				if(!a.pageY)a.pageY=a.clientY;
				var tx=a.pageX-x,ty=a.pageY-y;
				o.style.left=tx+'px';
				o.style.top=ty+'px';
				a.stopPropagation();
			}
			function lmsMuHdl(){
				if(o.releaseCapture)
					o.releaseCapture();
				else if(window.captureEvents)
					window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
				d.removeEventListener('mousemove',lmsMvHdl,false);
				d.removeEventListener('mouseup',lmsMuHdl,false);
				updateBgPos();
			}
			function updateBgPos(){
				var eL = linr.GRL(LrGet('MaskImgDiv'))-linr.GRL(LrGet('MaskDiv'));
				var eT = linr.GRT(LrGet('MaskImgDiv'))-linr.GRT(LrGet('MaskDiv'));
				var eU = LGet('#localUrlTxt').value;
				var eP = LGet('#idPicPos');
				
				var ct2 = 'position:absolute;left:'+eL+'px;top:'+eT+'px;';
				var _str='background:';
					linr.curMsObj.style.backgroundPosition=((eL==0)?'0':eL+'px')+' '+((eT==0)?'0':eT+'px');
					eP.value=linr.curMsObj.style.backgroundPosition;

					if(eU!='')
					{
						_str+='url('+eU+')';
					}
					if(eP.value!='')
					{
						_str+=' '+eP.value;
					}
					LGet('#resltPicCSSTxt').value=_str+';';
					LGet('#preCsImg').style.cssText=ct2;
			}
			d.addEventListener('mousemove',lmsMvHdl,false);
			d.addEventListener('mouseup',lmsMuHdl,false);
			linr.stopEvt(a);
			a.preventDefault();
		},false);
	},
	updateBgPos:function(){
		var eL = linr.GRL(LrGet('MaskImgDiv'))-linr.GRL(LrGet('MaskDiv'));
		var eT = linr.GRT(LrGet('MaskImgDiv'))-linr.GRT(LrGet('MaskDiv'));
		var eU = LGet('#localUrlTxt').value;
		var eP = LGet('#idPicPos');
		
		var ct2 = 'position:absolute;left:'+eL+'px;top:'+eT+'px;';
		var _str='background:';
			linr.curMsObj.style.backgroundPosition=((eL==0)?'0':eL+'px')+' '+((eT==0)?'0':eT+'px');
			eP.value=linr.curMsObj.style.backgroundPosition;

			if(eU!='')
			{
				_str+='url('+eU+')';
			}
			if(eP.value!='')
			{
				_str+=' '+eP.value;
			}
			LGet('#resltPicCSSTxt').value=_str+';';
			LGet('#preCsImg').style.cssText=ct2;
	},
	createMask:function(o)
	{
		var e=LrGet('MaskDiv');
		if(e==null)
		{
			var e=linr.doc.createElement('div');
				e.id='MaskDiv';
				e.className='MaskDiv';
				linr.doc.body.appendChild(e);
		}
			e.style.top=linr.GRT(o)+'px';
			e.style.left=(linr.GRL(o)-1)+'px';
			e.style.width=o.offsetWidth+'px';
			e.style.height=o.offsetHeight+'px';
	},
	TREE:function(d,b){if(d.nodeType==1){b.push('<div class="objectBox-element">','&lt;<span class="nodeTag">',d.nodeName.toLowerCase(),"</span>");for(var c=0;c<d.attributes.length;++c){var a=d.attributes[c];if(!a.specified){continue};var n=a.nodeName.toLowerCase(),v=a.nodeValue;if(n.indexOf('_moz_')!=0 && n.indexOf('xmlns')==-1)b.push(' <span class="nodeName">',n,'</span>=&quot;<span class="nodeValue">',linr.ESC(v),"</span>&quot;")}if(d.firstChild){b.push('&gt;</div><div class="nodeChildren">');for(var e=d.firstChild;e;e=e.nextSibling){linr.TREE(e,b)}b.push('</div><div class="objectBox-element">&lt;/<span class="nodeTag">',d.nodeName.toLowerCase(),"&gt;</span></div>")}else{if(linr.canHaveChildren(d)){b.push('&gt;&lt;/<span class="nodeTag">',d.nodeName.toLowerCase(),"&gt;</span></div>");}else{b.push("/&gt;</div>");}}}else{if(d.nodeType==3){b.push('<div class="nodeText">',linr.ESC(d.nodeValue),"</div>")}}},ESC:function(a){function b(c){switch(c){case"<":return"&lt;";case">":return"&gt;";case"&":return"&amp;";case"'":return"&#39;";case'"':return"&quot;"}return"?"}return String(a).replace(/[<>&"']/g,b)},
	selection:function(){
		return (linr.paneDoc.document && linr.paneDoc.document.getSelection)?linr.paneDoc.document.getSelection():null;
	},
	getFocusNode : function(ev){
		var doc = ev.target.ownerDocument;
		return doc.defaultView.getSelection().focusNode;
	},
	getSelectCtt:function()
	{
		return (content.getSelection)?content.getSelection().toString():'';
	},
	insertAtCarset:function(obj,prefix,suffix,htm){
		var _sl=linr.selection(),_s;
		_s=(_sl)?_sl.toString():'';
		if(htm){
			linr.paneDoc.document.execCommand('insertHTML',false, '<span contenteditable="false" id="_moz_tmp_tab" class="moz-tab">'+prefix+'<span id="_moz_tmp_tval" contenteditable="true" class="moz-tval">'+linr.ESC(_s)+'</span>'+suffix+'</span>');
			linr.destroyCarset(['_moz_tmp_tval','_moz_tmp_tab']);
		}else{
			linr.paneDoc.document.execCommand('insertHTML',false, '<span contenteditable="false" id="_moz_tmp_tag" class="moz-tag">'+linr.ESC(prefix)+'<span id="_moz_tmp_val" contenteditable="true" class="moz-val">'+linr.ESC(_s)+'</span>'+linr.ESC(suffix)+'</span>');
			linr.destroyCarset(['_moz_tmp_val','_moz_tmp_tag']);
		}
	},
	destroyCarset:function(arr){
		var _v=LGet('#' + arr[0]);
		if(_v){
			linr.paneDoc.document.execCommand('selectAll',false, '');
			_v.id='_moz_dirty';
			var _t=LGet('#' + arr[1]);
				if(_t){
					_t.contentEditable=true;
					_t.id='_moz_dirty';
				}
		}
	},
	setStore:function(n,v){
		content.localStorage.setItem(n,v);
	},
	getStore : function(n){
		return content.localStorage.getItem(n);
	},
	save:function(pth,content,chr,dlgModl,callback){
		if(!chr)chr='UTF-8';
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		if(dlgModl){
			var _path = linr.openDlg(pth).path;
				_path = (_path=="")?pth:_path;
		}else{
			var _path = pth;
		}

		file.initWithPath(_path);
		if (file.exists() == false) {
			file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
		}
		var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
			outputStream.init(file, 0x04 | 0x08 | 0x20, 420, 0);

		var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
			converter.charset = chr;

		var convSource = converter.ConvertFromUnicode(content);
		var result = outputStream.write(convSource, convSource.length);
			outputStream.close();
		if(callback){
			callback(_path);
		}else{
			alert(lrLang.$LW_STR("llwSaveIn")+_path);
		}
	},
	toArray : function(obj){
		return Array.prototype.slice.call(obj); 
	},
	attr : function(node, name, val){
		if(val){
			node.setAttribute(name, val);
		}else{
			return node.getAttribute(name);
		}
	},
	showHidden : function(pl, eo){
		
		linr.toArray(linr.doc.querySelectorAll('*', (pl || linr.doc.body))).forEach(function(el){
		 
			var tagName = linr.getTagName(el);
			var isFilter = (tagName == 'head' || tagName == 'script' || tagName == 'style');
			if(isFilter)return;
			
			var att = linr.attr(el, 'data-tmp-visible');
			if(att)return;
		 
			var display = linr.getStyle(el, 'display'),
				visibility = linr.getStyle(el, 'visibility'),
				width = linr.getStyle(el, 'width'),
				height = linr.getStyle(el, 'height');
		   
		  var csstext = ''; 
		  var offset = {'width' : el.offsetWidth, 'height' : el.offsetHeight};
		  
		  var hasStyle = el.hasAttribute('style'),
		   isTypeHidden = el.type && el.type == 'hidden',
		   isDisplayNone = display == 'none',
		   isVisibilityHidden = visibility == 'hidden',
		   isNoSize = width == 0 && height == 0 && offset.width == 0 && offset.height == 0;
		  
				if(isTypeHidden || isDisplayNone || isVisibilityHidden || isNoSize){
					linr.attr(el, 'data-tmp-visible', '1');
					if(hasStyle){
						csstext = linr.attr(el, 'style');
						linr.attr(el, 'data-style', csstext); 
					}
				if(isVisibilityHidden){
					el.style.cssText = csstext + ';visibility:inherit;';
				}
				if(isDisplayNone){
					el.style.cssText = csstext + ';display:inherit;';
				}
				if(isTypeHidden){
					linr.attr(el, 'data-type', 'hidden');
					el.type = 'text';
				}
		   }
		})
		if(eo){
			linr.attr(eo, 'rel', 'hidehidden');
			eo.innerHTML = lrLang.$LW_STR('llwHideHiddenElement');
		}
	},
	hideHidden : function(pl, eo){
	 var arr = linr.toArray(linr.doc.querySelectorAll('*[data-tmp-visible]', (pl || linr.doc.body)));
	 arr.forEach(function(el){
	  var csstext = linr.attr(el, 'data-style'),
	   datatype = linr.attr(el, 'data-type');
	   el.style.cssText = '';
	   el.removeAttribute('style');
	   if(csstext){
		el.style.cssText = csstext;
		el.removeAttribute('data-style');
	   }
	   if(datatype){
		el.type = datatype;
		el.removeAttribute('data-type');
	   }
	   el.removeAttribute('data-tmp-visible');
	 })
	 if(eo){
		linr.attr(eo, 'rel', 'showhidden');
		eo.innerHTML = lrLang.$LW_STR('llwShowHiddenElement');
	}
	},
	oDlg:function(str,md){
		//http://developer.mozilla.org/en/docs/XUL_Tutorial:Open_and_Save_Dialogs //https://developer.mozilla.org/en/NsIFilePicker
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
			
			if(md){
				fp.init(window,str, nsIFilePicker.modeSave);
				fp.appendFilter("All HTML Files","*.htm; *.html");
				fp.defaultExtension = "html";
				fp.defaultString = (!str)?"LinrLightWeb":str;
				fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterAll);
			
			}else{
				fp.init(window,str,nsIFilePicker.modeOpen);
			}
			var res = fp.show();
			if (res == nsIFilePicker.returnOK  || res == nsIFilePicker.returnReplace){
				return fp.file;
			}
			return "";
	},
	openDlg:function(dftStr){
		//http://developer.mozilla.org/en/docs/XUL_Tutorial:Open_and_Save_Dialogs //https://developer.mozilla.org/en/NsIFilePicker
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
			fp.init(window, lrLang.$LW_STR("llwSaveDlgTtl"), nsIFilePicker.modeSave);//modeOpen
			fp.appendFilter("All HTML Files","*.htm; *.html");
			fp.defaultExtension = "html";
			fp.defaultString = (!dftStr)?"LinrLightWeb":dftStr;
			fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterAll);
			var res = fp.show();
			if (res == nsIFilePicker.returnOK  || res == nsIFilePicker.returnReplace){
				return fp.file;
			}
			return "";
	},
	saveAs:function(_str,_filter){
		//http://developer.mozilla.org/en/docs/XUL_Tutorial:Open_and_Save_Dialogs
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
			fp.init(window, lrLang.$LW_STR("llwSaveDlgTtl"), nsIFilePicker.modeSave);//modeOpen
			fp.appendFilter("All HTML Files","*.htm; *.html");
			fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterAll);
			var res = fp.show();
			if (res == nsIFilePicker.returnOK  || res == nsIFilePicker.returnReplace){
			var thefile = fp.file;
			  
			 //http://developer.mozilla.org/en/docs/Code_snippets:File_I/O
			 var stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
					.createInstance(Components.interfaces['nsIFileOutputStream']);

			//initialize the stream (write | create | truncate)
			//write the spreadsheet and close
			stream.init(fp.file, 0x02 | 0x08 | 0x20, 0777, 0);
			stream.write(_str,_str.length);
			stream.close();
			  
			}
	},
	read:function(p){
		path = p.path;
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(path);
		if (file.exists() == false) {
			alert("File does not exist");
		}
		var is = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		is.init(file, 0x01, 00004, null);
		var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
		sis.init(is);
		
		var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		converter.charset = "UTF-8";
		var output = converter.ConvertToUnicode(sis.read(sis.available()));
		
		return output;
	},
	ajax:function(p,cbk,md){
	},
	copy:function(txt){
	var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
		   if(!clip)return;
		   var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
		   if(!trans)return;
			trans.addDataFlavor('text/unicode');
		   var str = new Object();
		   var len = new Object();
		   var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
		   var copytext = txt;
			str.data = copytext;
			trans.setTransferData("text/unicode",str,copytext.length*2);
		   var clipid = Components.interfaces.nsIClipboard;
		   if(!clip)return false;
			clip.setData(trans,null,clipid.kGlobalClipboard);
	},
	beforeSave:function(str){
		var _html=linr.doc.getElementsByTagName('html');
		var _xmlns=(_html[0])?_html[0].getAttribute("xmlns"):null;
		var	_xmlnstr = (_xmlns!=null)?' xmlns="'+_xmlns+'"':'';
		str = str.replace(/contenteditable="true"/gi,'');
		str = str.replace(/style=""/gi,'');
		str = str.replace(/<html>/gi,'<!doctype html><html>');
		if(_xmlns!=null){
			str = str.replace(' xmlns="'+_xmlns+'"','');
			str = str.replace(/<html>/gi,'<!doctype html><html>');
		}
		return str;
	},
	removeTmpEle:function(){
		var _lrkpssifm = LrGet('lr-keep-session');
		var _fbjs = LrGet('_firebugCommandLineInjector');
		var _fbcs = LrGet('_firebugConsole');
		var _lrqk = LrGet('lr-quick-dlg');
			if(_lrkpssifm!=null){
				_lrkpssifm.parentNode.removeChild(_lrkpssifm)
			}
			if(_fbjs){
				_fbjs.parentNode.removeChild(_fbjs);
			}
			if(_fbcs){
				_fbcs.parentNode.removeChild(_fbcs);
			}
			if(_lrqk){
				_lrqk.parentNode.removeChild(_lrqk);
			}
		var _cs=linr.doc.getElementsByTagName('style');
			for(var i=0,j=_cs.length;i<j;i++){
				if(_cs[i].innerHTML.indexOf('firebugHighlight')!=-1){
					try{_cs[i].parentNode.removeChild(_cs[i]);}catch(e){}
				}
			}
			linr.doc.body.removeAttribute('contenteditable');
	},
	loadSrc:function(p,t,i,c){
		if(LrGet(i)!=null)return;var l=(!c)?'utf-8':'gb2312';var e;if(t=='js'){e=linr.doc.createElement('script'); e.type='text/javascript';e.charset=l;e.src=p;}else{e=linr.doc.createElement('link'); e.setAttribute('rel', 'stylesheet'); e.setAttribute('id', i);e.setAttribute('type', 'text/css');e.charset=l;e.href=p;};linr.doc.getElementsByTagName('head')[0].appendChild(e);
	},
	str:{
		wrap:function(str,str1,str2,_std,_end){
			var _=str.split(str1);
			var __ = [];
			for(var i=0,j=_.length;i<j;++i)
			{
				if(_[i]!='')__.push(_[i]);
			}
			return _std+__.join(str2)+_end;
		}
	},
	checkCssJQ:function(cbk){
		var A=[],V=[],L=0,F=linr.doc.styleSheets;
		for(var i=0;i<F.length;i++)
		{
			var B = F[i].rules;
			for(var y=0;y<B.length;y++)V.push(B[y].selectorText);
		}
		for(var i=0;i<V.length;i++)
		{
			var C = V[i],a=cbk(C).length;
			A.push('<li rel="'+(L++)+'" class="lr-ckcss-'+((a==0)?'err':'ok')+'">['+C+'] '+((a==0)?lrLang.$LW_STR("llwUnUsed"):lrLang.$LW_STR("llwHave")+a+lrLang.$LW_STR("llwPer")+lrLang.$LW_STR("llwInstanse"))+'</li>');
		}
		A.push('<li class="lr-ckcss-all">used:'+(V.length-L)+'</li>');
		return '<ul>'+A.join('')+'</ul>';
	},
	docMode:function(a){
		if(a=='on'){
			linr.doc.designMode='on';
			linr.doc.body.contentEditable=true;
		}
		else{
			linr.doc.designMode='off';
			linr.doc.body.contentEditable=false;
			linr.doc.body.removeAttribute('contenteditable');
		}
	},
	timer:null,
	getAllTagFromCurEle:function(e){
		var i=0;var c=0;var t=[];var v=[];var a=e;
			t.push(getNodeInfo(e,i));
		while(linr.getTagName(e.parentNode)!='html')
		{
			i++;
			t.push(getNodeInfo(e.parentNode,i));
			e=e.parentNode;
		}
		t = t.reverse();
		if(a.hasChildNodes){
			var b=a.childNodes;
			for(var j=0,k=b.length;j<k;j++)
			{
				if(v.length>4)break;
				if(b[j].nodeType==1){
					c++;
					v.push(getNodeInfo(b[j],-1*c));
				}
			}
		}
		t = t.concat(v);
		function getNodeInfo(o,n)
		{
			return '<a'+((n==0)?' class="cur"':'')+' href="#" rel="'+n+'">&lt;'+linr.getTagName(o)+((o.id!='')?'#'+o.id:'')+((o.className!='')?'.'+o.className:'')+'&gt;<b>&#9660;</b></a>';
		}
		return t;
	},
	getTagName:function(ele){
		return ele.nodeName.toLowerCase();
	},
	getElement:function(o,x){
		var n=Number(x),s=[],_idx=-1;
		if(n>0){
			for(var i=0;i<n;i++){
				s.push('parentNode');
			}
			return linr.str2obj(s.join('.'),o);
		}else if(n<0){
			if(o.hasChildNodes){
				var _ea=o.childNodes;
				for(var i=0;i<_ea.length;i++){
					if(_ea[i].nodeType==1){
						if(n==_idx){
							break;
						}
						_idx-=1;
					}
				}
				return _ea[i];
			}else{
				return o;
			}
		}else{
			return o;
		}
		return o;
	},
	setRouterEvent:function(obj,ev,d){
		var win = (!d)?window.document:d;
		var clickEvent = win.createEvent("MouseEvent"); 
		clickEvent.initEvent(ev, false, true); 
		obj.dispatchEvent(clickEvent); 
	},
	exportEle2Img:function(pos,ext){
		//http://www.nihilogic.dk/labs/canvas2image/	[0,0,100,100]	
		linr.docMode('off');
		var win = content;						
		var w = pos[2]+pos[0];
		var h = pos[3]+pos[1];
		
		var canvas = linr.doc.createElementNS("http://www.w3.org/1999/xhtml", "html:canvas");
			canvas.style.width = pos[2]+"px";
			canvas.style.height = pos[3]+"px";
			canvas.width = pos[2];
			canvas.height = pos[3];
		
		var ctx = canvas.getContext("2d");
		  ctx.clearRect(pos[0], pos[1], w, h);
		  ctx.save();
		 //ctx.scale(canvasW/w, canvasH/h);//content.open(canvas.toDataURL("image/png", "").replace("image/png",""));
		  ctx.drawWindow(win, pos[0], pos[1], w, h, "rgb(255,255,255)");
		  ctx.restore();
		win.open(canvas.toDataURL("image/png",""),'','width='+w+',height='+h);
		linr.docMode('on');
	},
	quickDlg:function(ev){
		if(linr.getTagName(linr.curMsObj)=='body')return;
		linr.docMode('off');
		var qk=LrGet('lr-quick-dlg');
		var sk='color:#276B0E;border:1px solid #E1E1E1;-moz-border-radius:2px;font-size:12px;padding:3px;vertical-align:middle;';
		if(!qk){
			qk=linr.doc.createElement('pre');
			qk.id='lr-quick-dlg';
			qk.setAttribute('style','position:absolute;z-index:10886;padding:5px;border:1px solid #e1e1e1;-moz-border-radius:3px;background:#fff;-moz-box-shadow:0 1px 1px rgba(0, 0, 0, 0.5);top:0;left:0;');
			linr.doc.documentElement.appendChild(qk);
			qk.addEventListener('mousedown',function(ev){
				linr.stopEvt(ev);
			},false);
			qk.addEventListener('mouseover',function(){
				linr.docMode('off');
				this.style.display='block';
			},false);
			qk.addEventListener('mouseout',function(){
				linr.docMode('on');
				this.style.display='none';
			},false);
		}
		qk.style.display='block';
		qk.style.left=linr.GRL(linr.curMsObj)+'px';
		qk.style.top=linr.GRT(linr.curMsObj)+18+'px';
		qk.innerHTML='<textarea id="lr-quick-txt" style="width:450px;height:60px;'+sk+'" >'+linr.curMsObj.innerHTML+'</textarea><br/>\
		<input type="text" size="3" style="'+sk+'" id="lr-quick-split-txt" value="," title="'+lrLang.$LW_STR("llwQikDlgSplTtl")+'" /> \
		<input type="text" size="4" value="li" style="'+sk+'" id="lr-quick-tag-txt" title="'+lrLang.$LW_STR("llwQikDlgCvtTagTtl")+'" /> \
		<input type="button" value="'+lrLang.$LW_STR("llwQikDlgCvtBtn")+'" style="'+sk+'" id="lr-quick-cvt-btn" />';
		var qkt=LrGet('lr-quick-txt');
		if(qkt){
			qkt.select();
			qkt.addEventListener('keyup',function(){
				linr.curMsObj.innerHTML=this.value;
			},false);
			LrGet('lr-quick-cvt-btn').addEventListener('click',function(){
				
				var spl=LrGet('lr-quick-split-txt').value;
				var tag=LrGet('lr-quick-tag-txt').value;
					spl=(spl=='')?',':spl;
				var arr=qkt.value.split(spl);
				var str='';
				var tmp=[];
				for(var i=0;i<arr.length;i++){
					tmp.push(arr[i]);
				}
				tag=(tag=='')?'li':tag;
				switch(tag){
					case 'li':
					case 'ul>li':
						str = '<ul><li>'+tmp.join('</li><li>')+'</li></ul>';
					break;
					case 'li>a':
						str = '<ul><li><a>'+tmp.join('</a></li><li><a>')+'</a></li></ul>';
					break;
					case 'dd':
						str = '<dt><dd>'+tmp.join('</dd><dd>')+'</dd></dl>';
					break;
					case 'a>span':
						str = '<a><span>'+tmp.join('</span></a><a><span>')+'</span></a>';
					break;
				}
				qkt.value=str;
			},false);
			
		}
	},
	enumSelector:function(tp,sc){
		var arr=linr.doc.querySelectorAll("*");//getElementsByTagName
		var ids=[],cls=[];
		for(var i=0;i<arr.length;i++){
			if(arr[i].id && arr[i].id.indexOf('lr-')==-1){
				ids.push(arr[i].id);
			}
			if(arr[i].className && arr[i].className.indexOf('lr-')==-1){
				cls = arr[i].className.split(" ");
			}
		}
		if(tp=='#'){
			return ids;
		}else if(tp=='.'){
			return cls;
		}else{
			return ids.concat(cls);
		}
	},
	insertCarepos:function(obj,v){
		try{
		var startPos = obj.selectionStart;
		var endPos = obj.selectionEnd;
		obj.value = obj.value.substring(0, startPos)
		+ v
		+ obj.value.substring(endPos, obj.value.length);

		obj.focus();                
		obj.setSelectionRange(endPos+v.length,endPos+v.length);
		}catch(e){alert(e);}
	},
	setEnumSelector:function(id,arr,ev,cssproperty){
		var doc = ev.target.ownerDocument;
		var fn = doc.defaultView.getSelection().focusNode;
		
		var eo = fn.nodeName=='#text' ? fn.parentNode : fn;
		
		var htm = [];
		for(var i=0;i<arr.length;i++){
			if(arr[i]!=''){
				if(cssproperty=='cssproperty'){
					htm.push('<option rel="cssproperty" value="'+arr[i] + ':' + '">'+arr[i]+'</option>');
				}else{
					htm.push('<option value="'+arr[i] + '">'+arr[i]+'</option>');
				}
			}
		}
		LGet('#' + id).style.display='block';
		LGet('#' + id).innerHTML='<select size="10" rel="'+cssproperty+'" id="lr-enum-selector-cmb">'+htm.join('')+'</select>';
		if(eo){
			LGet('#' + id).style.top = eo.offsetTop+20+'px';
			LGet('#' + id).style.left = eo.offsetLeft+'px';
		}
		LGet('#lr-enum-selector-cmb').addEventListener('dblclick',function(evt){
		},false);
		LGet('#lr-enum-selector-cmb').addEventListener('keypress',function(evt){
			if(evt.keyCode==13){
				var rel = this.getAttribute('rel');
				if(rel=='cssproperty'){
					var val = this.value;
					
					linr.insertAtCarset(LGet('#lr-mini-txt'),'<span class="nodeName">'+val+'</span><span contenteditalbe="true"><span class="nodeValue"> ','</span></span>',true);
					switch(val.replace(':','')){

						case 'width':
						case 'height':
						case 'margin':
						case 'padding':
						case 'margin':
						case 'z-index':
						case 'border':
						case 'border-radius':
						case 'outline':
						case 'letter-spacing':
						case 'line-height':
						case 'text-indent':
						case 'font':
						case 'top':
						case 'left':
						case 'right':
						case 'bottom':
						case 'content':
							LGet('#' + id).style.display = 'none';
							
						break;
						
						case 'color':
						case 'background':
						case 'background-color':
						case 'border-color':
							LGet('#' + id).style.display = 'none';
							break;
						
						case 'background-image':

						break;
						
						default:
							linr.setEnumSelector('lr-enum-selector',fbXPCOMUtils.cssKeywords[val.replace(':','')],ev,'cssvalue');
							LGet('#lr-enum-selector-cmb').focus();
						break;
					}
					
				}else if(rel=='cssvalue'){
					linr.insertAtCarset(LGet('#lr-mini-txt'),'<span class="nodeValue">'+this.value+'</span>','',true);
					LGet('#' + id).style.display = 'none';
				}
				else{
					linr.insertAtCarset(LGet('#lr-mini-txt'),'<span class="nodeTag">'+this.value+'</span>{<br/>&nbsp;&nbsp;&nbsp;&nbsp;<span id="_moz_tmp_css" contentEditable="true">','</span><br/>}',true);
					linr.setEnumSelector('lr-enum-selector',linr.arr.csspro,ev,'cssproperty');
					LGet('#lr-enum-selector-cmb').focus();
				}
				LGet('#lr-mini-txt').focus();
				linr.stopEvt(evt);
			}
		},false);
		LGet('#lr-enum-selector-cmb').addEventListener('mouseover',function(evt){
			LGet('#' + id).style.display='block';
		},false);
		LGet('#lr-enum-selector-cmb').addEventListener('mouseout',function(evt){
			LGet('#' + id).style.display='none';
			//LGet('#lr-mini-txt').innerHTML = linr.arr.csspro.join(',');
		},false);
		
	},
	arr : {
			csspro :'appearance,background,background-clip,background-color,background-image,background-inline-policy,background-origin,background-position,background-repeat,border,border-radius,binding,border-bottom,border-collapse,border-color,border-end,border-end-color,border-end-style,border-end-width,border-image,border-radius-bottomleft,border-radius-bottomright,border-radius-topleft,border-radius-topright,border-spacing,border-start,bottom,box-align,box-direction,box-flex,box-ordinal-group,box-orient,box-pack,box-shadow,box-sizing,caption-side,clear,clip,color,column-count,column-gap,column-rule,column-rule-color,column-rule-style,column-rule-width,column-width,content,counter-increment,counter-reset,cursor,direction,display,empty-cells,float,font,font-family,font-size,font-weight,height,image-region,ime-mode,left,letter-spacing,line-height,list-style,list-style-type,margin,margin-bottom,margin-left,margin-right,margin-top,marker-offset,max-height,max-width,min-height,min-width,opacity,outline,outline-color,outline-style,outline-width,overflow,overflow-x,overflow-y,padding,padding-bottom,padding-left,padding-right,padding-top,position,quotes,right,table-layout,text-align,text-decoration,text-indent,text-rendering,text-shadow,text-transform,top,transform,transform-origin,unicode-bidi,user-focus,user-input,user-modify,user-select,vertical-align,visibility,white-space,width,word-spacing,word-wrap,z-index'.split(',')/*(function(){
					var tmp=[];
					for(var a in fbXPCOMUtils.cssInfo){
						if(a.indexOf('-moz-')==0){
							tmp.push(a.replace(/\-moz\-/gi,''));
						}else{
							tmp.push(a);
						}
					}
					
					return tmp.sort();
				})()*/
	},
	miniDlg:function(nm){
		
		var em=LGet('#lr-mini-dlg'),so;
		if(!em){
			em=linr.tag('div',{'id':'lr-mini-dlg','class':'lr-ijdlg','innerHTML':'<div class="lr-pa" id="lr-enum-selector"></div> <input type="button" value="OK" class="lr-btn" id="lr-mini-ok" /> <div contentEditable="true" class="lr-txt" id="lr-mini-txt" style="width:'+(linr.doc.documentElement.clientWidth-40)+'px;height:350px;line-height:1.5;" ></div>','appendTo':LGet('#lr-wyw-editor')});
			
			LGet('#lr-mini-ok').addEventListener('click',function(ev){
				var hd = linr.doc.getElementsByTagName("HEAD").item(0),cs = LrGet('lr-tmp-style'),js = LrGet('lr-tmp-script');
				var rs = em.getAttribute('rel');
				if(rs=='css'){
					if(cs)hd.removeChild(cs);
					//alert(LGet('#lr-mini-txt').textContent.replace(/\s{4,}/g,''));
					linr.tag('style',{'id':'lr-tmp-style','type':'text/css','class':'lr-tmp','innerHTML':LGet('#lr-mini-txt').textContent.replace(/\s{4,}/g,''),'appendTo':hd});
				}else{
					if(js)linr.doc.body.removeChild(js);
					linr.tag('style',{'id':'lr-tmp-script','type':'text/javscript','class':'lr-tmp','innerHTML':LGet('#lr-mini-txt').textContent,'appendTo':linr.doc.body});
				}
				LGet('#lr-mini-dlg').style.display='none';
			},false);
			
			LGet('#lr-mini-txt').addEventListener('keydown',function(ev){
				//alert(ev.keyCode);
				if(ev.ctrlKey){
					if(ev.keyCode==76){
						//Firebug.Console.log(fbXPCOMUtils.cssInfo);
						//linr.paneDoc.document.execCommand('selectAll',false, '');
						linr.setEnumSelector('lr-enum-selector',linr.arr.csspro,ev,'cssproperty');
						ev.preventDefault();
					}
					
				}else{
					if(ev.keyCode==190){
						linr.setEnumSelector('lr-enum-selector',linr.enumSelector('.'),ev);
					}else if(ev.shiftKey && ev.keyCode==51){
						linr.setEnumSelector('lr-enum-selector',linr.enumSelector('#'),ev);
					}else if(ev.keyCode==40){
						var cmb=LGet('#lr-enum-selector-cmb');
						if(cmb){
							cmb.focus();
						}
					}else if(ev.keyCode==59){
						linr.setEnumSelector('lr-enum-selector',linr.arr.csspro,ev,'cssproperty');
					}else if(ev.keyCode==9){
						//ev.preventDefault();
						//linr.insertAtCarset(LGet('#lr-mini-txt'),'<span class="nodeValue">&nbsp;&nbsp;&nbsp;&nbsp;</span>','',true);
						
					}else{
						//ev.preventDefault();
					}
				}
				
				linr.setStore('llwCSSls',this.innerHTML);
				//linr.setRouterEvent(LGet('#lr-enum-selector-cmb'),'keydown');
				
			},false);
			LGet('#lr-mini-txt').addEventListener('keyup',function(ev){
				linr.staticDlg();
			},false);
			LGet('#lr-mini-txt').addEventListener('click',function(ev){
			var el = linr.getFocusNode(ev);
				//Firebug.Console.log(el);
			},false);
		}
		em.style.display='block';
		em.setAttribute('rel',nm);
		so=LGet('#lr-mini-txt');
		so.innerHTML='<div class="moz-val"></div>';
		
		var ls_css = linr.getStore('llwCSSls');
			if(ls_css!=''){
				LGet('#lr-mini-txt').innerHTML = ls_css;
			}
		
		if(nm=='css'){
			if(LrGet('lr-tmp-style'))so.innerHTML=LrGet('lr-tmp-style').innerHTML;
		}else{
			if(LrGet('lr-tmp-script'))so.innerHTML=LrGet('lr-tmp-script').innerHTML;
		}
		so.focus();
	},
	staticDlg:function(){
		if(LGet('#lr-mini-ok') && LGet('#lr-mini-dlg')){
			LGet('#lr-mini-ok').click();
			LGet('#lr-mini-dlg').style.display='block';
		}
	},
	keepSession:function(o,s){
		if(s=='on'){
			var _url = linr.doc.location.href;
			
			var ifm = LrGet('lr-keep-session');
			
			if(_url.indexOf('onmin')==-1){
			
				if(ifm==null){
					ifm = linr.doc.createElement('iframe');
					ifm.setAttribute('id','lr-keep-session');
					ifm.setAttribute('name','lr-keep-session');
					ifm.setAttribute('src',_url);
					ifm.setAttribute('width','0');
					ifm.setAttribute('height','0');
					linr.doc.documentElement.appendChild(ifm);
				}
				linr.timer = content.setInterval(function(){
					LrGet('lr-keep-session').src = linr.doc.location.href+'?t='+linr.getRnd(999999);
				},50000);
			}else{
				ifm.parentNode.removeChild(ifm)
			}
			o.innerHTML=lrLang.$LW_STR("llwDisable");
		}else{
			content.clearInterval(linr.timer);
			o.innerHTML=lrLang.$LW_STR("llwEnable");
		}
	},
	drawUI:function(){

		var _cssTxt = ' class="lr-txt" style="width:360px';
		var _cxtMn = ' oncontextmenu="this.select();"'
		
		var _edit_htm = '<div id="lr-wyw-editor" class="lr-wp"><div id="llw-all-htm-panel" style="padding:5px 12px;line-height:22px;">\
		<div id="llw-all-tag-panel" class="lr-tagpane">' + lrLang.$LW_STR("llwInspectorTips") + '</div><div id="llw-pro-qikly" class="lr-row" style="display:none;"><label>'+lrLang.$LW_STR("llwCurTag")+'<input type="text" id="cur-tag-em" class="lr-txt" size="4" readonly="readonly" title="'+lrLang.$LW_STR("llwReadOnly")+'" /></label> <span id="llw-pro-qikly-spn">\
			<label>Class'+lrLang.$LW_STR("llwZhColon")+'<input type="text" id="qkset-class" class="lr-txt" title="'+lrLang.$LW_STR("llwModifyTagClassName")+'" /></label>\
			<label>ID'+lrLang.$LW_STR("llwZhColon")+'<input type="text" id="qkset-id" class="lr-txt" size="10" title="'+lrLang.$LW_STR("llwModifyTagId")+'" /></label></span> <a href="#" id="qkset-htm-lnk">HTML<span class="small">&#9660;</span></a> <span id="lr-htm-sg" class="undis">\
			<input type="button" class="lr-btn" value="'+lrLang.$LW_STR("llwUpdate")+'" id="qkset-htm-updt" />\
			<input type="button" class="lr-btn" value="Save to tmp" id="lr-sv-sg" />\
			<input type="button" class="lr-btn" value="Load from tmp" id="lr-ld-sg" /> \
			<input type="button" class="lr-btn" value="Copy" id="lr-copy-sg" /> \
			<input type="button" class="lr-btn undis" value="Open file.." id="lr-op-lf" />\
		</span><a href="#" id="lr-strtst-lnk" class="undis">'+lrLang.$LW_STR("llwTestDataLbl")+'</a> <span id="lr-strtst-pane" class="undis"></span>\
			<div id="qkset-htm-spn" class="undis"><div id="qkset-htm" class="lr-txt lr-txt-qkset vt" contenteditable="true"><span style="padding:0 1px;"> <span>\r\n</div> </div></div>\
			\
			\
		<div id="llw-all-htm-act">\
			<div class="lr-pa lr-qk-pl"><label class="lr-label">'+lrLang.$LW_STR("llwFileLbl")+'</label><input class="undis" type="button" value="'+lrLang.$LW_STR("llwSave")+'" id="lr-htm-resave-lnk" /> <input class="lr-btn-ok" type="button" value="'+lrLang.$LW_STR("llwSave")+'" id="lr-htm-save-lnk" /> <input class="lr-btn-ok" type="button" value="'+lrLang.$LW_STR("llwEditMode")+'" id="lr-htm-prv-lnk" title="'+lrLang.$LW_STR("llwSwitchView")+'" /> <a href="#" id="lr-htm-save-info" title="'+lrLang.$LW_STR("llwOpenInNewTab")+'" class="green b"></a></div>\
			</div>\
			<p style="color:#aaa" class="undis">'+lrLang.$LW_STR("llwHTMLEditorDesc1")+'<a href="#" id="lr-htm-akey-lnk">'+lrLang.$LW_STR("llwHTMLEditorDesc2")+'</a><p>\
			<pre id="lr-htm-akey-panel" class="undis" style="color:#666"><strong>'+lrLang.$LW_STR("llwZhQuot")+'<span class="ft-red">|</span>'+lrLang.$LW_STR("llwWrapDesc1")+'</strong>\r\
	Ctrl+K    &lt;a href=&quot;#&quot;&gt;<span class="ft-red">|</span>&lt;/a&gt;\r\
	Ctrl+L    &lt;li&gt;<span class="ft-red">|</span>&lt;/li&gt;\r\
	Ctrl+D    repeat selection\r\
	Ctrl+E    &lt;em&gt;<span class="ft-red">|</span>&lt;/em&gt;\r\
	Ctrl+B    &lt;input type=&quot;button&quot; value=&quot;<span class="ft-red">|</span>&quot; /&gt;\r\
	Ctrl+P    &lt;img src=&quot;<span class="ft-red">|</span>&quot; alt=&quot;&quot; /&gt;\r\
	Ctrl+Q    class=&quot;<span class="ft-red">|</span>&quot;\r\
	Ctrl+N    &lt;span&gt;<span class="ft-red">|</span>&lt;/span&gt;\r\
	Ctrl+I    id=&quot;<span class="ft-red">|</span>&quot;\r\
	Ctrl+2    &lt;h2&gt;<span class="ft-red">|</span>&lt;/h2&gt;\r\
	Ctrl+3    &lt;h3&gt;<span class="ft-red">|</span>&lt;/h3&gt;\r\
	Ctrl+&#39;    &quot;<span class="ft-red">|</span>&quot;\r\
	Ctrl+.    &lt;/<span class="ft-red">|</span>&gt;\r\
	Ctrl+,    &lt;<span class="ft-red">|</span>&gt;\r\
	Ctrl+/    &lt;!-- <span class="ft-red">|</span> --&gt;\r\
	Ctrl+[    [&#39;<span class="ft-red">|</span>&#39;]\r\
	Ctrl+]    (&#39;<span class="ft-red">|</span>&#39;)\r\
</pre></div>\
			<!-- tag menu --><div id="lr-tag-menu" class="ui-menu undis ' + lrLang.$LW_STR("llwUiMenuCssClass") + '"><ul>\
	<li class="ui-menu-c2"><a href="#" class="ui-menu-rl" id="tag-edt-lnk" title="'+lrLang.$LW_STR("llwEditTagTitle")+'">'+lrLang.$LW_STR("llwEditTagItem")+'<span class="ui-menu-dlg">◢</span></a><a href="#" class="ui-menu-rr" id="tag-insert-lnk">' + lrLang.$LW_STR("llwAddNewNode") + '<span class="ui-menu-dlg">◢</span></a></li>\
	<li class="ui-menu-c3"><a href="#" class="ui-menu-rl" id="tag-cttdel-lnk" title="'+lrLang.$LW_STR("llwRemoveTagAndTitle")+'">'+lrLang.$LW_STR("llwRemoveTagAndItem")+'</a><a href="#" class="ui-menu-rm" id="tag-cpy-lnk" title="'+lrLang.$LW_STR("llwCopyTagToMemoryTitle")+'">'+lrLang.$LW_STR("llwCopyTagToMemoryItem")+'</a><a href="#" class="ui-menu-rr" id="tag-pst-lnk" title="'+lrLang.$LW_STR("llwPasteTagTitle")+'">'+lrLang.$LW_STR("llwPasteTagItem")+'</a></li>\
	<li class="ui-menu-c2"><a href="#" class="ui-menu-rl" id="tag-del-lnk" title="'+lrLang.$LW_STR("llwRemoveNodeTitle")+'">'+lrLang.$LW_STR("llwRemoveNodeItem")+'</a><a href="#" class="ui-menu-rr" id="tag-highlt-lnk" title="'+lrLang.$LW_STR("llwViewInDOMTreeTitle")+'">'+lrLang.$LW_STR("llwViewInDOMTreeItem")+'</a></li>\
	<li class="ui-menu-c2"><a href="#" class="ui-menu-rl" id="tag-query-lnk" title="Find tags and replace action via Selector">Selector<span class="ui-menu-dlg">◢</span></a><a href="#" class="ui-menu-rr" id="tag-exportdom-lnk">Export DOM<span class="ui-menu-dlg">◢</span></a></lsi>\
	<li class="ui-menu-c2"><a href="#" class="ui-menu-rl" id="tag-exppic-lnk" title="'+lrLang.$LW_STR("llwExportDomToPicTitle")+'">'+lrLang.$LW_STR("llwExportDomToPicItem")+'</a><a href="#" class="ui-menu-rr" id="tag-3d-lnk" title="3D Wall">3D Wall</a></li>\
	</li></ul></div><!-- /tag menu -->\
	'+
	'<div class="undis" id="lr-html-tags">\
		<label for="lr-tag-txt">Selector：</label><em>&lt;</em><input title="'+lrLang.$LW_STR("llwTagTagTtl")+'" style="color:#840084;width:68px;" _width="68" type="text" class="txt" id="lr-tag-txt" rel="[selector]" value="[selector]" /> \
		<label for="lr-attr-txt">Attribute：</label><input style="color:#f00;width:68px;" _width="68" type="text" class="txt" id="lr-attr-txt" rel="[any attr]" value="[any attr]" />\
		<em>="</em> \
		<label for="lr-vals-txt">Value：</label><input title="'+lrLang.$LW_STR("llwTagValTtl")+'" style="color:#f00;width:55px;" _width="55" type="text" class="txt" id="lr-vals-txt" rel="[value]" value="[value]" /><em>"&gt;</em>\
		<label for="lr-vals-txt">Content：</label><input title="'+lrLang.$LW_STR("llwTagCttTtl")+'" style="color:#666;" type="text" class="txt" id="lr-htmctt-txt" rel="[innerHTML]" value="[innerHTML]" size="15" _width="76" />\
		<input type="button" class="lr-btn" id="lr-okbtn" value="'+lrLang.$LW_STR("llwTagDlgCls")+'" />\
		<div id="lr-tag-action">\
			<a href="#" id="lr-del-lnk" title="'+lrLang.$LW_STR("llwTagDelAllTtl")+'">'+lrLang.$LW_STR("llwTagDelAll")+'</a>\
			<a href="#" id="lr-rel-lnk" title="'+lrLang.$LW_STR("llwTagRdTagTtl")+'">'+lrLang.$LW_STR("llwTagRdTag")+'</a>\
			<a href="#" id="lr-chg-lnk" class="undis">'+lrLang.$LW_STR("llwTagRplceTag")+'</a>\
			<a href="#" id="lr-set-lnk" class="undis">'+lrLang.$LW_STR("llwTagSetting")+'</a>\
			</div>\
			<div id="lr-html-pl" class="undis">\
			<textarea id="lr-html-txt" cols="110" rows="15"></textarea>\
			</div>\
	</div>\
	<div class="undis" id="lr-tb-ctr">\
	<div style="width:140px;display:inline-block;vertical-align:top;">\
		<div id="lr-tb-pl" class="lr-tb-pl"></div>\
		<div id="lr-tb-tip" class="pt5" style="color:#f30;"></div>\
		<input type="text" id="lr-tb-cls" value="" class="undis" size="30" title="using &quot;,&quot; to separate each class." />\
	</div>\
	<ul style="width:80px;display:inline-block;">\
		<li><input type="button" id="lr-tb-ok" value="OK" class="lr-btn" title="Press ctrl key reset" /></li>\
		<li style="padding-top:10px"><label><input type="checkbox" id="lr-tb-thd" value="" />thead</label></li>\
		<li><label><input type="checkbox" id="lr-tb-tft" value="" />tfoot</label></li>\
		<li><label><input type="checkbox" id="lr-tb-bd" value="" checked="checked" />border</label></li>\
		<li><label><input type="checkbox" id="lr-tb-scls" value="" />class</label></li>\
	</ul>\
</div>\
<div id="lr-textctt-pl" class="lr-dlg undis"><textarea style="width:450px;height:60px;" id="lr-textctt-txt" class="lr-txt vt"></textarea></div>\
\
\
<div id="lr-all-htm-tlbar" class="ui-menu ui-tagpane undis"><span id="llw-ist-tg-spn" class="ui-menu-cnt">\
	<input type="button" class="lr-btn" rel="<div>DIV</div>" value="div" />\
	<input type="button" class="lr-btn" rel="<a href=&quot;#&quot;>'+lrLang.$LW_STR("llwLink")+'</a>" value="a" />\
	<input type="button" class="lr-btn" rel="<span>span</span>" value="span" />\
	<input type="button" class="lr-btn" rel="<em>EM</em>" value="em" />\
	<input type="button" class="lr-btn" rel="<img src=&quot;https://addons.cdn.mozilla.net/img/uploads/addon_icons/14/14068-64.png?modified=1317877803&quot; />" value="img" />\
	<input type="button" class="lr-btn" rel="<h3>h3</h3>" value="h3" />\
	<input type="button" class="lr-btn" rel="<h2>h2</h2>" value="h2" />\
	<input type="button" class="lr-btn" rel="table" value="table" />\
	<input type="button" class="lr-btn" rel="<li>li</li>" value="li" />\
	<input type="button" class="lr-btn" rel="<p>p</p>" value="p" />\
	<input type="button" class="lr-btn" rel="<dd>dd</dd>" value="dd" />\
	<input type="button" class="lr-btn" rel="<input />" value="input" />\
	<input type="button" class="lr-btn" rel="<label>label</label>" value="label" />\
	<input type="button" class="lr-btn" rel="<ul>ul</ul>" value="ul" />\
	<input type="button" class="lr-btn" rel="<dl>dl</dl>" value="dl" />\
	</span></div>\
\
\
<a href="#!/start/" id="lr_logo_small" title="start">Logo</a>'; 

		var _cssprite_htm = '<div id="lr_css_sprite_mask" class="undis ui-mask"></div><div id="lr-css-sprite" class="undis" style="padding-right:40px;">\
		\
			<div class="lr-item lr-pr">\
				<label class="lr-label"><strong>background-image:</strong></label><input id="localUrlTxt" '+_cssTxt+'" title="'+lrLang.$LW_STR("llwContextMenuCopyPaste")+'"'+_cxtMn+' type="text" value="" />\
				<span class="lr-pa" style="left:543px;top:5px;width:35px;opacity:0;overflow:hidden;"><input type="file" id="localUrlFile" style="margin-left:-158px;" /></span>\
				<input class="lr-btn" type="button" id="" value="..." class="linrBtn" title="'+lrLang.$LW_STR("llwOpenDlg")+'" /> <input class="lr-btn" type="button" id="localUrlBtn" value="'+lrLang.$LW_STR("llwLoad")+'" class="linrBtn" title="'+lrLang.$LW_STR("llwLoadPic")+'" />\
			</div>\
			<div class="lr-item">\
				<label class="lr-label"><strong>background-position:</strong></label>\
				<input type="text" id="idPicPos" ' + _cxtMn + ' title="'+lrLang.$LW_STR("llwContextMenuCopyPaste")+'" '+_cssTxt+'" />\
				<input class="lr-btn" type="button" id="preCsBtn" value="'+lrLang.$LW_STR("llwPreview")+'" title="'+lrLang.$LW_STR("llwCSSPreview")+'" />\
			</div>\
			<div class="lr-item">\
				<label class="lr-label"><strong>'+lrLang.$LW_STR("llwCSSSpriteLbl")+'</strong></label><textarea rows="3" id="resltPicCSSTxt"'+_cssTxt+';vertical-align:3px;"'+_cxtMn+'></textarea>\
				<a class="cssPrevew" id="preCsPane"><img id="preCsImg" /></a>\
			</div>\
		<a href="#lr-css-sprite" class="ui-xbox-close" id="lr_css_sprite_close">x</a></div>';	

		var _refresh_htm = '<div class="undis ui-xbox lr-css-dlg" id="lr-refress-css"><a href="#lr-refress-css" class="ui-xbox-close">x</a><div id="llw-all-css-panel" style="padding:0 15px;overflow:hidden;"><h3>'+lrLang.$LW_STR("llwRefreshCSSOk")+'</h3><ol id="lr-css-list"></ol><p style="color:#aaa">'+lrLang.$LW_STR("llwRefreshCSSTips")+'</p></div><div class="lr-item"><label class="lr-label">'+lrLang.$LW_STR("llwLoadCSS")+'</label><input type="text" class="lr-txt" id="lr-css-url-txt" value="" /> <span class="lr-file-pane"><input class="lr-btn" type="button" value="..." /><input class="lr-file" type="file" id="lr-css-url-file" /></span><input class="lr-btn" type="button" value="'+lrLang.$LW_STR("llwLoad")+'" id="lr-css-ipt-btn" /></div></div>';

		var _splash_htm = '<div id="lr-spash" class="ui-xbox undis"><a href="#lr-spash" class="ui-xbox-close">x</a><div style="padding:0 15px;overflow:hidden;"><h3 style="display:inline-block;float:left;width:150px;height:150px;" title="'+lrLang.$LW_STR("llwTitle")+'"><img src="chrome://linrllw/content/images/logo.png" alt="logo.png" /><br/>v2.4.4</h3><ol id="lr-desc"><li>'+lrLang.$LW_STR("llwMainFun1")+'</li><li>'+lrLang.$LW_STR("llwMainFun2")+'</li><li>'+lrLang.$LW_STR("llwMainFun3")+'</li><li>'+lrLang.$LW_STR("llwMainFun6")+'</li><li>'+lrLang.$LW_STR("llwMainFun4")+'</li><li>'+lrLang.$LW_STR("llwLatestVer")+'<a target="_blank" href="http://www.xiaogezi.cn/app/LinrWinds.htm">'+lrLang.$LW_STR("llwDownload")+'</a> '+lrLang.$LW_STR("llwMainFun5")+'</li></ol></div></div>';
			//FirebugContext.getPanel(linr.panelName).clearContent();
			
		var _start_menu = '<div class="ui-menu undis ' + lrLang.$LW_STR("llwUiMenuCssClass") + '" id="lr_start_menu" style="width:180px;left:12px;top:30px;">\
				<ul>\
					<li class="ui-menu-c2" id="lr-static-pane"><a href="#" class="ui-menu-rl" rel="css">CSS</a><a href="#" class="ui-menu-rr" rel="js">JS</a></li>\
					<li class="ui-menu-c2"><a href="javascript:void(0);" class="ui-menu-rl" rel="cssprits">CSS Sprite</a><a href="#" class="ui-menu-rr" rel="refreshcss">' + lrLang.$LW_STR("llwRefreshCSS") + '</a></li>\
					<li class="ui-menu-c1"><a href="javascript:void(0);" class="ui-menu-rl" rel="showhidden" title="' + lrLang.$LW_STR("llwSHElementTips") + '">' + lrLang.$LW_STR('llwShowHiddenElement') + '</a></li>\
					<li class="ui-menu-c1"><a href="javascript:void(0);" class="ui-menu-rl" rel="editable">' + lrLang.$LW_STR('llwWyswygOn') + '</a></li>\
					<li class="ui-menu-c2"><a href="javascript:void(0);" id="disable-kps-lnk" class="ui-menu-rl" rel="keepsession" title="' + lrLang.$LW_STR("llwKeepSession") + '">' + lrLang.$LW_STR("llwKeepSession") + '</a><a href="#" class="ui-menu-rr" rel="about">About</a></li>\
				</ul>\
			</div>';
		
		var _skin_htm = '<div id="lr_skin_dlg" class="ui-xbox lr-skin-dlg" title="Skin Panel"><a id="lr_skin_min_lnk" href="#lr_skin_dlg_cnt" class="ui-xbox-min">«</a><div class="lr-skin-dlg-cnt undis" id="lr_skin_dlg_cnt"></div></div>';
			//FirebugContext.getPanel(linr.panelName).printLine(_splash_htm + _cssprite_htm + _refresh_htm + _edit_htm + _start_menu + _skin_htm);
		Firebug.chrome.selectPanel(linr.panelName).printLine(_splash_htm + _cssprite_htm + _refresh_htm + _edit_htm + _start_menu + _skin_htm);
	
	},
	hasClass:function(ele,cls) {
		return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
	},
	addClass:function(ele,cls) {
		if (!linr.hasClass(ele,cls)) ele.className += " "+cls;
	},
	removeClass:function(ele,cls) {
		if (linr.hasClass(ele,cls)) {
			var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
			ele.className=ele.className.replace(reg,' ');
		}
	},
	toggleClass:function(ele,className){
	  linr.hasClass(ele,className)?linr.removeClass(ele,className):linr.addClass(ele,className);
	},
	toggleFun:function(str){

		//linr.addClass(LGet('#lr-spash'),'undis');
		//linr.addClass(LGet('#lr-css-sprite'),'undis');
		//linr.addClass(LGet('#lr-refress-css'),'undis');
		//linr.addClass(LGet('#lr-wyw-editor'),'undis');
		linr.removeClass(LGet('#' + str),'undis');
		linr.action = str;
	},
	tuneCSSSprite:function(n,v,ev){
		var msk= LrGet('MaskImgDiv');
			if(msk){
				msk.style[n] = (parseInt(msk.style[n])+v)+'px';
				linr.updateBgPos();
			}
		ev.preventDefault();
	},
	bindEvent:function(){
		
		linr.doc.documentElement.addEventListener('keydown', function(ev){
			var key = ev.keyCode;
			//alert(key);
			if(ev.ctrlKey){
				if(LrGet('llw-cs-tbr')!=null){
					linr.docMode('off');
					LGet('#preCsBtn').click();
				}else{
					linr.docMode('on');
				}
				switch(key){
					case 75:
						linr.doc.execCommand('CreateLink',false,'#');
						return false;
					break;
					case 76:
						linr.doc.execCommand('InsertUnorderedList',false,false);
						return false;
					break;
					case 81:
						linr.quickDlg(ev);
					break;
					case 83:
						ev.preventDefault();
						Firebug.LinrLLWModel.editHTML();
						linr.setRouterEvent(LGet('#lr-htm-save-lnk'),'click');
					break;
					case 90:
						if(ev.shiftKey){
							linr.doc.execCommand('RemoveFormat',false,false);
						}
					break;
					case 191:
						linr.setOHTML(linr.curMsObj,linr.getOHTML(linr.curMsObj) + '/');
					break;
				}
			}else{
				switch(key)
				{
					case 37:
						linr.tuneCSSSprite('left',-1,ev);
					break;
					case 38:
						linr.tuneCSSSprite('top',-1,ev);
					break;
					case 39:
						linr.tuneCSSSprite('left',1,ev);
					break;
					case 40:
						linr.tuneCSSSprite('top',1,ev);
					break;
					case 113:
						Firebug.LinrLLWModel.initRefreshCssPanel();
						ev.preventDefault();
						break;
					case 115:
						linr.docMode((linr.doc.designMode=='on'?'off':'on'));
						ev.preventDefault();
						break;
				}
			}
		},false);
		
		//bind html editor event
		LGet('#lr-htm-save-lnk').addEventListener('click',function(ev){
				var _fn = linr.doc.location.pathname;
					
					if(_fn.indexOf("\/")!=-1){
						if(_fn=="\/"){
						_fn='default.htm';
						}else{
						_fn = _fn.substring(_fn.lastIndexOf("\/")+1);
						}
					}

				linr.removeTmpEle();
				//Firebug.LinrLLWModel.saveFile(linr.beforeSave(linr.getOHTML(linr.doc.documentElement)),linr.doc.characterSet,afterSaved);
				linr.save(_fn,linr.beforeSave(linr.getOHTML(linr.doc.documentElement)),linr.doc.characterSet,true,afterSaved);
				linr.stopEvt(ev);
			},false);
			function afterSaved(str){
				LGet('#lr-htm-resave-lnk').className='lr-btn-ok';
				LGet('#lr-htm-save-lnk').value=lrLang.$LW_STR("llwSaveAs");
				LGet('#lr-htm-save-info').innerHTML = lrLang.$LW_STR("llwSaveOk");
				LGet('#lr-htm-save-info').rel=str;
				LGet('#lr-htm-save-info').addEventListener('click',function(ev){
					content.open('file:///'+this.rel.replace(/\\/gi,'\/'),'lrPreWin','width=800,height=600');
					linr.stopEvt(ev);
				},false);
			}
			function afterReSaved(str){
				LGet('#lr-htm-save-info').innerHTML = lrLang.$LW_STR("llwSaveAsOk");
			}
			LGet('#lr-htm-resave-lnk').addEventListener('click',function(ev){
				linr.removeTmpEle();
				linr.save(LGet('#lr-htm-save-info').rel,linr.beforeSave(linr.getOHTML(linr.doc.documentElement)),linr.doc.characterSet,false,afterReSaved);
				linr.stopEvt(ev);
			},false);
			LGet('#lr-htm-prv-lnk').addEventListener('click',function(ev){
				if(this.value == lrLang.$LW_STR("llwPreview")){
					linr.docMode('off');
					this.value =lrLang.$LW_STR("llwReEdit");
				}
				else{
					linr.docMode('on');
					this.value=lrLang.$LW_STR("llwPreview");
				}
				linr.stopEvt(ev);
			},false);
			LGet('#qkset-htm-lnk').addEventListener('click',function(ev){
				var A = this.innerHTML;
				if(A.indexOf('▼')!=-1){
					this.innerHTML=A.replace('▼','▲');
					LGet('#qkset-htm-spn').className='mt5';
					linr.removeClass(LGet('#lr-htm-sg'),'undis');
					linr.removeClass(LGet('#lr-htm-akey-panel'),'undis');
				}
				else{
					this.innerHTML=A.replace('▲','▼');
					LGet('#qkset-htm-spn').className='undis';
					linr.addClass(LGet('#lr-htm-sg'),'undis');
					linr.addClass(LGet('#lr-htm-akey-panel'),'undis');
				}
				linr.stopEvt(ev);
			},false);
			LGet('#qkset-htm-updt').addEventListener('click',function(ev){
				var htm=LGet('#qkset-htm').textContent;
					htm=htm.replace(/\n/g,'');
					htm=htm.replace(/\t/g,'');
				if(linr.getTagName(linr.curMsObj)=='body'){
					linr.curMsObj.innerHTML = htm;
				}else{
					linr.setOHTML(linr.curMsObj,htm);
				}
				linr.stopEvt(ev);
			},false);
			
			LGet('#lr-sv-sg').addEventListener('click',function(ev){
				linr.setStore('llwLocalStorage',LGet('#qkset-htm').innerHTML);
			},false);			
			
			LGet('#lr-ld-sg').addEventListener('click',function(ev){
				LGet('#qkset-htm').innerHTML = linr.getStore('llwLocalStorage');
			},false);
			
			LGet('#lr-copy-sg').addEventListener('click',function(ev){
				
				var tmp = LrGet('lr-tmp-clipborad');
				if(!tmp){
					tmp = linr.doc.createElement('div');
					tmp.style.display='none';
					tmp.id='lr-tmp-clipborad';
					tmp.innerHTML=linr.getOHTML(linr.curMsObj);
					linr.doc.body.appendChild(tmp);
				}
				linr.copy(tmp.innerHTML);
				tmp.parentNode.removeChild(tmp);
				
			},false);
			
			LGet('#lr-op-lf').addEventListener('click',function(ev){
				var p=linr.oDlg('open file...');
				var path = 'file:///'+p.path.replace(/\\/gi,'\/');
				linr.ajax(path,function(xhr){
					var txt=xhr.responseText;
				});
			},false);
			
			LGet('#lr-all-htm-tlbar').addEventListener('mouseover',function(){
				linr.removeClass(this, 'undis');
			},false)
			LGet('#lr-all-htm-tlbar').addEventListener('mouseout',function(){
				linr.addClass(this, 'undis');
			},false)
			
			var lrSplash = LGet('#lr-spash');
				lrSplash.addEventListener('mouseover',function(){
					linr.removeClass(this,'undis');
				},false)
				lrSplash.addEventListener('mouseout',function(){
					linr.addClass(this, 'undis');
				},false)
			
			var _lkArr = LGet('#llw-ist-tg-spn').getElementsByTagName('input');
				for(var i=0,j=_lkArr.length;i<j;++i)
				{
					_lkArr[i].addEventListener('click',function(ev){
						linr.curMsObj.contentEditable = true;
						var rel = this.getAttribute('rel'),val = this.value;
						var sel = linr.getSelectCtt();
						if(sel==''){
							if(val=='table'){
								LGet('#lr-tb-ctr').style.left = linr.GRL(this) + 'px';
								LGet('#lr-tb-ctr').style.top = linr.GRT(this) + 'px';
								LGet('#lr-tb-ctr').className = 'lr-tb-ctr';
							}else{
								linr.insertHTML(rel);
							}
						}
						else
						{
							switch(val)
							{
								case 'a':
									linr.insertHTML(linr.str.wrap(sel,'\r\n','</a> <a href="#">','<a href="#">','</a>'));
								break;
								case 'li':
									linr.insertHTML(linr.str.wrap(sel,'\r\n','</li><li>','<ul><li>','</li></ul>'));
								break;
								default :
									linr.setSHTML(linr.curMsObj,rel);
							}
						}
						LGet('#lr-all-htm-tlbar').className='undis';
						linr.stopEvt(ev);
					},false);
				}	
		//bind splash event
		var _o = LGet('#disable-kps-lnk');
			linr.keepSession(_o,'off');

			var _lkArr = LGet('#lr_start_menu').getElementsByTagName('a');
				for(var i = 0,j = _lkArr.length;i < j;++i){
					_lkArr[i].addEventListener('click',function(ev){
						var me = this;
						var rel = me.getAttribute('rel'),
							val = me.innerHTML;
						if(rel == 'css'){
							linr.miniDlg(rel);
						}else if(rel == 'js'){
							linr.miniDlg(rel);
						}else if(rel == 'keepsession'){
							(me.innerHTML == lrLang.$LW_STR("llwEnable"))?linr.keepSession(me, 'on'):linr.keepSession(me, 'off');
						}else if(rel == 'about'){
							linr.removeClass(lrSplash,'undis');
						}else if(rel == 'showhidden'){
							linr.showHidden(null, me);
						}else if(rel == 'hidehidden'){
							linr.hideHidden(null, me);
						}else if(rel == 'editable'){
							var bl = linr.doc.body.hasAttribute('contenteditable');
							if(bl){
								linr.docMode('off');
								me.innerHTML = lrLang.$LW_STR('llwWyswygOn');
							}else{
								linr.docMode('on');
								me.innerHTML = lrLang.$LW_STR('llwWyswygOff');
							}
							
						}else if(rel == 'cssprits'){
						
								if(LrGet('llw-cs-tbr')==null){
									var noBbl='linr.stopEvt(event);';
									var e=linr.doc.createElement('div');
										e.id='llw-cs-tbr';
										e.className='tt';
										e.innerHTML='<style type="text\/css">.MaskDiv{position:absolute;border:1px solid #39F;z-index:999998;}.MaskImgDiv{position:absolute;border:1px solid #F2542A;background:#A8CAEC;Opacity:.5;z-index:999999;cursor:move;}<\/style><div style="z-index:999999;" class="MaskImgDiv" id="MaskImgDiv"></div>';
									linr.doc.body.appendChild(e);
								}
								linr.docMode('off');
								LGet('#lr-css-sprite').className = 'ui-xbox';
								LGet('#lr_css_sprite_mask').className = 'ui-mask';
								//linr.doc.body.removeEventListener('mousedown',linr.ieMsDn,true);
								linr.doc.body.addEventListener('mousedown',linr.csMsDn,false);
								
							
						}else if(rel == 'refreshcss'){
							Firebug.LinrLLWModel.initRefreshCssPanel();
						}else{
							
						}
						linr.addClass(LGet('#lr_start_menu'), 'undis');
					},false);
				}
				//var _seo = content.getSelection().anchorNode.parentNode;//focusNode.parentNode
				var _lkArr = LGet('#llw-pro-qikly-spn').getElementsByTagName('input');
				for(var i=0,j=_lkArr.length;i<j;++i)
				{
					_lkArr[i].addEventListener('keyup',function(ev){
						if(linr.curMsObj!=null){
							linr.curMsObj.setAttribute(this.id.split('-')[1],this.value);
						}
						if(ev.keyCode==40){
							linr.staticDlg();
						}
					},false);
					_lkArr[i].addEventListener('contextmenu',function(ev){
						this.select();
					},false);
				}
		
			LGet('#qkset-htm').addEventListener('keydown',function(ev){
				Firebug.LinrLLWModel.imInput(this);
			},false);
			
			LGet('#qkset-htm').addEventListener('keyup',function(ev){
				var key=ev.keyCode;
				if(ev.ctrlKey && key==69){
					linr.insertAtCarset(this,linr.cssToHtml(linr.selection()),linr.cssToHtml(linr.selection(),true));
				}
				linr.stopEvt(ev);
			},false);
			
			LGet('#qkset-htm').addEventListener('mousedown',function(ev){
				linr.editorMsDn(ev);
				if(ev.button==1){
					this.style.height = (ev.ctrlKey)?this.offsetHeight-20+'px':this.offsetHeight+20+'px';
				}
			},false);

			LGet('#lr-htm-akey-lnk').addEventListener('click',function(ev){
				LGet('#lr-htm-akey-panel').className=(LGet('#lr-htm-akey-panel').className=='undis')?'':'undis';
				linr.stopEvt(ev);
			},false);
		
		//bind csssprites event
		LGet('#localUrlFile').addEventListener('change',function(){
			if(!this.value.match(/.jpg|.gif|.png|.bmp/i)){alert(lrLang.$LW_STR("llwSelectImg"));return;}
			if(this.files){
				var _path=this.files[0].getAsDataURL();
				var _md=LrGet('MaskImgDiv');
				LGet('#localUrlTxt').value=_path;
				_md.style.top='0px';
				_md.style.left='0px';
				_md.innerHTML='';
				var _img = linr.doc.createElement('img');
					_img.src=LGet('#localUrlTxt').value;
					_img.id='llw-cs-img';
					_md.appendChild(_img);
				linr.curMsObj.style.backgroundImage='url("'+_path+'")';
			}
		},false);
		LGet('#localUrlBtn').addEventListener('click',function(){
			var _localFile = LGet('#localUrlTxt').value;
			if(_localFile!=''){
				LrGet('llw-cs-img').setAttribute('src',_localFile);
				linr.curMsObj.style.backgroundImage='url('+_localFile+')';
			}
		},false);
		LGet('#preCsBtn').addEventListener('click',function(){
				LrGet('MaskDiv').style.visibility=(this.value==lrLang.$LW_STR("llwPreview"))?'hidden':'visible';
				LrGet('MaskImgDiv').style.visibility=(this.value==lrLang.$LW_STR("llwPreview"))?'hidden':'visible';
				this.value=(this.value==lrLang.$LW_STR("llwPreview"))?lrLang.$LW_STR("llwUnPreview"):lrLang.$LW_STR("llwPreview");
		},false);

		LGet('#preCsImg').addEventListener('click',function(ev){
			content.open(LGet('#localUrlTxt').value,'lrPreWin','width=800,height=600');
			linr.stopEvt(ev);
		},false);
		//bind refresh css event

		LGet('#lr-css-url-file').addEventListener('change',function(ev){
			var _path = 'file:///'+this.value.replace(/\\/gi,'\/');
			LGet('#lr-css-url-txt').value=_path;
			linr.loadSrc(_path,'css','lr-extral-css'+linr.getRnd(999));
			linr.stopEvt(ev);
		},false);
		LGet('#lr-css-ipt-btn').addEventListener('click',function(ev){
			linr.loadSrc(LGet('#lr-css-url-txt').value,'css','lr-extral-css'+linr.getRnd(999));
			linr.stopEvt(ev);
		},false);

		//ui-xbox
		function bindXbox(){
			var lrXboxCls = LGet('.ui-xbox-close,.ui-xbox-min', true);//linr.paneDoc.document.querySelectorAll('.ui-xbox-close,.ui-xbox-min');
				for(var i = 0, j = lrXboxCls.length;i < j; i++ ){
					lrXboxCls[i].addEventListener('click',function(evt){
						var href = this.getAttribute('href');
						var txt = this.innerHTML;
						var eo = LGet('#' + href.split('#')[1]);
						if(eo){
							if(linr.hasClass(eo, 'undis')){
								linr.removeClass(eo, 'undis')
							}else{
								linr.addClass(eo, 'undis');
							}
							if(txt != 'x'){
								this.innerHTML = txt == '«' ? '»' : '«';
							}
						}
						linr.addClass(LGet('#lr_css_sprite_mask'), 'undis');
						evt.preventDefault();
					},false);
				}
		}
		bindXbox();
		
		LGet('#lr_css_sprite_close').addEventListener('click',function(){
			linr.doc.body.removeEventListener('mousedown',linr.csMsDn,true);
			//linr.doc.body.addEventListener('mousedown',linr.ieMsDn,false);
			linr.setOHTML(LrGet('llw-cs-tbr'), '');
		},false);

		//fir
		var fir={
				dlg : LGet('#lr-html-tags'),
				act : LGet('#lr-tag-action'),
				src : LGet('#lr-html-txt'),
				ok : LGet('#lr-okbtn'),
				del : LGet('#lr-del-lnk'),
				rel : LGet('#lr-rel-lnk'),
				chg : LGet('#lr-chg-lnk'),
				ctt : LGet('#lr-htmctt-txt'),
				ele : null,
				eles : [],
				selector : '',
				action : '',
				timer:null,
				tag : LGet('#lr-tag-txt'),
				setting : LGet('#lr-set-lnk'),
				attr : LGet('#lr-attr-txt'),
				vals : LGet('#lr-vals-txt'),
				query : function(str,p){
					try{
						return (p||linr.doc).querySelectorAll(str);
					}catch(e){
						return null;
					}
				},
				list:function(iterable){
					if(iterable.item){
						var l = iterable.length, array = new Array(l);
						while(l--) array[l] = iterable[l];        
						return array;
					}
					return [].slice.call(iterable);
				},
				init : function(eobj){
					LGet('#lr-htm-save-info').innerHTML = '';
					fir.dlg.className='lr-skin-im';
					fir.dlg.style.top=eobj.offsetTop + 'px';
					fir.dlg.style.left=eobj.offsetLeft+'px';
					fir.dlg.onkeyup=function(e){
						var evt = window.event||e;
						var eo = evt.srcElement||evt.target;
						if(eo.tagName.toLowerCase()=='input' && eo.type=='text'){
							if(eo.value.length>10){
								eo.style.width=eo.value.length*7+'px';
							}else{
								eo.style.width=eo.getAttribute('_width')+'px';
							}
							fir.getEles();
							if(fir.action=='tag'){
								clearTimeout(fir.timer);
								fir.timer = setTimeout(function(){fir.process('hilit-all');},500);
							}
							if(fir.tag.value.indexOf('->')!=-1){
								fir.chg.className='';
							}else{
								fir.chg.className='undis';
							}
						}
						
					}
					
					fir.dlg.onmouseover=function(e){
						var ev = window.event||e;
						var eo = ev.srcElement||ev.target;
						if(eo.tagName.toLowerCase()=='input' && eo.type=='text'){
							fir.action = eo.id.split('-')[1];
							if(eo.getAttribute('rel')==eo.value)eo.select();
							fir.act.style.left = eo.offsetLeft+'px';
							fir.act.style.top = eo.offsetTop+20+'px';
							if(fir.action!='vals' && fir.action!='htmctt'){
								fir.setting.className='undis';
								fir.del.className='';
							}else{
								fir.setting.className='';
								fir.del.className='undis';
								fir.rel.className='undis';
							}
							if(fir.action=='tag'){
								fir.rel.className='';
								fir.hilit.className='';
								if(fir.tag.value.indexOf('->')!=-1)fir.chg.className='';
							}else{
								fir.rel.className='undis';
								fir.chg.className='undis';
							}
							
						}
					}
					
					fir.ok.onclick=function(){
						fir.dlg.className='undis';
					}
					
					fir.del.onclick=function(){
						fir.process('del-all');
						return false;
					}
					
					fir.rel.onclick=function(){
						fir.process('del-tag');
						return false;
					}
					fir.chg.onclick=function(){
						fir.process('chg-tag');
						return false;
					}
					fir.setting.onclick=function(){
						fir.process();
						return false;
					}
			
				},
				getSelector:function(){
				
					fir.selector = ' ';
					
					if(fir.ele){
						var _tag = (fir.tag.value=='[selector]') ? '*' : fir.tag.value.split('->')[0];
						fir.selector += _tag;
					}
					
					return fir.selector;
				},
				classic:function(){
					fir.dlg.className='lr-skin-clc';
				},
				process : function(act){

					var arr=fir.list(fir.getEles());
					
					if(fir.action=='tag'){

						for(var i=0,j=arr.length;i<j;i++){
						
							switch(act){
								case 'del-all':
									arr[i].parentNode.removeChild(arr[i]);
								break;
								
								case 'del-tag':
								
									var htm=arr[i].innerHTML;
									linr.setOHTML(arr[i],htm);
									
								break;
								
								case 'hilit-all':
									arr[i].style.outline = '2px solid #FF9C00';
									setTimeout(function(n){
										n.style.outline = '';
									},1500,arr[i]);

								break;
								case 'chg-tag':

									var tagv = fir.tag.value.split('->');
									if(tagv.length>1){
										var ntag = tagv[1];
									
										var htm=arr[i].innerHTML;
										var ohtm = linr.getOHTML(arr[i]);
										var ctag = ohtm.replace(htm,'');
											ctag = ctag.replace('<'+arr[i].tagName.toLowerCase()+' ','<'+ntag+' ');
											ctag = ctag.replace('</'+arr[i].tagName.toLowerCase()+'>','');

											linr.setOHTML(arr[i],ctag+htm+'</'+ntag+'>');
									}
									
								break;
							}
							
						}
											
					}
					else if(fir.action=='attr')
					{	
						
						for(var i=0,j=arr.length;i<j;i++){
							var _attr = fir.attr.value;
							var _atr = arr[i].attributes;
							
							if(_attr.indexOf('^')>0){
								var _att_s = _attr.split('^')[0];
								for(var k=0,l=_atr.length;k<l;k++){
									if(_atr[k]){
										var _vals=_atr[k].name;
										if(_vals.indexOf(_att_s)==0){
											arr[i].removeAttribute(_vals);
										}
									}
								}
							}else if(_attr.indexOf('$')>0){
								var _att_s = _attr.split('$')[0];
								for(var k=0,l=_atr.length;k<l;k++){
									if(_atr[k]){
										var _vals=_atr[k].name;
										if(_vals.lastIndexOf(_att_s)+_att_s.length==_vals.length){
											arr[i].removeAttribute(_vals);
										}
									}
								}
							}else if(_attr.indexOf('*')>0){
								var _att_s = _attr.split('*')[0];
								for(var k=0,l=_atr.length;k<l;k++){
									if(_atr[k]){
										var _vals=_atr[k].name;
										if(_vals.indexOf(_att_s)!=-1){
											arr[i].removeAttribute(_vals);
										}
									}
								}
							}else if(_attr=='[any attr]' || _attr=='*'){
								var _hsid = false;
								
								for(var k=0,l=_atr.length;k<l;k++){
									if(_atr[k]){
										var _vals=_atr[k].name;
										if(_vals == 'id'){_hsid = true;continue;}
										arr[i].removeAttribute(_vals);
									}
								}
								if(_hsid){
									arr[i].removeAttribute("id");
								}
							} 
							else{
								arr[i].removeAttribute(_attr);
							}
						}
						
					}else if(fir.action=='htmctt'){
					
						for(var i=0,j=arr.length;i<j;i++){
							var attv = fir.getVals(fir.ctt.value,arr[i]);
							if(attv!=''){
								if(fir.ctt.value.indexOf('{void:')==-1)arr[i].innerHTML = attv;
							}else{
								arr[i].innerHTML = fir.ctt.value;
							}
						}
						
					}else{
						
						for(var i=0,j=arr.length;i<j;i++){
							var attv = fir.getVals(fir.vals.value,arr[i]);
							if(attv!=''){
								if(fir.vals.value.indexOf('{void:')==-1)arr[i].setAttribute(fir.attr.value,attv);
							}else{
								arr[i].setAttribute(fir.attr.value,fir.vals.value);
							}
						}
					}
					
					if(act!='hilit-all'){
						fir.src.value = fir.ele.innerHTML;
						fir.dlg.className='undis';
						LGet('#lr-htm-save-info').innerHTML = 'OK';
					}
				},
				getVals:function(ctv,obj){
					ctv = ctv.replace(/\.prev/gi,'.previousSibling');
					ctv = ctv.replace(/\.next/gi,'.nextSibling');

					if(ctv.indexOf('this->')!=-1){
						var jstr = ctv.split('this->')[1];
						var attv = linr.str2obj(jstr,obj);
						return attv;
						
					}else if(ctv.indexOf('{value:')==0){
						var jstr = ctv.split("{value:")[1];
							jstr = jstr.replace(/this\./g,'arguments[0].');
							if(jstr.substring(jstr.length-1)=='}'){
								jstr = jstr.substring(0,jstr.length-1);
							}
							
						return linr.str2obj(jstr,obj,0);
						
					}else if(ctv.indexOf('{void:')==0){
						var jstr = ctv.split("{void:")[1];
							jstr = jstr.replace(/this\./g,'arguments[0].');
							if(jstr.substring(jstr.length-1)=='}'){
								jstr = jstr.substring(0,jstr.length-1);
							}
						
						return linr.str2obj(jstr,obj,1);
						
					}else{
						return "";
					}
					return "";
				},
				getEles:function(){
				
					fir.ele=linr.curMsObj;
					
					try{	
						fir.eles = fir.query(fir.getSelector(),fir.ele);
						var arr = fir.list(fir.eles);
					}catch(e){
			
					}
					return fir.eles;
				}
			};
		
		function exportDom(str){
			var win = window.open('data:text/javascript,' + encodeURIComponent(str),'','scrollbars=yes,status=no,width=800,height=440,resizealbe=yes,maxnimize=yes,font-family=微软雅黑');
				win.opener = null;
		}

		var lrTagMnu = LGet('#lr-tag-menu');
		var lrTagMnuMr = LGet('#lr_start_menu');
		var lrStartMnu = LGet('#lr_logo_small'); 
		
			lrTagMnu.addEventListener('mouseover',function(ev){
				linr.removeClass(this, 'undis');
			},false);
			lrTagMnu.addEventListener('mouseout',function(ev){
				linr.addClass(this, 'undis');
			},false);
			lrStartMnu.addEventListener('mouseover',function(ev){
				
				Firebug.Console.log(this);
				linr.removeClass(lrTagMnuMr, 'undis');
			},false);
			lrStartMnu.addEventListener('click',function(ev){
				return false;
			},false);
			lrTagMnuMr.addEventListener('mouseover',function(ev){
				linr.removeClass(this, 'undis');
			},false);
			lrTagMnuMr.addEventListener('mouseout',function(ev){
				linr.addClass(this, 'undis');
			},false);
		
			var _lkArr = lrTagMnu.getElementsByTagName('a');
				for(var i=0, j = _lkArr.length; i < j; ++i)
				{
					_lkArr[i].addEventListener('click',function(ev){
						var e = this.id.split('-')[1];
						var ctrlKey = ev.ctrlKey;
						switch(e){
							case 'insert':
								var bar = LGet('#lr-all-htm-tlbar');
									bar.className = 'ui-menu ui-tagpane';
									bar.style.top = lrTagMnu.offsetTop + 'px';
									bar.style.left = lrTagMnu.offsetLeft + 100 + 'px';
							break;
							case 'del':
								var _htm = linr.curMsObj.innerHTML;
								linr.setOHTML(linr.curMsObj,_htm);
							break;
							case 'cttdel':
								//Firebug.Console.log(this);
								if(linr.curMsObj.parentNode){
									linr.clipData = linr.getOHTML(linr.curMsObj);
									linr.curMsObj.parentNode.removeChild(linr.curMsObj);
								}
								LGet('#lr-copy-sg').click();
							break;
							case 'cpy':
								linr.clipData = linr.getOHTML(linr.curMsObj);
								LGet('#lr-copy-sg').click();
							break;
							case 'pst':
								linr.setOHTML(linr.curMsObj,linr.getOHTML(linr.curMsObj)+linr.clipData);
							break;
							case 'edt':
								LGet('#qkset-htm-lnk').innerHTML = LGet('#qkset-htm-lnk').innerHTML.replace('&#9650;','&#9660;');
								linr.setRouterEvent(LGet('#qkset-htm-lnk'),'click');
							break;
							case 'highlt':
								Firebug.toggleBar(true, "html");
								FirebugChrome.select(linr.curMsObj, "html");
							break;
							case 'exportdom':
								exportDom(linr.getOHTML(linr.curMsObj));
							break;
							case 'exppic':
								linr.exportEle2Img([linr.curMsObj.offsetLeft,linr.curMsObj.offsetTop,linr.curMsObj.offsetWidth,linr.curMsObj.offsetHeight]);
							break;
							case '3d':
								if(linr.curMsObj.style.MozTransform){
									linr.curMsObj.style.MozTransform = '';
								}else{
									linr.curMsObj.style.MozTransform = 'rotate(-15deg) skew(-15deg, -15deg)';
								}
							break;
							case 'query':
								fir.init(LGet('#lr-tag-menu'));
							break;

							case 'cpstyle':
								
								//Firebug.toggleBar(true);
								//Firebug.Inspector.startInspecting(this.context);
								//Firebug.Inspector.inspectNode(linr.curMsObj);
								
								Firebug.Console.log(FirebugChrome);
								FirebugChrome.select(linr.curMsObj,"script",null, true);
								Firebug.toggleBar(true);
								Firebug.toggleBar(true, "LinrLightWeb");
								//FirebugChrome.select(linr.curMsObj, "html");
								
								//Firebug.toggleBar(true, "html");, "LinrLightWeb"
								//FirebugChrome.selectPanel("LinrLightWeb");
								
								//setTimeout(function(){Firebug.toggleBar(true, "LinrLightWeb");},1000);
								//Firebug.Console.log(this);
								//Firebug.Console.log(window);
								//linr.doc.querySelectorAll('.cssElementRuleContainer');
								//Firebug.Console.log(this)
								//Firebug.Console.log(document.getElementById('fbPanelBar2-browser').contentDocument.querySelectorAll('.cssElementRuleContainer'));
								//Firebug.Console.log(document.getElementById('fbPanelBar2-browser').contentDocument.querySelectorAll('.cssElementRuleContainer')[0].textContent);
/*
fbPanelBar2-browser

fbSidePanelDeck

fbLargeCommandBox

fbPanelBar2-browser


fbPanelBar2-browser > a11yCSSView  > cssElementRuleContainer > cssRule 

*/
							break;
							
						}
						linr.addClass(lrTagMnu, 'undis');
						linr.stopEvt(ev);
					},false);
				}
			LGet('#lr-textctt-pl').addEventListener('mouseover',function(evt){
				linr.removeClass(this,'undis');
				LGet('#lr-textctt-txt').select();
			},false);
			LGet('#lr-textctt-pl').addEventListener('mouseout',function(evt){
				linr.addClass(this,'undis');
			},false);
			
			LGet('#lr-textctt-txt').addEventListener('keyup',function(evt){
				var _ele = linr.getElement(linr.curMsObj,LGet('#lr-textctt-pl').getAttribute('rel'));
				_ele.innerHTML = LGet('#lr-textctt-txt').value;
			},false);

		//Linr tab
		var linrtab={
				ctr:'lr-tb-ctr',
				pl:'lr-tb-pl',
				tip:'lr-tb-tip',
				msdn:false,
				ok:'lr-tb-ok',
				init:function(){
					linrtab.ctr = LGet('#' + linrtab.ctr);
					linrtab.pl = LGet('#' + linrtab.pl);
					linrtab.tip = LGet('#' + linrtab.tip);
					linrtab.ok = LGet('#' + linrtab.ok);
					for(var i=0;i<8;i++){
						for(var j=0;j<8;j++){
							var cell = linr.doc.createElement('a');
								cell.className = 'lr-tb-cell';
								cell.id = 'btn_'+i+'_'+j;
								linrtab.pl.appendChild(cell);
							
								cell.addEventListener('mousemove',function(eo){
									if(linrtab.msdn)return;
									linrtab.resetTab();
									var e = eo.target;
									var _n = e.id.split('_');
									var _l = Number(_n[1]) + 1;
									var _t = Number(_n[2]) + 1;
									linrtab.mxr = _l;
									linrtab.mxc = _t;
									linrtab.tip.innerHTML = _t + ' x ' + _l + ' Table';
									for(var _r = 0;_r<_l;_r++){
										for(var _c = 0;_c<_t;_c++){
											LGet('#btn_'+_r+'_'+_c).className = 'lr-tb-cell lr-tb-sel'; 
										}
									}
								},false);
								cell.addEventListener('mousedown',function(eo){
									var e = eo.target;
									var _n = e.id.split('_');
									var _l = _n[1];
									var _t = _n[2];
									
									if(!linrtab.msdn){
										linrtab.msdn = true;
									}else{
										if(_t>linrtab.mxc || _l>linrtab.mxr){
											
										}else{
											if(e.className == 'lr-tb-cell lr-tb-sel'){
												e.className = 'lr-tb-cell lr-tb-th'; 
												e.innerHTML='th';
											}else{
												e.className = 'lr-tb-cell lr-tb-sel'; 
												e.innerHTML='';
											}
										}
									}
								},false);
								
						}
					}
				linrtab.ok.addEventListener('click',function(eo){
						var e = eo.target;
						if(eo.ctrlKey){
							e.label = 'OK'; 
							linrtab.resetTab();
							linrtab.msdn = false;
						}else{
							linr.curMsObj.contentEditable = true;
							linr.insertHTML(linrtab.getHtmls());
							LGet('#lr-tb-ctr').className='undis';
						}
					},false);
			
				linrtab.ok.addEventListener('mouseover',function(eo){
						if(eo.ctrlKey){
							linrtab.ok.value = "Reset";
						}  
				},false);
				
				linrtab.ok.addEventListener('mouseout',function(eo){
					linrtab.ok.value = "OK";
				},false);
				
				linrtab.ctr.addEventListener('mouseover',function(eo){
					this.className='lr-tb-ctr';
				},false);
				linrtab.ctr.addEventListener('mouseout',function(eo){
					this.className='undis';
				},false);
				
				LGet('#lr-tb-scls').addEventListener('click',function(eo){
					LGet('#lr-tb-cls').className = (this.checked)?'lr-txt':'undis';
				},false);

			},
			resetTab:function(){
				for(var i=0;i<8;i++){
					for(var j=0;j<8;j++){
						LGet('#btn_'+i+'_'+j).innerHTML='';
						LGet('#btn_'+i+'_'+j).className = 'lr-tb-cell'; 
					}
				}
			},
			getHtmls:function(){
			   var sp = LGet('#lr-tb-cls').value.split(',');
				
				var htm = '<table cellpadding="5" style="width:100%;border-spacing:0;border:1px dotted #ccc;"';
				if (LGet('#lr-tb-bd').checked){
					htm += " border=\"1\"";
				}
				htm += ">";
				for (var i = 0; i < linrtab.mxr; i++){

					if (LGet('#lr-tb-thd').checked){
						if (i == 0){
							htm += "\n<thead>\n\t<tr>";
						}else if(i == 1){
							htm += "\n</thead>\n<tbody>\n\t<tr>";
						}else {
							htm += "\n\t<tr>";
						}

					}else{
						htm += (i == 0) ? "\n<tbody>\n\t<tr>" : "\n\t<tr>";
					}

					for (var j = 0; j < linrtab.mxc; j++){
							var e = LGet('#' + "btn_"+i+'_'+j);
							var clsStr = linrtab.getClsName(j);
							if(e.className == 'lr-tb-cell lr-tb-sel'){
								htm += "\n\t\t<td" + clsStr + ">&nbsp;\r\n</td>";
							}else if(e.className == 'lr-tb-cell lr-tb-th'){
								htm += "\n\t\t<th" + clsStr + ">&nbsp;\r\n</th>";
							}else{
							}
					}
					
					if (LGet('#lr-tb-tft').checked){
						if (i == linrtab.mxr - 1){
							htm += (LGet('#lr-tb-thd').checked) ? "\n\t</tr>\n</tfoot>" : "\n\t</tr>\n</tfoot>";
						}else if (i == linrtab.mxr - 2){
							htm += "\n\t</tr>\n</tbody>\n<tfoot>";
						}else {
							htm += "\n\t</tr>";
						}
					}else{
						if (LGet('#lr-tb-thd').checked){
							htm += (i == linrtab.mxr - 1) ? "\n\t</tr>\n</tbody>" : "\n\t</tr>";
						}else{
							htm += (i == linrtab.mxr - 1) ? "\n\t</tr>\n</tbody>" : "\n\t</tr>";
						}
					}
				}
				htm += "\n</table>";
				return htm;
			},
			getClsName:function(tdidx)
			{
				var cls = LGet('#lr-tb-cls').value;

				if (cls.indexOf(",") != -1) {
					var sp = cls.split(',');
					for (var i = 0; i < sp.length; i++)
					{
						if (tdidx == i) {
							return " class=\""+sp[i]+"\"";
						}
					}
				}
				return "";
				  
			}
		}
		linrtab.init();

	},
	ieMsDn:function(event, curel){
		var lrTagMnu = LGet('#lr-tag-menu');
		LGet('#llw-pro-qikly').style.display = 'block';
		var _el = curel || linr.getEvtObj(event);
			linr.curMsObj = _el;
			LGet('#cur-tag-em').value=_el.tagName.toLowerCase();
			LGet('#qkset-class').value = _el.className;
			LGet('#qkset-id').value = _el.id;
			var A=[];
			if(_el.tagName=='BODY'){
				LGet('#qkset-htm').textContent = _el.innerHTML;
			}else{
				linr.TREE(_el,A);
				LGet('#qkset-htm').innerHTML = A.join('');
			}
			LGet('#llw-all-tag-panel').innerHTML = linr.getAllTagFromCurEle(_el).join(' ');
			var _lkArr = LGet('#llw-all-tag-panel').getElementsByTagName('a');
			for(var i=0,j=_lkArr.length;i<j;++i){
				_lkArr[i].addEventListener('click',function(ev){
					var _ele = linr.getElement(linr.curMsObj,this.rel);
					
					//if(_ele.tagName=='BODY')return;
					linr.removeClass(lrTagMnu, 'undis');
					lrTagMnu.style.left = this.offsetLeft+1+'px';
					lrTagMnu.style.top = this.offsetTop+22+'px';
					if(_ele.style.cssText == 'outline: 2px solid rgb(246, 76, 0);'){
						_ele.removeAttribute('style');
					}else{
						_ele.style.outline='';
					}
					linr.ieMsDn(false, _ele);
					//linr.setRouterEvent(_ele, 'mousedown', linr.doc);
					linr.addClass(LGet('#lr-html-tags'), 'undis');
					linr.getSkin();
					linr.stopEvt(ev);
				},false);
				_lkArr[i].addEventListener('mouseover',function(ev){
					//if(this.rel!=='0'){
						var _ele = linr.getElement(linr.curMsObj, this.rel);
						linr.curMsEle = _ele;
						_ele.style.outline = '2px solid #F64C00';
					//}
					linr.stopEvt(ev);
				},false);
				_lkArr[i].addEventListener('mouseout',function(ev){
					//if(this.rel!=='0'){
						var _ele = linr.curMsEle;
						if(_ele){
							if(_ele.style.cssText=='outline: 2px solid rgb(246, 76, 0);'){
								_ele.removeAttribute('style');
							}else{
								_ele.style.outline='';
							}
						}
					//	}
					linr.stopEvt(ev);
				},false);
				_lkArr[i].addEventListener('contextmenu',function(ev){
					var _ele = linr.getElement(linr.curMsObj,this.rel);
						if(_ele){
							var _txt=_ele.textContent;
							var _tab=_txt.match(/\t/g);
							if(_tab && _tab.length>2){
							}else{
								var tcpl=LGet('#lr-textctt-pl');
								tcpl.setAttribute('rel',this.rel);
								linr.removeClass(tcpl,'undis');
								tcpl.style.left = (this.offsetLeft-1)+'px';
								tcpl.style.top = (this.offsetTop-1)+'px';//22+
								LGet('#lr-textctt-txt').value = _ele.innerHTML;
							}
						}
						
					linr.stopEvt(ev);
						
				},false);
			}
			
			linr.getSkin();
	},
	csMsDn:function(event){
		var e = linr.getEvtObj(event);
			if(e.tagName.toLowerCase()!='body')
			{
				if(e.style)
				{
					if(linr.getBgUri(e)!=''){
						linr.curMsObj = e;
						linr.createMask(e);
						linr.createImg(e);
						linr.makeDrag(LrGet('MaskImgDiv'));
						LGet('#localUrlTxt').value = LrGet('llw-cs-img').src;
						LGet('#preCsImg').src=LrGet('llw-cs-img').src;
						LGet('#preCsPane').style.cssText='width:'+e.offsetWidth+'px;height:'+e.offsetHeight+'px;';
					}
				}
			}
			linr.stopEvt(event);
	},
	getSkin:function(event){
		var e = linr.curMsObj;
		var uri = linr.getBgUri(e);
		var src = linr.getTagName(e) == 'img' ? e.src : '';
		var toHex = function(num, digits){ 
			var s = Number(num).toString(16); 
			while (s.length < digits){
				s = '0' + s;
			}
			return s.toUpperCase();
		}
		var isColor = function(clr){
			if(clr != '' && clr != 'rgb(0, 0, 0)' && clr != 'rgb(255, 255, 255)' && clr != 'transparent'){
				clr = clr.substring(clr.indexOf('(') + 1, clr.indexOf(')'));
				var arr = clr.split(',');
				return '#' + toHex(arr[0], 2) + toHex(arr[1], 2) + toHex(arr[2], 2);
			}
			return false;
		}
		var color = isColor(linr.getStyle(e, 'color'));
		var bgcolor = isColor(linr.getStyle(e, 'background-color'));
		var bdcolor = isColor(linr.getStyle(e, 'border-top-color'));

		linr.removeClass(LGet('#lr_skin_dlg'), 'undis');

		LGet('#lr_skin_dlg_cnt').innerHTML = '<ul>' +
			((uri != '') ? '<li><a href=' + uri + ' target="_blank"><img src=' + uri + ' /></a></li>' : '') +
			((src != '') ? '<li><a href=' + src + ' target="_blank"><img src=' + src + ' /></a></li>' : '') +
			'<li>' + ((color == false) ? '' : '<span title="color" class="lr-color-block" style="background:' + color + '">' + color + '</span>') +
				((bgcolor == false) ? '' : '<span title="background-color" class="lr-color-block" style="background:' + bgcolor + '">' + bgcolor + '</span>') +
				((bdcolor == false) ? '' : '<span title="border-color" class="lr-color-block" style="background:' + bdcolor + '">' + bdcolor + '</span>') +
			'</li>'+
		'</ul>';
		
		
	},
	onLLWload:function(context){
		linr.paneDoc = context['panelNode'];
		if(!LGet('lr-wyw-editor')){
			//Firebug.Console.log(linr.paneDoc);
			//Firebug.Console.log(window);
			linr.doc = content.document;
			linr.curMsObj = linr.doc.body;
			//eraseNode(container);
			//if(!LGet('#llw-all-htm-panel')){
			linr.drawUI();
			linr.bindEvent();
			//linr.toggleFun('lr-splash');
			Firebug.LinrLLWModel.initHTMLEditor();	
			//Firebug.LinrLLWModel.editHTML();
			linr.loaded = true;
		}
		/*}else{
			linr.paneDoc = context;
			//Firebug.Console.log(window);
			linr.doc = content.document;
			linr.curMsObj = linr.doc.body;
			
			Firebug.chrome.selectPanel(linr.panelName).printLine('test');
			//alert(LGet('#lr_skin_dlg').innerHTML);
		}*/
	},
	tabKey:function(obj,e){
		if(e.keyCode==9){
			//var sel = linr.selection();
			linr.insertAtCarset(obj,'&nbsp;&nbsp;&nbsp;&nbsp;','',true);
			e.preventDefault();
			linr.stopEvt(e);
		}
		
	},
	editorMsDn:function(e){
	},
	cssToHtml:function(str,n){
		var _di = str.indexOf('.');
		var _si = str.indexOf('#');
		var _cls='',_id='',_tag='',_ok='';
		if(_di!=-1 && _si!=-1){
			if(_di>_si){
				_cls = str.substring(_di+1);
				_id = str.substring(_si+1,_di);
				_tag = str.substring(0,_si);
			}else{
				_id = str.substring(_si+1);
				_cls = str.substring(_di+1,_si);
				_tag = str.substring(0,_di);
			}
		}else if(_di!=-1 && _si==-1){
			_cls = str.substring(_di+1);
			_id = '';
			_tag = str.substring(0,_di);
		
		}else if(_si!=-1 && _di==-1){
			_id = str.substring(_si+1);
			_cls = '';
			_tag = str.substring(0,_si);
		}
		if(_tag!='')_ok='<'+_tag;
		if(_id!='')_ok+=' id="'+_id+'"';
		if(_cls!='')_ok+=' class="'+_cls+'"';
		if(_tag!='')_ok+='>';
		if(n){
			return '</'+_tag+'>';
		}else{
			return _ok;
		}
	},
	tabHandleKeyDown:function(evt){//http://www.junasoftware.com/blog/handling-tabs-in-textareas-across-browsers.aspx
		var tab = String.fromCharCode(9); 
		var e = window.event || evt; 
		var t = e.target ? e.target : e.srcElement ? e.srcElement : e.which; 
		var scrollTop = t.scrollTop; 
		var k = e.keyCode ? e.keyCode : e.charCode ? e.charCode : e.which; 
		if (k == 9 && !e.ctrlKey && !e.altKey) { 
			if(t.setSelectionRange){ 
				e.preventDefault(); 
				var ss = t.selectionStart; 
				var se = t.selectionEnd; 
				// Multi line selection 
				if (ss != se && t.value.slice(ss,se).indexOf("\n") != -1) { 
					if(ss>0){ 
						ss = t.value.slice(0,ss).lastIndexOf("\n")+1; 
					} 
					var pre = t.value.slice(0,ss); 
					var sel = t.value.slice(ss,se); 
					var post = t.value.slice(se,t.value.length); 
					if(e.shiftKey){ 
						var a = sel.split("\n") 
						for (i=0;i<a.length;i++){ 
							if(a[i].slice(0,1)==tab||a[i].slice(0,1)==' ' ){ 
								a[i]=a[i].slice(1,a[i].length) 
							} 
						} 
						sel = a.join("\n"); 
						t.value = pre.concat(sel,post); 
						t.selectionStart = ss; 
						t.selectionEnd = pre.length + sel.length; 
					} 
					else{ 
						sel = sel.replace(/\n/g,"\n"+tab); 
						pre = pre.concat(tab); 
						t.value = pre.concat(sel,post); 
						t.selectionStart = ss; 
						t.selectionEnd = se + (tab.length * sel.split("\n").length); 
					} 
				} 
				// Single line selection 
				else { 
					if(e.shiftKey){  
						var brt = t.value.slice(0,ss); 
						var ch = brt.slice(brt.length-1,brt.length); 
						if(ch == tab||ch== ' '){ 
							t.value = brt.slice(0,brt.length-1).concat(t.value.slice(ss,t.value.length)); 
							t.selectionStart = ss-1; 
							t.selectionEnd = se-1; 
						} 
					} 
					else{ 
						t.value = t.value.slice(0,ss).concat(tab).concat(t.value.slice(ss,t.value.length)); 
						if (ss == se) { 
							t.selectionStart = t.selectionEnd = ss + tab.length; 
						} 
						else { 
							t.selectionStart = ss + tab.length; 
							t.selectionEnd = se + tab.length; 
						} 
					} 
				} 
			} 
			else{ 
				e.returnValue=false; 
				var r = document.selection.createRange(); 
				var br = document.body.createTextRange(); 
				br.moveToElementText(t); 
				br.setEndPoint("EndToStart", r); 
				//Single line selection 
				if (r.text.length==0||r.text.indexOf("\n") == -1) { 
					if(e.shiftKey){      
						var ch = br.text.slice(br.text.length-1,br.text.length); 
						if(ch==tab||ch==' '){ 
							br.text = br.text.slice(0,br.text.length-1) 
							r.setEndPoint("StartToEnd", br); 
						} 
					} 
					else{ 
						var rtn = t.value.slice(br.text.length,br.text.length+1); 
						if(rtn!=r.text.slice(0,1)){ 
							br.text = br.text.concat(rtn);  
						} 
						br.text = br.text.concat(tab);  
					} 
					var nr = document.body.createTextRange(); 
					nr.setEndPoint("StartToEnd", br); 
					nr.setEndPoint("EndToEnd", r); 
					nr.select(); 
				} 
				//Multi line selection 
				else{ 
					if(e.shiftKey){      
						var a = r.text.split("\r\n") 
						var rt = t.value.slice(br.text.length,br.text.length+2); 
						if(rt==r.text.slice(0,2)){ 
							var p = br.text.lastIndexOf("\r\n".concat(tab)); 
							if(p!=-1){ 
								br.text = br.text.slice(0,p+2).concat(br.text.slice(p+3,br.text.length)); 
							} 
						} 
						for (i=0;i<a.length;i++){ 
							var ch = a[i].length>0&&a[i].slice(0,1); 
							if(ch==tab||ch==' '){ 
								a[i]=a[i].slice(1,a[i].length) 
							} 
						} 
						r.text = a.join("\r\n"); 
					} 
					else{ 
						if(br.text.length>0){ 
							var rt = t.value.slice(br.text.length,br.text.length+2); 
							if(rt!=r.text.slice(0,2)){ 
								r.text = tab.concat(r.text.split("\r\n").join("\r\n".concat(tab))); 
							} 
							else{ 
								var p = br.text.slice(0,ss).lastIndexOf("\r\n")+2;   
								br.text = br.text.slice(0,p).concat(tab,br.text.slice(p,br.text.length)); 
								r.text = r.text.split("\r\n").join("\r\n".concat(tab)); 
							} 
						} 
						else{ 
							r.text = tab.concat(r.text).split("\r\n").join("\r\n".concat(tab)); 
						} 
					}  
					var nr = document.body.createTextRange(); 
					nr.setEndPoint("StartToEnd", br); 
					nr.setEndPoint("EndToEnd", r); 
					nr.select(); 
				} 
			} 
		} 
		t.scrollTop = scrollTop; 
	},
	author:'Linr@nihaoku.cn'
};

function LrGet(id){return (typeof(id)=='string')?linr.doc.getElementById(id):id;}
//function LGet(id){return (typeof(id)=='string')?linr.paneDoc.document.getElementById(id):id;}
function LGet(id, bool){return (typeof(id)=='string')? (!bool ? linr.paneDoc.querySelector(id) : linr.paneDoc.querySelectorAll(id)):id;}

var panelName = linr.panelName;

Firebug.LinrLLWModel = extend(Firebug.Module, 
{
    shutdown: function(){
	/*
      if(Firebug.getPref('defaultPanelName')==linr.panelName) {
        Firebug.setPref('defaultPanelName','console');
      }
	  */
	  Firebug.Module.shutdown.apply(this, arguments);
	  
    },
    showPanel: function(browser, panel){ 
		var isLrPanel = panel && panel.name == panelName;
        var lrButtons = browser.chrome.$("fbFirebugTestExtensionButtons");
        collapse(lrButtons, !isLrPanel);
    }, 
	addStyleSheet : function (doc) {
		var lc = document.getElementById("l-css");
		if (!lc) {
			lc = createStyleSheet(doc, "chrome://linrllw/content/LinrLLW.css");
			lc.id = "l-css";
			addStyleSheet(doc, lc);
		}
	},
	show : function (context) {
		// Forces Firebug to be shown, even if it's off
		Firebug.toggleBar(true);
		Firebug.toggleBar(true, panelName);
		if (Firebug.currentContext) {
			var panel = Firebug.currentContext.getPanel(panelName);
		}
	},
	hide : function (context) {
		Firebug.toggleBar(false, panelName);
	},
    cssSprits: function(){ 

		Firebug.LinrLLWModel.initCssSprite();
		//linr.toggleFun('lr-css-sprite');
		
		//linr.doc.body.removeEventListener('mousedown',linr.ieMsDn,true);
		linr.doc.body.addEventListener('mousedown',linr.csMsDn,false);
	}, 
    cssRefresh: function(){ 
		Firebug.LinrLLWModel.initRefreshCssPanel();
    },
	initCssSprite:function(){
		if(LrGet('llw-cs-tbr')==null)
		{
			var noBbl='linr.stopEvt(event);';
			var e=linr.doc.createElement('div');
				e.id='llw-cs-tbr';
				e.className='tt';
				e.innerHTML='<style type="text\/css">.MaskDiv{position:absolute;border:1px solid #39F;z-index:999998;}.MaskImgDiv{position:absolute;border:1px solid #F2542A;background:#A8CAEC;Opacity:.5;z-index:999999;cursor:move;}<\/style><div style="z-index:999999;" class="MaskImgDiv" id="MaskImgDiv"></div>';
			linr.doc.body.appendChild(e);
		}
	},
	initRefreshCssPanel:function(){
		//linr.toggleFun('lr-refress-css');
		var s = [];
		
			var _lnkArr = linr.doc.getElementsByTagName('link');
			
				for(var i=0,j=_lnkArr.length;i<j;i++)
				{
					if(_lnkArr[i].rel=='stylesheet')
					{	
						var _tmpidx = getCSSindex(_lnkArr[i].href.split('?')[0]);
						_lnkArr[i].href = _lnkArr[i].href.split('?')[0]+'?t=' + linr.getRnd(999999);
						s.push(((_lnkArr[i].href) ? _lnkArr[i].href:lrLang.$LW_STR("llwInlineStyle")) + ' <a rel="'+_tmpidx+'" href="#">' + lrLang.$LW_STR("llwDisable") + '</a>');
					}
					
				}
				if(s.length!=0){
					LGet('#lr-css-list').innerHTML='<li>'+s.join('</li><li>')+'</li>';
				}
				
				var _lkArr = LGet('#llw-all-css-panel').getElementsByTagName('a');
				for(var i=0,j=_lkArr.length;i<j;++i)
				{
					_lkArr[i].addEventListener('click',function(ev){
						linr.dbgCss(this.getAttribute('rel'),this);
						linr.stopEvt(ev);
					},false);
				}
				
			function getCSSindex(str)
			{
				var _css = linr.doc.styleSheets;
				for(var v=0,s=_css.length;v<s;++v)
				{
					if(str==_css[v].href.split('?')[0])
					{
						return v;
					}
				}
				return -1;
			}
	},
	editHTML:function()
	{
		linr.doc.designMode='on';
		linr.doc.body.contentEditable=true;
		Firebug.LinrLLWModel.initHTMLEditor();
	},
	initHTMLEditor:function()
	{
		//linr.toggleFun('lr-wyw-editor');	
		linr.doc.body.removeEventListener('mousedown',linr.csMsDn,false);
		//linr.doc.body.addEventListener('mousedown',linr.ieMsDn,true);
		
	},imInput:function(txt){
		var e=arguments.callee.caller.arguments[0];
		linr.tabKey(txt,e);
		//alert(e.keyCode);
		if(!e.ctrlKey)return;
		var key = e.keyCode;
		var h = [];
		switch(key)
		{
			case 13:
				break;
			case 49:
				h=['<div id="" class="">\r\n\t<ul id="" class="">\r\n\t\t<li>'+lrLang.$LW_STR("llwCtt"),'</li>\r\n\t</ul>\r\n</div>'];
				break;
			case 50:
				h=['<h2>','"</h2>'];
				break;
			case 51:
				h=['<h3>','"</h3>'];
				break;
			case 66:
				h=['<input type="button" value="','" />'];
				break;
			case 68:
				h=[linr.selection(),''];
				break;
			case 75:
				h=['<a href="#">','</a>'];
				break;
			case 73:
				h=[' id="','"'];
				break;
			case 76:
				h=['<li>','</li>'];
				break;
			case 78:
				h=['<span>','</span>'];
				break;				
			case 83:
				e.preventDefault();
				linr.setRouterEvent(LGet('#lr-htm-save-lnk'),'click');
				break;				
			case 81:
				h=[' class="','"'];
				break;
			case 80:
				h=['<img src="','" alt="" />'];
				break;
			case 186:
				h=['\'','\''];
				break;
			case 187:
				h=['\<\%\r\n\t','\r\n%>'];
				break;
			case 188:
				h=['<','>'];
				break;
			case 190:
				h=['</','>'];
				break;
			case 191:
				h=['<!-- ', ' -->'];
				break;
			case 192:
				h=['<div class="">\r\n'+lrLang.$LW_STR("llwCtt"),'\r\n</div>'];
				break;
			case 221:
				h=['(\'', '\')'];
				break;
			case 222:
				h=['"', '"'];
				break;
			case 219:
				h=['[\'','\']'];
				break;
		}
		if(h.length>1){
			linr.insertAtCarset(txt,h[0],h[1]);
			e.preventDefault();
		}
	},
	watchWindow: function(context, win) {
		//FirebugContext.window.addEventListener("load", this.onLoad, false);
	},
	onLoad: function(){
		//if(FirebugContext.panelName != panelName){return;}
		//linr.onLLWload();
		//FirebugContext.linrContext.renderStats(true); || !FirebugContext.linrContext.isStatsAvail()) 
	},
	showContext: function(browser, context) {
	},
	destroyContext: function(context) {
    },
	addDOMContent : function (panelNode) {
		var baseContent = domplate({
				panelBase:
				DIV({
						id : "linrlightweb",
						class : "linrlightweb"
					}
				)
			});
		baseContent.panelBase.replace({}, panelNode, baseContent);
	}
});
/* Panel */
function LinrLLWPanel() {}

LinrLLWPanel.prototype = extend(Firebug.Panel, 
{ 
    name: panelName, 
    title:lrLang.$LW_STR("LinrLightWeb"), 
	searchable: false, 
    editable: false,
    inspectable: true,
    inspectHighlightColor: "green",
	initialize: function(context, doc) {
		Firebug.Panel.initialize.apply(this, arguments);
		Firebug.LinrLLWModel.addStyleSheet(this.document);
		//Firebug.LinrLLWModel.addDOMContent(this.panelNode);
		Firebug.Inspector.addListener(this);
		linr.onLLWload(this);
		//setTimeout(function(ctx){linr.onLLWload(ctx);},1,this);
    },
	printLine: function(message) {
      var elt = this.document.createElement("div");
      elt.innerHTML = message;
      this.panelNode.appendChild(elt);

    },
	clearContent:function(){
		this.panelNode.innerHTML='';
	},
    
	//open url in a new tab
  	openNewTab: function(url) {
  		if (url) {
  			gBrowser.selectedTab = gBrowser.addTab(url);
  		} else {
  			gBrowser.selectedTab = gBrowser.addTab();
  		}
      return gBrowser.selectedTab;
    },
	/*show:function(){
		
	},
	hide:function(){},*/
	log: function() {
		for (var len = arguments.length, i = 0; i < len; i++) {
		  Firebug.Console.log(arguments[i]);
		}
	},
	startInspecting: function(){},
    inspectNode: function(node){},
    stopInspecting: function(node, canceled){
		if (canceled)
            return;
    },
	supportsObject: function(object, type)
    {
        if (object instanceof Element)
        {
			return 1;
        }
        return 0;
    },
    onStartInspecting: function(context)
    {
    },
    onInspectNode: function(context, node)
    {
    },
    onStopInspecting: function(context, node, canceled){
		linr.curMsObj = node;
		linr.ieMsDn(false, node);
		//linr.setRouterEvent(node,'mousedown');
    }
}); 
Firebug.registerModule(Firebug.LinrLLWModel); 
Firebug.registerPanel(LinrLLWPanel); 
}});