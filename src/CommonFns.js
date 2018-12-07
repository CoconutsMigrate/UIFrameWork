var fwk = fwk || {};
fwk.CommonFns = (function() {
	var BIND_L = "{{{";
	var BIND_R = "}}}";
	var BIND_SPLIT = /({{{|}}})/;
	var INDEX_CODE = /INDEX/;

	var setValue = function(path, value, modelPart) {
		if (typeof path === "string") {
			var path = path.split('.');
		}

		if (path.length > 1) {
			var p = path.shift();
			if (modelPart[p] == null || typeof modelPart[p] !== 'object') {
				 modelPart[p] = {};
			}
			setValue(path, value, modelPart[p]);
		} else{
			modelPart[path[0]] = value;
		}
	}
	
	var getValue = function(path, modelPart) {
		if (!path) {
			return null;
		}
		if (typeof path === "string") {
			var path = path.split('.');
		}
		
		if (path.length > 1) {
			var p = path.shift();
			if (modelPart[p] == null || typeof modelPart[p] !== 'object') {
				 return null;
			}
			return getValue(path, modelPart[p]);
		} else{
			return modelPart[path[0]];
		}
	};
	
	/**
	 * Using the model, evaluate expressions like "visibility-{{{base.name.visible}}}". Multiple binds allowed
	 * @param model The model
	 * @param expr The expression to evaluate
	 * @param index the INDEX keyword to replace with the actual index
	 * @returns The evaluated value
	 */
	var evaluate = function(model, expr, index) {
		if (index !== undefined) {
			expr = expr.replace(INDEX_CODE, index); // replace INDEX with the actual index
		}
		var arr = expr.split(BIND_SPLIT);
		for (var ind = 0; ind < arr.length; ind++) {
			if ((arr[ind] == BIND_L && arr[ind + 2] !== BIND_R) || (arr[ind] == BIND_R && arr[ind - 2] !== BIND_L)) {
				throw Error("Invalid bind expression : " + expr);
			}
			if (arr[ind] === BIND_L && arr[ind + 2] === BIND_R) {
				arr.splice(ind, 3, getValue(arr[ind + 1].trim(), model));
			}
		}
		return arr.join("");
	};
	
	// TODO ability to confirm update: be able to specify that all changes be propagated to the model at once
	var uiToModel = function(model, id, path, handler) {
		var o = $("#" + id);
		if (o) {
			var value = (o.prop("type") === "checkbox") ? o.prop("checked") : o.val();
			setValue(path, value, model);
			handler && handler(id, path);
			console.log("uiToModel:\n", model);
		} else {
			console.error("Invalid ID " + id);
		}
	};
	
	/**
	 * Copy model data to the UI. Does not regenerate panel if the size of arrays have changed.
	 */
	var modelToUI = function(model, uiItems) {
		//console.log("modelToUI:\n", model, "UI: \n", JSON.stringify(ui));
		uiItems.forEach(function(item) {
			var o = $("#" + item.uiId);
			var value = getValue(item.path, model);
			if (o && value !== undefined && value !== null) {
				if (o.prop("type") === "checkbox") {
					o.prop("checked", value);
				} else {
					o.val(value);
				}
			}
			for (var bi in item.bind) {
				var n = item.bind[bi].name;
				var v = evaluate(model, item.bind[bi].value, item.index);
				if (n == "class") {
					o.removeClass().addClass(v);
				} else {
					o.prop(n, v);
				}
			}
		});
	};
	
	var setActive = function(isActive) {
		uiItems.forEach(function(uiObj) {
			var o = document.getElementById(uiObj.uiId);
			o.onchange = uiToModel.bind(me, uiObj.uiId, uiObj.path);
		});
	};

	var generateItem = function(model, uiObj, id, handler) {
		uiObj.uiId = id;
		var obj = null;
		switch(uiObj.type) {
			case "text":
				obj = $("<input>").prop("type", "text");
				break;
			case "number":
				obj = $("<input>").prop("type", "number");
				break;
			case "boolean":
				obj = $("<input>").prop("type", "checkbox");
				break;
			case "select":
				obj = $("<select>");
				var opts = uiObj.options.split(";");
				for (var o in opts) {
					obj.append($("<option>").prop("value", opts[o]).text(opts[o]));
				}
				break;
			case "label":
				obj = $("<label>").prop("style", "display: block").text(uiObj.value);
				break;
			default:
				throw "Invalid UI object : " + uiObj.type;
		}
		obj.prop("id", id);
		if (uiObj.path) {
			obj.on("change", uiToModel.bind(null, model, uiObj.uiId, uiObj.path, handler));
		}
		if (uiObj.class) {
			obj.removeClass().addClass(evaluate(model, uiObj.class, uiObj.index));
		}
		return obj;
	};

	
	return {
		setValue     : setValue,
		getValue     : getValue,
		evaluate     : evaluate,
		uiToModel    : uiToModel,
		modelToUI    : modelToUI,
		setActive    : setActive,
		generateItem : generateItem
	}
})();
