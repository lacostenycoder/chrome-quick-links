(function(){

	let storedKeys = Object.keys(localStorage);

	let buttonTemplate = (key) => {
		let html = '<small><span class="btn-group"><span class="btn-mini btn-success btn-inline text-xs tb" id="edit-{tmp}">edit</span>'
		html += '<span class="btn-mini btn-danger btn-inline text-xs tb" id="delete-{tmp}">delete</span></span></small>'
		html = html.replace(/{tmp}/g, key);
		return html;
	}

	let newTableRow = (url, shortcut) => {
		let tableBody= document.getElementById("table-body");
		let table  = document.getElementById('table');
		let ahref = "<a href=" + url + ">";
		let row = "<tr><td>" + buttonTemplate(shortcut) + "&nbsp";
		row +=  shortcut + "</td>";
		row += "<td>" + ahref + url + "</a></td></tr>";

		tableBody.innerHTML += row;
		return false
	}

	let attachEdit = (key) => {
		let edit = document.getElementById('edit-' + key);
		if (edit) {
			edit.addEventListener('click', goListen, false);
		}
	}

	for (i=0; i<localStorage.length; i++) {
		let key = storedKeys[i];
		let url = localStorage[key];
		newTableRow(url, key, attachEdit );
	}

	let doEdit = () => {
		let shortcutInput = document.getElementById('shortcut');
		let urlInput = document.getElementById('url');
		let key = this.id.split('-')[1];
		let url = localStorage[key];
		shortcutInput.value = key;
		urlInput.value = url;
		urlInput.style.width = "200px;";
		window.scrollTo(0, 0);
	}

	let doDelete = () => {
		let key = this.id.split('-')[1];
		if ( confirm('Are you sure?') ) {
			 delete localStorage[key];
			 if(chrome.storage){
				 chrome.storage.sync.remove(key);
			 }
			 window.location = window.location;
		 }
	}

	checkExample = () => {
		let tr = document.getElementsByTagName('tr');
		if(tr.length > 1) {
			let example = document.getElementById('example');
			example.remove();
		}
	}

	window.addEventListener('load', () => {
		checkExample();
		for (i=0; i<localStorage.length; i++) {
			let key = storedKeys[i];
			let url = localStorage[key];
			document.getElementById("edit-" + key).addEventListener("click", doEdit, false);
			document.getElementById("delete-" + key).addEventListener("click", doDelete, false);
		}
	});

  //search function
  document.getElementById("search").addEventListener('keyup',() => {

    let input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("search");
    filter = input.value.toLowerCase();
    table = document.getElementById("table-body");
    tr = table.getElementsByTagName("tr");

    //loop through all rows, and hide those that don't match search query
    for (let i=0; i<tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[1];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toLowerCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  })

})();
