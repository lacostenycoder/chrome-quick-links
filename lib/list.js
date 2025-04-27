(function(){
	var storedKeys = Object.keys(localStorage).filter(function(key) {
		// Filter out special keys that shouldn't be displayed as shortcuts
		return key !== 'lastSynced' && 
		       !key.startsWith('lastSynced_') && 
		       key !== 'shortcutsMeta' && 
		       key !== 'deletedShortcuts';
	});

	// Function to export shortcuts to a JSON file
	function exportShortcuts() {
		// Create an object to hold all shortcuts
		var shortcuts = {};
		for (var i = 0; i < localStorage.length; i++) {
			var key = localStorage.key(i);
			// Only export actual shortcuts, not metadata
			if (key !== 'lastSynced' && 
			    !key.startsWith('lastSynced_') && 
			    key !== 'shortcutsMeta' && 
			    key !== 'deletedShortcuts') {
				var url = localStorage[key];
				shortcuts[key] = url;
			}
		}

		// Convert to JSON string
		var jsonData = JSON.stringify(shortcuts, null, 2);
		
		// Create a blob and download link
		var blob = new Blob([jsonData], {type: 'application/json'});
		var url = URL.createObjectURL(blob);
		
		// Create a temporary link and trigger download
		var a = document.createElement('a');
		a.href = url;
		a.download = 'chrome-quick-links-shortcuts.json';
		document.body.appendChild(a);
		a.click();
		
		// Clean up
		setTimeout(function() {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 0);
	}

	// Function to import shortcuts from a JSON file
	function importShortcuts(event) {
		var file = event.target.files[0];
		if (!file) return;
		
		var reader = new FileReader();
		reader.onload = function(e) {
			try {
				var shortcuts = JSON.parse(e.target.result);
				
				// Ask user how to handle conflicts
				var importMode = prompt(
					"Choose how to handle existing shortcuts:\n" +
					"1: Keep existing shortcuts (only add new ones)\n" +
					"2: Overwrite existing shortcuts\n" +
					"3: Merge (keep both if URLs differ)\n" +
					"Enter 1, 2, or 3:", "1");
				
				if (!importMode) return; // User cancelled
				importMode = parseInt(importMode);
				
				var added = 0;
				var updated = 0;
				var skipped = 0;
				
				for (var key in shortcuts) {
					var newUrl = shortcuts[key];
					var exists = localStorage[key] !== undefined;
					
					if (!exists) {
						// New shortcut, always add
						localStorage[key] = newUrl;
						added++;
					} else if (importMode === 2) {
						// Overwrite mode
						localStorage[key] = newUrl;
						updated++;
					} else if (importMode === 3 && localStorage[key] !== newUrl) {
						// Merge mode - if URLs differ, create a new shortcut with a suffix
						var newKey = key + "_imported";
						var counter = 1;
						
						// Find an available key name
						while (localStorage[newKey] !== undefined) {
							newKey = key + "_imported_" + counter;
							counter++;
						}
						
						localStorage[key] = newUrl;
						added++;
					} else if (importMode === 1) {
						// Keep existing mode
						skipped++;
					}
				}
				
				// Show results
				alert("Import complete!\n" +
					"Added: " + added + " new shortcuts\n" +
					"Updated: " + updated + " existing shortcuts\n" +
					"Skipped: " + skipped + " shortcuts");
				
				// Refresh the page to show updated shortcuts
				window.location.reload();
				
			} catch (error) {
				alert("Error importing shortcuts: " + error.message);
			}
		};
		reader.readAsText(file);
	}

	function buttonTemplate(key){
		var html = '<small><span class="btn-group"><span class="btn-mini btn-success btn-inline text-xs tb" id="edit-{tmp}">edit</span>'
		html += '<span class="btn-mini btn-danger btn-inline text-xs tb" id="delete-{tmp}">delete</span></span></small>'
		html = html.replace(/{tmp}/g, key);
		return html;
	}

	function newTableRow(url, shortcut) {
		var tableBody= document.getElementById("table-body");
		var table  = document.getElementById('table');
		var ahref = "<a href=" + url + ">";
		var row = "<tr><td class=" + 'col-md-2' + ">" + buttonTemplate(shortcut) + "</td>";
		row += '<td class="table-shortcut">' + shortcut + "</td>";
		row += "<td>" + ahref + url + "</a></td></tr>";

		tableBody.innerHTML += row;
		return false
	}

	function attachEdit(key) {
		var edit = document.getElementById('edit-' + key);
		if (edit) {
			edit.addEventListener('click', goListen, false);
		}
	}

	// Only display actual shortcuts, not metadata
	for (i=0; i<storedKeys.length; i++) {
		var key = storedKeys[i];
		var url = localStorage[key];
		newTableRow(url, key, attachEdit);
	}

	var doEdit = function(){
		var shortcutInput = document.getElementById('shortcut');
		var urlInput = document.getElementById('url');
		var key = this.id.split('-')[1];
		var url = localStorage[key];
		shortcutInput.value = key;
		urlInput.value = url;
		urlInput.style.width = "200px;";
		window.scrollTo(0, 0);
	}

	var doDelete = function() {
		var key = this.id.split('-')[1];
		if (confirm('Are you sure?')) {
			delete localStorage[key];
			if(chrome.storage){
				chrome.storage.sync.remove(key);
			}
			window.location = window.location;
		}
	}

	function checkExample(){
		var tr = document.getElementsByTagName('tr');
		if(tr.length > 1) {
			var example = document.getElementById('example');
			if (example) {
				example.remove();
			}
		}
	}

	window.addEventListener('load', function(){
		checkExample();
		for (i=0; i<storedKeys.length; i++) {
			var key = storedKeys[i];
			var editBtn = document.getElementById("edit-" + key);
			var deleteBtn = document.getElementById("delete-" + key);
			if (editBtn) editBtn.addEventListener("click", doEdit, false);
			if (deleteBtn) deleteBtn.addEventListener("click", doDelete, false);
		}
		
		// Add Export/Import buttons
		var container = document.querySelector('.container');
		if (container) {
			// Create export button
			var exportBtn = document.createElement('button');
			exportBtn.textContent = 'Export Shortcuts';
			exportBtn.className = 'btn btn-primary';
			exportBtn.style.marginRight = '10px';
			exportBtn.addEventListener('click', exportShortcuts);
			
			// Create import button container (to style it like a button but actually be a file input)
			var importContainer = document.createElement('span');
			importContainer.className = 'btn btn-primary';
			importContainer.style.position = 'relative';
			importContainer.style.overflow = 'hidden';
			importContainer.style.display = 'inline-block';
			importContainer.textContent = 'Import Shortcuts';
			
			// Create actual file input
			var importInput = document.createElement('input');
			importInput.type = 'file';
			importInput.accept = '.json';
			importInput.style.position = 'absolute';
			importInput.style.fontSize = '100px';
			importInput.style.opacity = '0';
			importInput.style.right = '0';
			importInput.style.top = '0';
			importInput.addEventListener('change', importShortcuts);
			
			// Add file input to container
			importContainer.appendChild(importInput);
			
			// Create button container
			var buttonContainer = document.createElement('div');
			buttonContainer.style.marginBottom = '20px';
			buttonContainer.appendChild(exportBtn);
			buttonContainer.appendChild(importContainer);
			
			// Add buttons to page
			container.insertBefore(buttonContainer, container.firstChild);
		}
	});

	//search function
	document.getElementById("search").addEventListener('keyup',function() {
		var input, filter, table, tr, td, i, txtValue;
		var input = document.getElementById("search");
		var searchFilter = input.value;
		var table = document.getElementById("table-body");
		var tr = table.getElementsByTagName("tr");

		//loop through all rows, and hide those that don't match search query
		for (var i=0; i<tr.length; i++) {
			var shortcut = tr[i].getElementsByTagName("td")[1];
			var url = tr[i].getElementsByTagName("td")[2];
			var targetMatch = '';
			targetMatch += shortcut.textContent || shortcut.innerText;
			targetMatch += url.textContent || url.innerText;
			if (targetMatch.indexOf(searchFilter) > -1) {
				tr[i].style.display = "";
			} else {
				tr[i].style.display = "none";
			}
		}
	});
})();
