// Listen for ALL links at the top level of the document. For
// testing purposes, we're not going to worry about LOCAL vs.
// EXTERNAL links - we'll just demonstrate the feature.
$( document ).on(
	"click",
	"a",
	function( event ){

		// Stop the default behavior of the browser, which
		// is to change the URL of the page.
		event.preventDefault();

		// Manually change the location of the page to stay in
		// "Standalone" mode and change the URL at the same time.
		location.href = $( event.target ).attr( "href" );

	}
);

$(function() {
	
	var updates = {
		updateModal: null
		, init: function() {
			var me = this;
			
			me.SetupUpdateModal();
			me.SetUpdateListener();
			
			me.updateModal.find('.btn-update').click(function(e) {
				e.preventDefault();
				me.updateModal.modal('hide');
				location.reload();
			});
		}
		
		, SetUpdateListener: function() {
			var me = this;
			
			if (window.applicationCache) {
				applicationCache.addEventListener('updateready', function() {
					me.updateModal.modal('show');
				});
			}
		}
		
		, SetupUpdateModal: function() {
			var me = this;
			
			me.updateModal = $('#UpdateModal');
			me.updateModal.modal('hide');
		}
	}
	
	updates.init();
	
	var onlineStatus = {
		init: function() {
			var me = this;
			
			me.GetCurrentStatus();
		}
		
		, GetCurrentStatus: function() {
			var me = this;
			
			setInterval(function () {
				if(navigator.onLine) {
					$('div.online-status').removeClass('offline').addClass('online').find('span').text('online');
				} else {
					$('div.online-status').removeClass('online').addClass('offline').find('span').text('offline');
				}
			}, 250);
		}
	}
	
	onlineStatus.init();
	
	var offlineStorage = {
		init: function() {
			var me = this;
			
			me.Delete('testing');
			me.Delete('testing-1');
			me.Delete('testing-2');
			me.Delete('testing-3');
			
			me.SetItem('testing', ['Type','the-type', 'Name', 'the-name']);
			me.SetItem('testing-1', ['Type','the-type', 'Name', 'the-name-1']);
			me.SetItem('testing-2', ['Type','names', 'Firstname', 'Pete', 'Lastname', 'Rix', 'Age', 100]);
			me.SetItem('testing-3', ['Type','names', 'Firstname', 'Paddy', 'Lastname', 'Ward', 'Age', 120]);
			
			//me.Index();
			var a = me.IndexToArray('the-type');
			var b = me.IndexToArray('names');
			
			console.log(a[1].Name);
			console.log(b[1].Lastname);
		}
		
		, Index: function() {
			var me = this;
			
			//Use this to return a list of index keys
			var index = simpleStorage.index();
			
			console.log(index);
			
			return index;
		}
		
		, IndexToArray: function(indexType) {
			var me = this;
			
			var index = simpleStorage.index();
			
			var returnArray = [];
			
			var arrayItems = '{';
			
			for (var i = 0; i < index.length; i++) {
				var indexItem = me.GetItem(index[i]);
				
				if(indexItem[1] == indexType) {
					for (var z = 0; z < indexItem.length; z++) {
						if(z % 2) {
							if((z + 1) == indexItem.length) {
								arrayItems = arrayItems + '"' + indexItem[z].toString() + '"';
							} else {
								arrayItems = arrayItems + '"' + indexItem[z].toString() + '", ';
							}
						} else {
							arrayItems = arrayItems + indexItem[z] + ' : ';
						}
					}
					arrayItems = arrayItems + '}';
					returnArray.push(eval('(' + arrayItems + ')'));
					arrayItems = '{';
				}
			}
			
			return returnArray;
		}
		
		, GetItem: function(key) {
			var me = this;
			
			return simpleStorage.get(key);
		}
		
		, SetItem: function(key, data) {
			var me = this;
			
			//simpleStorage.set(guid, ['list', listname, listcolor]);
			simpleStorage.set(key, data);
		}
		
		, Delete: function(key) {
			var me = this;
			
			simpleStorage.deleteKey(key);
		}
		
		, ClearData: function() {
			var me = this;
			
			simpleStorage.flush();
		}
	}
	
	offlineStorage.init();
	
	var storage = {
		results: []
		, lists: []
		, listItems: []
		, keysArray: []
		, selectedList: null
		, selectedListItem: null
		, deleteListModal: null
		, deleteListItemModal: null
		, showHide: null
		, init: function() {
			var me = this;
			
			me.PopulateLists();
			
			me.GetSelectedList();
			me.GetSelectedListItem();
			
			me.SetupDeleteListModal();
			me.SetupDeleteListItemModal();
			
			me.WindowResizeListener();
			
			if(me.selectedList != null) {
				me.LoadList(me.selectedList, false);
				me.SetSelectedListTitle();
				me.GetEditingList();
			}
			
			if(me.selectedListItem != null) {
				me.GetEditingListItem();
			}
			
			$('.btn-add-list').click(function(e) {
				e.preventDefault();
				
				guid = me.GenerateGuid();
				
				var listname = $('input[name=text-add-list-name]').val();
				var listcolor = $('select[name=select-add-list-color]').val();
				var listredirect = $('select[name=redirect-add-list]').val();
				
				simpleStorage.set(guid, ['list', listname, listcolor]);
				
				me.SetSelectedList(guid);
				
				if(listredirect == 'yes') {
					location.href = "/list.html";
				} else {
					location.reload();
				}
				
				return false;
			});
			
			$('.btn-add-item').click(function(e) {
				e.preventDefault();
				
				guid = me.GenerateGuid();
				
				var listitemName = $('input[name=text-add-list-item]').val();
				var listitemDescription = $('textarea[name=textarea-add-list-item-description]').val();
				var key = me.selectedList;
				
				//need to get total of existing numbers
				var counter = 0;
				var res = simpleStorage.index();
				for (var i = 0; i < res.length; i++) {
					var listItems = simpleStorage.get(res[i]);
					if(listItems[0] == 'list-item' && listItems[1] == key && listItems[5] == 0) {
						counter++;
					}
				}
				
				simpleStorage.set(guid, ['list-item', key, listitemName, listitemDescription, (counter).toString(), 0]);
				location.reload();
				
				return false;
			});
			
			$('.btn-save-list').click(function(e) {
				e.preventDefault();
				
				guid = me.selectedList;
				
				var listname = $('input[name=text-edit-list-name]').val();
				var listcolor = $('select[name=select-edit-list-color]').val();
				
				simpleStorage.set(guid, ['list', listname, listcolor]);
				
				location.href = "/";
				
				return false;
			});
			
			$('.btn-save-item').click(function(e) {
				e.preventDefault();
				
				guid = me.selectedListItem;
				
				var listitemName = $('input[name=text-edit-list-item]').val();
				var listitemDescription = $('textarea[name=textarea-edit-list-item-description]').val();
				var key = me.selectedList;
				
				var res = simpleStorage.get(guid);
				var currentPos = res[4];
				var done = res[5];
				
				simpleStorage.set(guid, ['list-item', key, listitemName, listitemDescription, currentPos, done]);
				location.href = '/list.html';
				
				return false;
			});
			
			//me.SetupLeftSwipe();
			//me.SetupRightSwipe();
			
		}
		
		, SetupDeleteListModal: function() {
			var me = this;
			
			me.deleteListModal = $('#DeleteListModal');
			me.deleteListModal.modal('hide');
		}
		
		, SetupDeleteListItemModal: function() {
			var me = this;
			
			me.deleteListItemModal = $('#DeleteListItemModal');
			me.deleteListItemModal.modal('hide');
		}
		
		, SetupLeftSwipe: function() {
			var me = this;
			
			$(document).on('swipeleft', 'ul.list-items li', function(e) {
				var btn = $('<button class="inline-delete">Delete</button>');
				$(this).append(btn).find('button').animate({
					width: 100
				}, 500);
			});
		}
		
		, SetupRightSwipe: function() {
			var me = this;
			
			$(document).on('swiperight', 'ul.list-items li', function(e) {
				var btn = $('<button class="inline-delete">Delete</button>');
				$(this).find('button.inline-delete').animate({
					width: 0
				}, 500, function() {
					$(this).remove();
				});
			});
		}
		
		, PopulateLists: function() {
			var me = this;
			
			var list = simpleStorage.index();
			
			for (var i = 0; i < list.length; i++) {
				var res = simpleStorage.get(list[i]);
				if(res[0] == 'list') {
					me.lists.push({Key : list[i], Type: res[0], Listname: res[1], Listcolor: res[2]});
				}
			}
			
			me.BuildLists();
		}
		
		, BuildLists: function() {
			var me = this;
			
			var res = me.lists.sort(me.DynamicSort('Listname'));
			var resLength = res.length;
			
			var itemsUl = $('<ul class="list-items"></ul>');
			
			for (var i = 0; i < resLength; i++) {
				var baseListColor = res[i].Listcolor;
				
				if(baseListColor == null) {
					baseListColor = '#000000';
				}
				
				var rgbColor = colourFunctions.HexToRGB(baseListColor);
				var adjustedColor = colourFunctions.Lighten(rgbColor, 0);
				var hexColor = colourFunctions.RGBToHex(Math.ceil(adjustedColor.rgb[0]), Math.ceil(adjustedColor.rgb[1]), Math.ceil(adjustedColor.rgb[2]));
				
				var iconBgColor = colourFunctions.Darken(rgbColor, 20);
				var iconBgHexColor = colourFunctions.RGBToHex(Math.ceil(iconBgColor.rgb[0]), Math.ceil(iconBgColor.rgb[1]), Math.ceil(iconBgColor.rgb[2]));
				
				var labelColor = colourFunctions.CheckContrast(colourFunctions.HexToRGB(hexColor));
				var hexLabelColor = colourFunctions.RGBToHex(Math.ceil(labelColor.rgb[0]), Math.ceil(labelColor.rgb[1]), Math.ceil(labelColor.rgb[2]));
				
				var badgeTextColor = '#ffffff';
				
				if(hexLabelColor == '#ffffff') {
					badgeTextColor = '#000000';
				}
				
				var li = $('<li data-key="' + res[i].Key + '"></li>');
				var gridholder = $('<div class="row"></div>');
				
				var leftcol = $('<div class="col-xs-1 count" style="background-color:' + res[i].Listcolor + '; color:' + hexLabelColor + ';"><span>' + me.GetItemCount(res[i].Key) + '</span></a>');
				
				var middlecol = $('<div class="col-xs-7 info" ></a>');
				var href = $('<a href="#" data-key="' + res[i].Key + '"><h2>' + res[i].Listname + '</h2></a>').click(function(e) {
					e.preventDefault();
					
					var key = $(this).data('key');
					me.SetSelectedList(key);
					
					location.href = '/list.html';
					
					return false;
				});
				
				middlecol.append(href);
				
				var rightcol = $('<div class="col-xs-4 text-right actions"></a>');
				var deleter = $('<a href="#" class="action-button" style="background-color:' + iconBgHexColor + ';" data-key="' + res[i].Key + '"><span class="glyphicon glyphicon-remove"></span></a>').click(function(e) {
					e.preventDefault();
					
					me.deleteListModal.find('.btn-list-delete').attr('data-key', $(this).data('key')).click(function(e) {
						//e.preventDefault();
						me.DeleteList($(this).data('key'));
						me.deleteListModal.modal('hide');
					});
					
					me.deleteListModal.modal('show');
					
					return false;
				});
				
				var editer = $('<a href="#" class="action-button" style="background-color:' + iconBgHexColor + ';" data-key="' + res[i].Key + '"><span class="glyphicon glyphicon-pencil"></span></a>').click(function(e) {
					e.preventDefault();
					
					var key = $(this).data('key');
					me.SetSelectedList(key);
					
					location.href = '/edit.html';
					
					return false;
				});
				
				rightcol.append(editer).append(deleter);
				
				gridholder.append(leftcol).append(middlecol).append(rightcol);
				li.append(gridholder);
				
				itemsUl.append(li);
			}
			
			$('div.display-lists').append(itemsUl);
			
			me.UpdateListRows();
			me.UpdateNumberPositions();
		}
		
		, UpdateListRows: function() {
			var me = this;
			
			$('ul.list-items li .row').each(function() {
				var h = 0;
				$(this).find('div').each(function() {
					if($(this).outerHeight(true) > h) {
						h = $(this).outerHeight(true);
					}
				});
				
				$(this).find('div').each(function() {
					$(this).css({'height': h + 'px'});
				});
			});
		}
		
		, UpdateNumberPositions: function() {
			var me = this;
			
			$('ul.list-items li .row').each(function() {
				$(this).find('div.count').each(function() {
					var h = $(this).outerHeight(true);
					
					var spanHeight = $(this).find('span').outerHeight();
					
					var diff = (h - spanHeight) / 2;
					
					$(this).find('span').css({'padding-top': (diff - 2) + 'px'});
				});
			});
		}
		
		, UpdateMoverPositions: function() {
			var me = this;
			
			$('ul.list-items li .row').each(function() {
				$(this).find('div.mover').each(function() {
					var h = $(this).outerHeight(true);
					
					var spanHeight = $(this).find('span').outerHeight();
					
					var diff = (h - spanHeight) / 2;
					
					$(this).find('span').css({'padding-top': (diff - 2) + 'px'});
				});
			});
		}
		
		, GetItemCount: function(key) {
			var me = this;
			
			var counter = 0;
			
			var list = simpleStorage.index();
			
			for (var i = 0; i < list.length; i++) {
				var res = simpleStorage.get(list[i]);
				if(res[0] == 'list-item' && res[1] == key) {
					counter++;
				}
			}
			
			return counter;
		}
		
		, DeleteList: function(key) {
			var me = this;
			
			var listItems = simpleStorage.index();
			
			for (var i = 0; i < listItems.length; i++) {
				var res = simpleStorage.get(listItems[i]);
				if(res[0] == 'list-item' && res[1] == key) {
					simpleStorage.deleteKey(listItems[i]);
				}
			}
			simpleStorage.deleteKey(key);
			me.SetSelectedList(null);
			$('li[data-key=' + key + ']').slideUp(500, function() {
				$(this).remove();
			});
			
			//location.reload();
		}
		
		, LoadList: function(key, showDone) {
			var me = this;
			
			var list = simpleStorage.index();
			
			me.listItems = [];
			
			for (var i = 0; i < list.length; i++) {
				var res = simpleStorage.get(list[i]);
				if(!showDone) {
					if(res[0] == 'list-item' && res[1] == key && res[5] == 0) {
						me.listItems.push({Key : list[i], Type: res[0], Parent: res[1], ListItem: res[2], Description: res[3], Order: res[4], Done: res[5]});
					}
				} else {
					if(res[0] == 'list-item' && res[1] == key) {
						me.listItems.push({Key : list[i], Type: res[0], Parent: res[1], ListItem: res[2], Description: res[3], Order: res[4], Done: res[5]});
					}
				}
			}
			
			me.BuildList();
		}
		
		, BuildList: function() {
			var me = this;
			
			var res = me.listItems.sort(me.DynamicSort('Order'));
			var resLength = res.length;
			
			var baseSelectedList = simpleStorage.get('selected-list');
			var baseListColorArray = simpleStorage.get(baseSelectedList[0]);
			
			var baseListColor = baseListColorArray[2];
			var baseIconBackgroundColor = baseListColor;
			
			var itemsUl = $('<ul class="list-items"></ul>');
			
			var lighten = 4;
			
			for (var i = 0; i < resLength; i++) {
				
				var rgbColor = colourFunctions.HexToRGB(baseListColor);
				var adjustedColor = colourFunctions.Lighten(rgbColor, lighten);
				var hexColor = colourFunctions.RGBToHex(Math.ceil(adjustedColor.rgb[0]), Math.ceil(adjustedColor.rgb[1]), Math.ceil(adjustedColor.rgb[2]));
				
				var iconRgbColor = colourFunctions.HexToRGB(baseIconBackgroundColor);
				
				var iconBgColor = colourFunctions.Darken(iconRgbColor, 20);
				var iconBgHexColor = colourFunctions.RGBToHex(Math.ceil(iconBgColor.rgb[0]), Math.ceil(iconBgColor.rgb[1]), Math.ceil(iconBgColor.rgb[2]));
				
				var iconMoveColor = colourFunctions.Darken(rgbColor, 10);
				var iconMoveHexColor = colourFunctions.RGBToHex(Math.ceil(iconMoveColor.rgb[0]), Math.ceil(iconMoveColor.rgb[1]), Math.ceil(iconMoveColor.rgb[2]));
				
				var labelColor = colourFunctions.CheckContrast(colourFunctions.HexToRGB(hexColor));
				var hexLabelColor = colourFunctions.RGBToHex(Math.ceil(labelColor.rgb[0]), Math.ceil(labelColor.rgb[1]), Math.ceil(labelColor.rgb[2]));
				
				if(res[i].Done == 0) {
					var li = $('<li data-key="' + res[i].Key + '" data-parent="' + res[i].Parent + '" data-listitem="' + res[i].ListItem + '" data-description="' + res[i].Description + '" data-done="' + res[i].Done + '"></li>');
				} else {
					var li = $('<li data-key="' + res[i].Key + '" data-parent="' + res[i].Parent + '" data-listitem="' + res[i].ListItem + '" data-description="' + res[i].Description + '" data-done="' + res[i].Done + '" class="done"></li>');
				}
				var gridholder = $('<div class="row"></div>');
				
				var leftcol = $('<div class="col-xs-1 count mover" style="background-color:' + baseListColor + '; color:' + hexLabelColor + ';"><span class="glyphicon glyphicon-move" style="color:' + iconMoveHexColor + ';"></span></a>');
				
				var middlecol = $('<div class="col-xs-5 info info-items" ></a>');
				var href = $('<a href="#" data-key="' + res[i].Key + '"><h2>' + res[i].ListItem + '</h2><p>' + res[i].Description + '</p></a>').click(function(e) {
					e.preventDefault();
					
					return false;
				});
				
				middlecol.append(href);
				
				var rightcol = $('<div class="col-xs-6 actions text-right"></a>');
				var deleter = $('<a href="#" class="action-button" style="background-color:' + iconBgHexColor + ';" data-key="' + res[i].Key + '"><span class="glyphicon glyphicon-remove"></span></a>').click(function(e) {
					e.preventDefault();
					
					me.deleteListItemModal.find('.btn-item-delete').attr('data-key', $(this).data('key')).click(function(e) {
						//e.preventDefault();
						me.DeleteListItem($(this).data('key'));
						me.deleteListItemModal.modal('hide');
					});
					
					me.deleteListItemModal.modal('show');
					
					return false;
				});
				
				var editer = $('<a href="#" class="action-button" style="background-color:' + iconBgHexColor + ';" data-key="' + res[i].Key + '"><span class="glyphicon glyphicon-pencil"></span></a>').click(function(e) {
					e.preventDefault();
					
					var key = $(this).data('key');
					me.SetSelectedListItem(key);
					
					location.href = '/edit-item.html';
					
					return false;
				});
				
				var done = $('<a href="#" class="action-button" style="background-color:' + iconBgHexColor + ';" data-key="' + res[i].Key + '"><span class="glyphicon glyphicon-ok"></span></a>').click(function(e) {
					e.preventDefault();
					
					var key = $(this).data('key');
					me.SetSelectedListItem(key);
					me.MarkAsDone(key);
					
					return false;
				});
				
				var undone = $('<a href="#" class="action-button" style="background-color:' + iconBgHexColor + ';" data-key="' + res[i].Key + '"><span class="glyphicon glyphicon-repeat"></span></a>').click(function(e) {
					e.preventDefault();
					
					var key = $(this).data('key');
					me.SetSelectedListItem(key);
					me.MarkAsUndone(key);
					
					return false;
				});
				
				if(res[i].Done == 0) {
					rightcol.append(done).append(editer).append(deleter);
				} else {
					rightcol.append(undone).append(editer).append(deleter);
				}
				
				gridholder.append(leftcol).append(middlecol).append(rightcol);
				li.append(gridholder);
				
				itemsUl.append(li);
				
				itemsUl.sortable({ axis: 'y', handle: '.count', cancel: '.done .count', items: '> li:not(.done)' }).bind('sortstop', function(e, ui) {
					me.ReorderItems(null);
				});
				
				baseListColor = hexColor;
			}
			
			$('div.display-list-items').append(itemsUl);
			
			me.UpdateListRows();
			me.UpdateMoverPositions();
			
			me.AddShowHideCompleted();
		}
		
		, MarkAsDone: function(key) {
			var me = this;
			
			var guid = key;
			
			var res = simpleStorage.get(key);
			var parent = res[1];
			var listitemName = res[2];
			var listitemDescription = res[3];
			var currentPos = "99";
			
			simpleStorage.set(guid, ['list-item', parent, listitemName, listitemDescription, currentPos, 1]);
			
			$('li[data-key=' + key + ']').slideUp(500, function() {
				$(this).remove();
				me.ReorderItems(key);
			});
		}
		
		, MarkAsUndone: function(key) {
			var me = this;
			
			var guid = key;
			
			var res = simpleStorage.get(key);
			var parent = res[1];
			var listitemName = res[2];
			var listitemDescription = res[3];
			
			//need to get total of existing numbers
			var counter = 0;
			var res = simpleStorage.index();
			for (var i = 0; i < res.length; i++) {
				var listItems = simpleStorage.get(res[i]);
				if(listItems[0] == 'list-item' && listItems[1] == parent && listItems[5] == 0) {
					counter++;
				}
			}
			
			simpleStorage.set(guid, ['list-item', parent, listitemName, listitemDescription, counter.toString(), 0]);
			
			var res = simpleStorage.get('show-hide');
			if(res != undefined) {
				if(res[0] == 0) {
					me.showHide = false;
				} else {
					me.showHide = true;
				}
			}
			
			$('div.display-list-items').empty();
			me.LoadList(me.selectedList, me.showHide);
		}
		
		, ReorderItems: function(deletedKey) {
			var me = this;
			
			var i = 0;
			
			$('ul.list-items li:not(.done)').each(function() {
				var parent = $(this).data('parent');
				var key = $(this).data('key');
				var listitem = $(this).data('listitem');
				var description = $(this).data('description');
				var done = $(this).data('done');
				
				if(key != deletedKey) {
					simpleStorage.set(key, ['list-item', parent, listitem, description, i.toString(), done]);
			
					i++;
				}
			});
			
			location.reload();
		}
		
		, DeleteListItem: function(key) {
			var me = this;
			
			simpleStorage.deleteKey(key);
			me.SetSelectedListItem(null);
			
			$('li[data-key=' + key + ']').slideUp(500, function() {
				$(this).remove();
				me.ReorderItems(key);
			});
		}
		
		, AddShowHideCompleted: function() {
			var me = this;
			
			var row = $('.show-hide-completed');
			
			row.find('a.done-hidden').click(function() {
				$(this).hide();
				$('a.done-visible').show();
				$('div.display-list-items').empty();
				me.LoadList(me.selectedList, true);
				
				simpleStorage.set('show-hide', [1]);
			});
			
			row.find('a.done-visible').click(function() {
				$(this).hide();
				$('a.done-hidden').show();
				$('div.display-list-items').empty();
				me.LoadList(me.selectedList, false);
				
				simpleStorage.set('show-hide', [0]);
			});
		}
		
		, GetEditingList: function() {
			var me = this;
			
			var res = simpleStorage.get(me.selectedList);
			//probably need to think about building this to array?
			$('input[name=text-edit-list-name]').val(res[1]);
			$('select[name=select-edit-list-color]').val(res[2]);
		}
		
		, GetEditingListItem: function() {
			var me = this;
			
			var res = simpleStorage.get(me.selectedListItem);
			//probably need to think about building this to array?
			if(res != undefined) {
				$('input[name=text-edit-list-item]').val(res[2]);
				$('textarea[name=textarea-edit-list-item-description]').val(res[3]);
			}
		}
		
		, SetSelectedList: function(key) {
			var me = this;
			
			simpleStorage.set('selected-list', [key]);
			
			location.href = "/";
		}
		
		, SetSelectedListItem: function(key) {
			var me = this;
			
			simpleStorage.set('selected-list-item', [key]);
		}
		
		, GetSelectedList: function() {
			var me = this;
			
			var res = simpleStorage.get('selected-list');
			if(res != undefined) {
				me.selectedList = res[0];
			}
		}
		
		, GetSelectedListItem: function() {
			var me = this;
			
			var res = simpleStorage.get('selected-list-item');
			if(res != undefined) {
				me.selectedListItem = res[0];
			}
		}
		
		, SetSelectedListTitle: function() {
			var me = this;
			
			var res = simpleStorage.get(me.selectedList);
			$('h2.selected-list-name').text(res[1]);
		}
		
		, DynamicSort: function(property) {
			var sortOrder = 1;
			if(property[0] === "-") {
				sortOrder = -1;
				property = property.substr(1);
			}
			return function (a,b) {
				var result = (a[property].toLowerCase() < b[property].toLowerCase()) ? -1 : (a[property].toLowerCase() > b[property].toLowerCase()) ? 1 : 0;
				return result * sortOrder;
			}
		}
				
		, GenerateGuid: function() {
			var me = this;
			
			return me.GenerateGuidPart() + me.GenerateGuidPart() + '-' + me.GenerateGuidPart() + '-' + me.GenerateGuidPart() + '-' +
			   me.GenerateGuidPart() + '-' + me.GenerateGuidPart() + me.GenerateGuidPart() + me.GenerateGuidPart();
		}
		
		, GenerateGuidPart: function() {
			var me = this;
			
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		
		, WindowResizeListener: function() {
			var me = this;
			
			$(window).resize(function() {
				me.UpdateListRows();
			});
		}
	}
	
	var colourFunctions = {
		Lighten: function (color, amount) {
			var me = this;

			var sentColor = new less.tree.Color([color.r, color.g, color.b], 1)
			var sentAmount = new less.tree.Value(amount);
			return less.tree.functions.lighten(sentColor, sentAmount);
		}

		, Darken: function (color, amount) {
			var me = this;

			var sentColor = new less.tree.Color([color.r, color.g, color.b], 1)
			var sentAmount = new less.tree.Value(amount);
			return less.tree.functions.darken(sentColor, sentAmount);
		}

		, HexToRGB: function (hex) {
			var me = this;

			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		}

		, RGBToHex: function (r, g, b) {
			var me = this;

			return "#" + me.ComponentToHex(r) + me.ComponentToHex(g) + me.ComponentToHex(b);
		}

		, ComponentToHex: function (c) {
			var me = this;

			var hex = c.toString(16);
			return hex.length == 1 ? "0" + hex : hex;
		}

		, CheckContrast: function (color) {
			var me = this;

			var sentColor = new less.tree.Color([color.r, color.g, color.b], 1)
			var darkColor = new less.tree.Color([0, 0, 0], 1)
			var lightColor = new less.tree.Color([255, 255, 255], 1)

			return less.tree.functions.contrast(sentColor, darkColor, lightColor, 0.6);
		}
	}
	
	storage.init();

});