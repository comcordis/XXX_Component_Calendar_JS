/*
	
	{
		dayOfTheWeek: 1,
		isOpen: true|false
		is24HoursOpen: true|false,
		openingHour: 0 - 23,
		openingMinute: 0 - 59
		closingHour: 0 - 23,
		closingMinute: 0 - 59
	}
	
	
	*/
	
	var XXX_Component_OpeningWeekdaysAndHoursSettings = function (container, weekStart, jsonInput, previousSettings)
	{
		this.ID = XXX.createID();
		
		this.weekStart = XXX_Default.toOption(weekStart, ['monday', 'sunday'], 'monday');
		
		this.elements = {};
		
		this.elements.container = XXX_DOM.get(container);
		
		this.elements.jsonInput = XXX_DOM.get(jsonInput);
		
		
		
		
		//var dayOfTheWeekNames = XXX_I18n_Translation.get('dateTime', 'daysOfTheWeek', 'abbreviations');
		
		
		var dayOfTheWeekNames = [
			XXX_I18n_Translation.get('custom', 'calendar', 'monday'),
			XXX_I18n_Translation.get('custom', 'calendar', 'tuesday'),
			XXX_I18n_Translation.get('custom', 'calendar', 'wednesday'),
			XXX_I18n_Translation.get('custom', 'calendar', 'thursday'),
			XXX_I18n_Translation.get('custom', 'calendar', 'friday'),
			XXX_I18n_Translation.get('custom', 'calendar', 'saturday'),
			XXX_I18n_Translation.get('custom', 'calendar', 'sunday')
		];
		
		this.is247Open = false;
		
		this.options = [];
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(dayOfTheWeekNames); i < iEnd; ++i)
		{
			var option =
			{
				dayOfTheWeek: i + 1,
				label: dayOfTheWeekNames[i],
				variablePrefix: this.ID + '_' + XXX_String.convertToLowerCase(dayOfTheWeekNames[i]),
				isOpen: true,
				is24HoursOpen: false,
				openingHour: 8,
				openingMinute: 00,
				closingHour: 18,
				closingMinute: 00
			};
			
			this.options.push(option);
		}
		
		
		if (XXX_Type.isValue(previousSettings))
		{
			this.is247Open = previousSettings.is247Open ? true : false;
						
			for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.options); i < iEnd; ++i)
			{
				var option = this.options[i];
				
				if (previousSettings.weekdays)
				{
					for (var j = 0, jEnd = XXX_Array.getFirstLevelItemTotal(previousSettings.weekdays); j < jEnd; ++j)
					{
						var tempOption = previousSettings.weekdays[j];
						
						if (tempOption.dayOfTheWeek == option.dayOfTheWeek)
						{
							if (XXX_Type.isBoolean(tempOption.isOpen))
							{
								option.isOpen = XXX_Type.makeBoolean(tempOption.isOpen);
							}
							
							if (XXX_Type.isBoolean(tempOption.is24HoursOpen))
							{
								option.is24HoursOpen = XXX_Type.makeBoolean(tempOption.is24HoursOpen);
							}
							
							if (XXX_Type.isPositiveInteger(tempOption.openingHour) && tempOption.openingHour >= 0 && tempOption.openingHour <= 23)
							{
								option.openingHour = tempOption.openingHour;
							}
							
							if (XXX_Type.isPositiveInteger(tempOption.openingMinute) && tempOption.openingMinute >= 0 && tempOption.openingMinute <= 59)
							{
								option.openingMinute = tempOption.openingMinute;
							}
												
							if (XXX_Type.isPositiveInteger(tempOption.closingHour) && tempOption.closingHour >= 0 && tempOption.closingHour <= 23)
							{
								option.closingHour = tempOption.closingHour;
							}
							
							if (XXX_Type.isPositiveInteger(tempOption.closingMinute) && tempOption.closingMinute >= 0 && tempOption.closingMinute <= 59)
							{
								option.closingMinute = tempOption.closingMinute;
							}
						}
					}
				}
				
				this.options[i] = option;
			}
		}
		
		if (this.weekStart == 'sunday')
		{
			var lastOption = this.options.pop();
			
			this.options.unshift(lastOption);
		}
		
		this.eventDispatcher = new XXX_EventDispatcher();
		
		this.render();
		
		this.propagateFromSettings();
		
		this.updateJSONInput();
	};
	
	XXX_Component_OpeningWeekdaysAndHoursSettings.prototype.render = function ()
	{		
		var output = '';
		
		output += '<label>';
		//output += '<span class="input">';
			output += '<input type="checkbox"' + (this.is247Open ? ' checked="checked"' : '') + ' id="' + this.ID + 'Is247Open">';
		//output += '</span> Open 24 / 7';
		output += ' <b>' + XXX_I18n_Translation.get('custom', 'provider', 'availability', 'everyDayOfTheWeek24HoursADay') + '</b>';
		output += '</label>';
		
		output += '<table id="' + this.ID + 'Weekdays" class="dataTable" style="margin-top: 10px;">';
			
			output += '<thead>';
				output += '<tr>';
					output += '<th rowspan="2" colspan="2">' + XXX_I18n_Translation.get('custom', 'provider', 'availability', 'open') + '</th>';
					output += '<th rowspan="2">' + XXX_I18n_Translation.get('custom', 'provider', 'availability', '24h') + '</th>';
					output += '<th colspan="2">' + XXX_I18n_Translation.get('custom', 'provider', 'availability', 'orSpecificTimes') + '</th>';
				output += '</tr>';
				output += '<tr>';
					output += '<th>' + XXX_I18n_Translation.get('custom', 'provider', 'availability', 'opening') + '</th>';
					output += '<th>' + XXX_I18n_Translation.get('custom', 'provider', 'availability', 'closing') + '</th>';
				output += '</tr>';
			output += '</thead>';
			
			output += '<tbody>';
			for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.options); i < iEnd; ++i)
			{
				var option = this.options[i];
				
				output += '<tr>';
				
					output += '<td>';
						//output += '<span class="input">';
							output += '<input type="checkbox"' + (option.isOpen ? ' checked="checked"' : '') + ' id="' + option.variablePrefix + 'IsOpen">';
						//output += '</span>';
					output += '</td>';
					
					output += '<td><label for="' + option.variablePrefix + 'IsOpen">' + option.label + '</label></td>';
					output += '<td>';
						output += '<div id="' + option.variablePrefix + 'Is24HoursOpenVisibilityWrapper"' + (option.isOpen ? '' : ' style="visibility: hidden;"') + '>';
							//output += '<span class="input">';
								output += '<input type="checkbox"' + (option.is24HoursOpen ? ' checked="checked"' : '') + ' id="' + option.variablePrefix + 'Is24HoursOpen">';
							//output += '</span>';
						output += '</div>';
					output += '</td>';
					
					output += '<td>';
						output += '<div id="' + option.variablePrefix + 'OpeningVisibilityWrapper"' + ((option.isOpen && !option.is24HoursOpen) ? '' : ' style="visibility: hidden;"') + '>';
							output += '<label class="input" for="' + option.variablePrefix + 'Opening">';
								output += '<input type="text" value="' + option.openingHour + ':' + option.openingMinute + '" id="' + option.variablePrefix + 'Opening">';
							output += '</label>';
						output += '</div>';
					output += '</td>';
					
					output += '<td>';
						output += '<div id="' + option.variablePrefix + 'ClosingVisibilityWrapper"' + ((option.isOpen && !option.is24HoursOpen) ? '' : ' style="visibility: hidden;"') + '>';
							output += '<label class="input" for="' + option.variablePrefix + 'Closing">';
								output += '<input type="text" value="' + option.closingHour + ':' + option.closingMinute + '" id="' + option.variablePrefix + 'Closing">';
							output += '</label>';
						output += '</div>';
					output += '</td>';
				output += '</tr>';
			}
			output += '</tbody>';
			
		output += '</table>';
		
		XXX_DOM.setInner(this.elements.container, output);
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.options); i < iEnd; ++i)
		{
			var option = this.options[i];
			
			var XXX_Component_OpeningWeekdaysAndHoursSettings_instance = this;
						
			this.elements[option.variablePrefix + 'IsOpen'] = XXX_DOM.get(option.variablePrefix + 'IsOpen');
				this.elements[option.variablePrefix + 'IsOpen'].XXX_optionIndex = i;
				
			this.elements[option.variablePrefix + 'Is24HoursOpen'] = XXX_DOM.get(option.variablePrefix + 'Is24HoursOpen');
			
				this.elements[option.variablePrefix + 'Is24HoursOpen'].XXX_optionIndex = i;
				
			this.elements[option.variablePrefix + 'Is24HoursOpenVisibilityWrapper'] = XXX_DOM.get(option.variablePrefix + 'Is24HoursOpenVisibilityWrapper');
			
			this.elements[option.variablePrefix + 'OpeningClock'] = new XXX_Component_Clock(option.variablePrefix + 'Opening', YAT_I18n_Preferences.current.clockType);			
				this.elements[option.variablePrefix + 'OpeningVisibilityWrapper'] = XXX_DOM.get(option.variablePrefix + 'OpeningVisibilityWrapper');
			
			var dayOfTheWeekOpeningClock = function ()
			{
				XXX_Component_OpeningWeekdaysAndHoursSettings_instance.changeHandler();
			};
			
			this.elements[option.variablePrefix + 'OpeningClock'].eventDispatcher.addEventListener('change', dayOfTheWeekOpeningClock);
			
			this.elements[option.variablePrefix + 'ClosingClock'] = new XXX_Component_Clock(option.variablePrefix + 'Closing', YAT_I18n_Preferences.current.clockType);
				this.elements[option.variablePrefix + 'ClosingVisibilityWrapper'] = XXX_DOM.get(option.variablePrefix + 'ClosingVisibilityWrapper');
						
			var dayOfTheWeekClosingClock = function ()
			{
				XXX_Component_OpeningWeekdaysAndHoursSettings_instance.changeHandler();
			};
			
			this.elements[option.variablePrefix + 'ClosingClock'].eventDispatcher.addEventListener('change', dayOfTheWeekClosingClock);
			
			var dayOfTheWeekIs24HoursOpenCallback = function ()
			{
				XXX_Component_OpeningWeekdaysAndHoursSettings_instance.dayOfTheWeekIs24HoursOpenChanged(this.XXX_optionIndex);
				XXX_Component_OpeningWeekdaysAndHoursSettings_instance.changeHandler();
			};
			
			XXX_DOM_NativeEventDispatcher.addEventListener(this.elements[option.variablePrefix + 'Is24HoursOpen'], 'change', dayOfTheWeekIs24HoursOpenCallback);
			XXX_DOM_NativeEventDispatcher.addEventListener(this.elements[option.variablePrefix + 'Is24HoursOpen'], 'click', dayOfTheWeekIs24HoursOpenCallback);
			
			var dayOfTheWeekIsOpenCallback = function ()
			{
				XXX_Component_OpeningWeekdaysAndHoursSettings_instance.dayOfTheWeekIsOpenChanged(this.XXX_optionIndex);
				XXX_Component_OpeningWeekdaysAndHoursSettings_instance.changeHandler();
			};
			
			XXX_DOM_NativeEventDispatcher.addEventListener(this.elements[option.variablePrefix + 'IsOpen'], 'change', dayOfTheWeekIsOpenCallback);
			XXX_DOM_NativeEventDispatcher.addEventListener(this.elements[option.variablePrefix + 'IsOpen'], 'click', dayOfTheWeekIsOpenCallback);
		}
		
		this.elements[this.ID + 'Weekdays'] = XXX_DOM.get(this.ID + 'Weekdays');
		
		this.elements[this.ID + 'Is247Open'] = XXX_DOM.get(this.ID + 'Is247Open');
		
		var is247OpenCallback = function ()
		{
			XXX_Component_OpeningWeekdaysAndHoursSettings_instance.is247OpenChanged();
			XXX_Component_OpeningWeekdaysAndHoursSettings_instance.changeHandler();
		};
		
		XXX_DOM_NativeEventDispatcher.addEventListener(this.elements[this.ID + 'Is247Open'], 'change', is247OpenCallback);
		XXX_DOM_NativeEventDispatcher.addEventListener(this.elements[this.ID + 'Is247Open'], 'click', is247OpenCallback);
		
		
		this.updateWeekdaysVisibility();
	};
	
	XXX_Component_OpeningWeekdaysAndHoursSettings.prototype.dayOfTheWeekIs24HoursOpenChanged = function (optionIndex)
	{
		var option = this.options[optionIndex];
					
		var selected = XXX_DOM_NativeHelpers.nativeFreeOptionSwitchInput.isSelected(this.elements[option.variablePrefix + 'Is24HoursOpen']);
		
		this.options[optionIndex].is24HoursOpen = selected;
		
		this.updateDayOfTheWeekVisibility(optionIndex);
	};
	
	XXX_Component_OpeningWeekdaysAndHoursSettings.prototype.dayOfTheWeekIsOpenChanged = function (optionIndex)
	{
		var option = this.options[optionIndex];
		
		var selected = XXX_DOM_NativeHelpers.nativeFreeOptionSwitchInput.isSelected(this.elements[option.variablePrefix + 'IsOpen']);
		
		this.options[optionIndex].isOpen = selected;
		
		this.updateDayOfTheWeekVisibility(optionIndex);		
	};
	
	XXX_Component_OpeningWeekdaysAndHoursSettings.prototype.updateDayOfTheWeekVisibility = function (optionIndex)
	{
		var option = this.options[optionIndex];
		
		XXX_CSS.setStyle(this.elements[option.variablePrefix + 'Is24HoursOpenVisibilityWrapper'], 'visibility', option.isOpen ? 'visible' : 'hidden');
		XXX_CSS.setStyle(this.elements[option.variablePrefix + 'OpeningVisibilityWrapper'], 'visibility', (option.isOpen && !option.is24HoursOpen) ? 'visible' : 'hidden');
		XXX_CSS.setStyle(this.elements[option.variablePrefix + 'ClosingVisibilityWrapper'], 'visibility', (option.isOpen && !option.is24HoursOpen) ? 'visible' : 'hidden');
	};
	
	XXX_Component_OpeningWeekdaysAndHoursSettings.prototype.is247OpenChanged = function ()
	{
		var selected = XXX_DOM_NativeHelpers.nativeFreeOptionSwitchInput.isSelected(this.elements[this.ID + 'Is247Open']);
		
		this.is247Open = selected;
		
		this.updateWeekdaysVisibility();
	};
	
	XXX_Component_OpeningWeekdaysAndHoursSettings.prototype.updateWeekdaysVisibility = function ()
	{
		XXX_CSS.setStyle(this.elements[this.ID + 'Weekdays'], 'display', this.is247Open ? 'none' : 'block');
	};
	
	XXX_Component_OpeningWeekdaysAndHoursSettings.prototype.changeHandler = function ()
	{
		this.propagateFromSettings();
		
		this.updateJSONInput();
		
		this.eventDispatcher.dispatchEventToListeners('change');
	};
	
	XXX_Component_OpeningWeekdaysAndHoursSettings.prototype.updateJSONInput = function ()
	{
		if (this.elements.jsonInput)
		{			
			var json = {};
			json.is247Open = this.is247Open;			
			json.weekdays = [];
			
			for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.options); i < iEnd; ++i)
			{
				var option = this.options[i];
				
				var weekday =
				{
					dayOfTheWeek: option.dayOfTheWeek,
					isOpen: option.isOpen,
					is24HoursOpen: option.is24HoursOpen,
					openingHour: option.openingHour,
					openingMinute: option.openingMinute,
					closingHour: option.closingHour,
					closingMinute: option.closingMinute
				};
				
				json.weekdays.push(weekday);
			}
			
			XXX_DOM_NativeHelpers.nativeCharacterLineInput.setValue(this.elements.jsonInput, XXX_String_JSON.encode(json));
		}
	};
	
	XXX_Component_OpeningWeekdaysAndHoursSettings.prototype.propagateFromSettings = function ()
	{
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.options); i < iEnd; ++i)
		{
			var option = this.options[i];
			
			var openingTime = this.elements[option.variablePrefix + 'OpeningClock'].selectedTime;
			var openingTimeParts = openingTime.parse();
			
			this.options[i].openingHour = openingTimeParts.hour;
			this.options[i].openingMinute = openingTimeParts.minute;
			
			var closingTime = this.elements[option.variablePrefix + 'ClosingClock'].selectedTime;
			var closingTimeParts = closingTime.parse();
			
			this.options[i].closingHour = closingTimeParts.hour;
			this.options[i].closingMinute = closingTimeParts.minute;
		}
	};