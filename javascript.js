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
			
		}
		
		, Index: function() {
			var me = this;
			
			//Use this to return a list of index keys
			var index = simpleStorage.index();
			
			return index;
		}
		
		, GetByType: function(indexType) {
			var me = this;
			
			var index = simpleStorage.index();
			
			var returnArray = [];
			
			var arrayItems = '{';
			
			for (var i = 0; i < index.length; i++) {
				var indexItem = me.GetItem(index[i]);
				
				if(indexItem[1] == indexType) {
					//Add the key to the array
					arrayItems = arrayItems + 'Key : "' + index[i] + '", ';
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
			
			simpleStorage.set(key, data);
		}
		
		, Delete: function(key) {
			var me = this;
			
			simpleStorage.deleteKey(key);
		}
		
		, Count: function(indexType) {
			var me = this;
			
			var counter = 0;
			
			var index = simpleStorage.index();
			
			for (var i = 0; i < index.length; i++) {
				var indexItem = me.GetItem(index[i]);
				
				if(indexItem[1] == indexType) {
					counter++;
				}
			}
			
			return counter;
		}
		
		, Filter: function(filterArray, query) {
			var me = this;
			
			var results = [];
			
			for(var i = 0; i < filterArray.length; i++) { 
				if(query.found(filterArray[i][query.field])) { 
					results.push(filterArray[i]); 
				} 
			}
			return results;
		}
		
		, Query: function(fieldName, comparison) {
			var me = this;
			
			var query = { field: fieldName, found: function(field) { 
					if(field == comparison) { 
						return true;
					} else { 
						return false;
					}
				}
			};
			
			return query;
		}
		
		, ClearData: function() {
			var me = this;
			
			simpleStorage.flush();
		}
	}
	
	offlineStorage.init();
	
	var ui = {
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
			
			if(me.selectedList != "null") {
				me.LoadList(me.selectedList, false);
				me.SetSelectedListTitle();
				me.GetEditingList();
			}
			
			if(me.selectedListItem != "null") {
				me.GetEditingListItem();
			}
			
			$('.btn-add-list').click(function(e) {
				e.preventDefault();
				
				guid = me.GenerateGuid();
				
				var listname = $('input[name=text-add-list-name]').val();
				var listcolor = $('select[name=select-add-list-color]').val();
				var listredirect = $('select[name=redirect-add-list]').val();
				
				offlineStorage.SetItem(guid, ['Type', 'list', 'Key', guid.toString(), 'ListName', listname, 'ListColor', listcolor]);
				
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
				
				var guid = me.GenerateGuid();
				
				var listitemName = $('input[name=text-add-list-item]').val();
				var listitemDescription = $('textarea[name=textarea-add-list-item-description]').val();
				var key = me.selectedList;
				
				//need to get total of existing numbers
				var counter = offlineStorage.Count('list-item');
				
				offlineStorage.SetItem(guid, ['Type', 'list-item', 'Key', guid.toString(), 'Parent', key, 'ItemName', listitemName, 'Description', listitemDescription, 'Position', (counter).toString(), 'Done', 0]);
				
				location.reload();
				
				return false;
			});
			
			$('.btn-save-list').click(function(e) {
				e.preventDefault();
				
				var guid = me.selectedList;
				
				var listname = $('input[name=text-edit-list-name]').val();
				var listcolor = $('select[name=select-edit-list-color]').val();
				
				offlineStorage.SetItem(guid, ['Type', 'list', 'Key', guid.toString(), 'ListName', listname, 'ListColor', listcolor]);
				
				location.href = "/";
				
				return false;
			});
			
			$('.btn-save-item').click(function(e) {
				e.preventDefault();
				
				guid = me.selectedListItem;
				
				var listitemName = $('input[name=text-edit-list-item]').val();
				var listitemDescription = $('textarea[name=textarea-edit-list-item-description]').val();
				var key = me.selectedList;
				
				var listItem = offlineStorage.GetByType('list-item');
			
				var query = offlineStorage.Query("Key", guid);			
				listItem = offlineStorage.Filter(listItems, query);
				
				var currentPos = listItem[0].Position;
				var done = listItem[0].Done;
				
				offlineStorage.SetItem(guid, ['Type', 'list-item', 'Key', guid.toString(), 'Parent', key, 'ItemName', listitemName, 'Description', listitemDescription, 'Position', currentPos, 'Done', done]);
				
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
			
			me.lists = offlineStorage.GetByType('list');
			
			me.BuildLists();
		}
		
		, BuildLists: function() {
			var me = this;
			
			var res = me.lists.sort(me.DynamicSort('ListName'));
			var resLength = res.length;
			
			var itemsUl = $('<ul class="list-items"></ul>');
			
			for (var i = 0; i < resLength; i++) {
				var baseListColor = res[i].ListColor;
				
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
				
				var leftcol = $('<div class="col-xs-1 count" style="background-color:' + res[i].ListColor + '; color:' + hexLabelColor + ';"><span>' + me.GetItemCount(res[i].Key) + '</span></a>');
				
				var middlecol = $('<div class="col-xs-7 info" ></a>');
				var href = $('<a href="#" data-key="' + res[i].Key + '"><h2>' + res[i].ListName + '</h2></a>').click(function(e) {
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
			
			var listItems = offlineStorage.GetByType('list-item');
			
			var query = offlineStorage.Query("Done", 0);			
			listItems = offlineStorage.Filter(listItems, query);
			
			var counter = listItems.length;
			
			return counter;
		}
		
		, DeleteList: function(key) {
			var me = this;
			
			var listItems = offlineStorage.GetByType('list-item');
			
			var query = offlineStorage.Query("Parent", key);			
			listItems = offlineStorage.Filter(listItems, query);
			
			for (var i = 0; i < listItems.length; i++) {
				offlineStorage.Delete(listItems[i].Key);
			}
			
			offlineStorage.Delete(key);
			
			me.SetSelectedList("null");
			$('li[data-key=' + key + ']').slideUp(500, function() {
				$(this).remove();
			});
			
			//location.reload();
		}
		
		, LoadList: function(key, showDone) {
			var me = this;
			
			me.listItems = offlineStorage.GetByType('list-item');
			
			var query = offlineStorage.Query("Parent", key);			
			me.listItems = offlineStorage.Filter(me.listItems, query);
			
			if(!showDone) {
				var queryDone = offlineStorage.Query("Done", 0);				
				me.listItems = offlineStorage.Filter(me.listItems, queryDone);
			}

			me.BuildList();
		}
		
		, BuildList: function() {
			var me = this;
			
			var res = me.listItems.sort(me.DynamicSort('Position'));
			var resLength = res.length;
			
			var baseSelectedList = offlineStorage.GetByType('selected-list');
			var baseSelectedListArray = offlineStorage.GetByType('list');
			
			var query = offlineStorage.Query("Key", baseSelectedList[0].SelectedKey);			
			var baseListColorArray = offlineStorage.Filter(baseSelectedListArray, query);
			
			var baseListColor = baseListColorArray[0].ListColor;
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
					var li = $('<li data-key="' + res[i].Key + '" data-parent="' + res[i].Parent + '" data-listitem="' + res[i].ItemName + '" data-description="' + res[i].Description + '" data-done="' + res[i].Done + '"></li>');
				} else {
					var li = $('<li data-key="' + res[i].Key + '" data-parent="' + res[i].Parent + '" data-listitem="' + res[i].ItemName + '" data-description="' + res[i].Description + '" data-done="' + res[i].Done + '" class="done"></li>');
				}
				var gridholder = $('<div class="row"></div>');
				
				var leftcol = $('<div class="col-xs-1 count mover" style="background-color:' + baseListColor + '; color:' + hexLabelColor + ';"><span class="glyphicon glyphicon-move" style="color:' + iconMoveHexColor + ';"></span></a>');
				
				var middlecol = $('<div class="col-xs-5 info info-items" ></a>');
				var href = $('<a href="#" data-key="' + res[i].Key + '"><h2>' + res[i].ItemName + '</h2><p>' + res[i].Description + '</p></a>').click(function(e) {
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
			
			var filteredArray = [];
			filteredArray = offlineStorage.GetByType('list-item');
			
			var query = offlineStorage.Query("Key", key);
			filteredArray = offlineStorage.Filter(filteredArray, query);
			
			offlineStorage.SetItem(key, ['Type', 'list-item', 'Key', guid.toString(), 'Parent', filteredArray[0].Parent, 'ItemName', filteredArray[0].ItemName, 'Description', filteredArray[0].Description, 'Position', "99", 'Done', 1]);
			
			$('li[data-key=' + key + ']').slideUp(500, function() {
				$(this).remove();
				me.ReorderItems(key);
			});
		}
		
		, MarkAsUndone: function(key) {
			var me = this;
			
			var guid = key;
			
			var filteredArray = [];
			filteredArray = offlineStorage.GetByType('list-item');
			
			var query = offlineStorage.Query("Key", key);
			filteredArray = offlineStorage.Filter(filteredArray, query);
			
			//need to get total of existing numbers
			var parent = filteredArray[0].Parent;
			var counterArray = [];
			counterArray = offlineStorage.GetByType('list-item');
			
			var queryParent = offlineStorage.Query("Parent", parent);
			counterArray = offlineStorage.Filter(counterArray, queryParent);
			
			var queryNotDone = offlineStorage.Query("Done", 0);
			counterArray = offlineStorage.Filter(counterArray, queryNotDone);
			
			var counter = counterArray.length;
			
			offlineStorage.SetItem(key, ['Type', 'list-item', 'Key', guid.toString(), 'Parent', filteredArray[0].Parent, 'ItemName', filteredArray[0].ItemName, 'Description', filteredArray[0].Description, 'Position', counter.toString(), 'Done', 0]);
			
			var showHide = offlineStorage.GetByType('show-hide');
			if(showHide.length > 0) {
				me.showHide = showHide[0].Value == 0 ? false : true;
			} else {
				me.showHide = false;
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
				var listitemName = $(this).data('listitem');
				var listitemDescription = $(this).data('description');
				var done = $(this).data('done');
				
				if(key != deletedKey) {
					offlineStorage.SetItem(key, ['Type', 'list-item', 'Key', key.toString(), 'Parent', parent, 'ItemName', listitemName, 'Description', listitemDescription, 'Position', i.toString(), 'Done', done]);
			
					i++;
				}
			});
			
			location.reload();
		}
		
		, DeleteListItem: function(key) {
			var me = this;
			
			offlineStorage.Delete(key);
			me.SetSelectedListItem("null");
			
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
				
				offlineStorage.SetItem('show-hide', ['Type', 'show-hide', 'Value', 1]);
			});
			
			row.find('a.done-visible').click(function() {
				$(this).hide();
				$('a.done-hidden').show();
				$('div.display-list-items').empty();
				me.LoadList(me.selectedList, false);
				
				offlineStorage.SetItem('show-hide', ['Type', 'show-hide', 'Value', 0]);
			});
		}
		
		, GetEditingList: function() {
			var me = this;
			
			var editingList = [];
			editingList = offlineStorage.GetByType('list');
			
			var query = offlineStorage.Query("Key", me.selectedList);
			editingList = offlineStorage.Filter(editingList, query);
			
			if(editingList.length > 0 ) {
				$('input[name=text-edit-list-name]').val(editingList[0].ListName);
				$('select[name=select-edit-list-color]').val(editingList[0].ListColor);
			}
		}
		
		, GetEditingListItem: function() {
			var me = this;
			
			var editingListItem = [];
			editingListItem = offlineStorage.GetByType('list-item');
			
			var query = offlineStorage.Query("Key", me.selectedListItem);
			editingListItem = offlineStorage.Filter(editingListItem, query);
			
			if(editingListItem.length > 0 ) {
				$('input[name=text-edit-list-item]').val(editingListItem[0].ItemName);
				$('textarea[name=textarea-edit-list-item-description]').val(editingListItem[0].Description);
			}
		}
		
		, SetSelectedList: function(key) {
			var me = this;
			
			offlineStorage.SetItem('selected-list', ['Type', 'selected-list', 'SelectedKey', key]);
			
			location.href = "/";
		}
		
		, SetSelectedListItem: function(key) {
			var me = this;
			
			offlineStorage.SetItem('selected-list-item', ['Type', 'selected-list-item', 'SelectedKey', key]);
		}
		
		, GetSelectedList: function() {
			var me = this;
			
			var selectedList = offlineStorage.GetByType('selected-list');
			
			if(selectedList.length > 0) {
				me.selectedList = selectedList[0].SelectedKey;
			} else {
				me.selectedList = "null";
			}
		}
		
		, GetSelectedListItem: function() {
			var me = this;
			
			var selectedListItem = offlineStorage.GetByType('selected-list-item');
			
			if(selectedListItem.length > 0) {
				me.selectedListItem = selectedListItem[0].SelectedKey;
			} else {
				me.selectedListItem = "null";
			}
		}
		
		, SetSelectedListTitle: function() {
			var me = this;
			
			var selectedList = offlineStorage.GetByType('list');
			
			var query = offlineStorage.Query("Key", me.selectedList);
			selectedList = offlineStorage.Filter(selectedList, query);
			
			$('h2.selected-list-name').text(selectedList[0].ListName);
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
	
	ui.init();

});