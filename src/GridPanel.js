var fwk = fwk || {};
fwk.GridPanel = (function() {
	var UI_PREFIX = "UI-";
	var INDEX_CODE = /INDEX/;
	var counter = 1;
	
	var GridPanel = function(ui, model, handler) {
		var me = this;
		if (!ui) {
			throw Exception("Must specify UI. Model is optional");
		}
		model = model || {};
		var prefix = UI_PREFIX + counter + "-";
		counter++;
			
		var getUI = function() {
			return ui;
		}
		
		var getModel = function() {
			return model;
		}
			
		/**
		 * Converts templates to rows
		 */
		var createUIItems = function() {
			for (var ri = 0; ri < ui.length; ri++) { // rows
				var uir = ui[ri];
				if (uir.type === "array") {
					var marr = fwk.CommonFns.getValue(uir.path, model);
					uir.items = marr.map(function(m, index) {
						return uir.templates.map(function(uiitem) {
							return {
								id      : uiitem.id + "-" + index,
								type    : uiitem.type,
								options : uiitem.options,
								path    : uiitem.path ? uiitem.path.replace(INDEX_CODE, index) : null, // replace INDEX with the actual index
								index   : index,
								bind    : uiitem.bind,
								value   : uiitem.value,
								class   : uiitem.class
							};
						});
					});
					//console.log("UI updated:\n", ui);
				} else if (uir.type === "object") {
					uir.items = [ uir.templates ];
				}
			}
			
		}
		
		var getAllItems = function() {
			var items = [];
			for (var uii in ui) {
				for (var ri in ui[uii].items) {
					for (var ci in ui[uii].items[ri]) {
						items.push(ui[uii].items[ri][ci]);
					}
				}
			}
			return items;
		};
		
		// Replace with getAllItems
		var getAllRows = function(callback) {
			var rows = [];
			for (var uii in ui) {
				for (var ri in ui[uii].items) {
					!callback && rows.push(ui[uii].items[ri]);
					callback && callback(ui[uii].items[ri]);
				}
			}
			return callback ? null : rows;
		};
		
		var info = function() {
			var ret = "[\n"
			getAllItems().forEach(function (item) {
				var o = document.getElementById(item.uiId);
				var value = fwk.CommonFns.getValue(item.path, model);
				ret += "    " + item.uiId + " = " + value + "\n";
			});
			ret += "]\n";
			return ret;
		};
		
		var setPanel = function(targetObj) {
			me.targetObj = targetObj || me.targetObj;
			var s;
			createUIItems.call(me);
			var table = $("<table>");
			getAllRows().forEach(function(row) {
				var tr = $("<tr>").appendTo(table);
				for (var di in row) { // items
					var td = $("<td>").appendTo(tr);
					var cell = fwk.CommonFns.generateItem(model, row[di], prefix + row[di].id, handler).appendTo(td);
				}
			});
			$(me.targetObj).append(table);
			
			// Update UI with relevant properties. Must be done after the HTML is set
			fwk.CommonFns.modelToUI(model, getAllItems());
			console.log(info());
		};
		
		var modelToUI = function() {
			fwk.CommonFns.modelToUI(model, getAllItems());
		}
		
		return {
			getUI       : getUI,
			getModel    : getModel,
			getAllItems : getAllItems,
			getAllRows  : getAllRows,
			modelToUI   : modelToUI,
			info        : info,
			setPanel    : setPanel
		}
	};
	
	return GridPanel;	
})();
/*
table as div
<div class="divTable">
	<div class="divTableBody">
		<div class="divTableRow">
			<div class="divTableCell">&nbsp;</div>
			<div class="divTableCell">&nbsp;</div>
		</div>
		<div class="divTableRow">
			<div class="divTableCell">&nbsp;</div>
			<div class="divTableCell">&nbsp;</div>
		</div>
	</div>
</div>

.divTable{
	display: table;
	width: 100%;
}
.divTableRow {
	display: table-row;
}
.divTableHeading {
	background-color: #EEE;
	display: table-header-group;
}
.divTableCell, .divTableHead {
	border: 1px solid #999999;
	display: table-cell;
	padding: 3px 10px;
}
.divTableHeading {
	background-color: #EEE;
	display: table-header-group;
	font-weight: bold;
}
.divTableFoot {
	background-color: #EEE;
	display: table-footer-group;
	font-weight: bold;
}
.divTableBody {
	display: table-row-group;
}
*/