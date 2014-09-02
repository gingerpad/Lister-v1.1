Lister v1.1
===========

Simple HTML5 app to create and manage lists using bootstrap and offline storage.
-----------

Is based upon cache.manifest which enables all files referenced to be downloaded to device so that app runs when no web connection available.

Uses simpleStorage.js as an offline storage mechanism with an underscore style layer over the top to make things a bit nicer to access data


Basic storage access functions.
==========


SetItem
------

Allows setting of a local storage item using the following process

`offlineStorage.SetItem(guid, ['Type', 'list', 'Key', guid.toString(), 'ListName', listname, 'ListColor', listcolor]);`

**guid** is the local storages primary key
Data details always calls for **'Type'** and a vlue of type to be the first 2 items in the data array
Everything else is KVP


GetByType
--------

This queries the index (returns a list of all items in local storage mapping on to **Index** method) and converts to a usable object by passing an indexType to the function.

`var listItem = offlineStorage.GetByType('list-item');`

This will return an object of all items in local storage where the **Type** = **list-item**


Filter
-------

The **Filter** method allows you to pass an existing object/array along with a **query** (see below), to return a subset of the initial data, similar to a **where** clause.

`var listItem = offlineStorage.GetByType('list-item');`
			
`var query = offlineStorage.Query("Key", guid);`		
`listItem = offlineStorage.Filter(listItem, query);`

This returns a subset of **list-item** where the **key** equals the guid/key sent through.

Query
--------

As shown above, the **Query** method is a shortcut to create a query function that will iterate over itself to help return the subset data by passing a pseudo column and the value to compare against.

`var queryParent = offlineStorage.Query("Parent", parent);`
`counterArray = offlineStorage.Filter(counterArray, queryParent);`

This returns a subset of the **counterArray** where the **Parent** psuedo column matches the value sent through.
