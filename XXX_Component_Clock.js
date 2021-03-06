var XXX_Component_Clock = function (input, clockType, additionalOffsetFromNowIfEmpty)
{
	this.ID = XXX.createID();
	this.clockType = XXX_Default.toOption(clockType, ['12', '24'], '24');
	
	this.additionalOffsetFromNowIfEmpty = XXX_Default.toInteger(additionalOffsetFromNowIfEmpty, 3600);
		
		var now = XXX_TimestampHelpers.getCurrentTimestamp() + XXX_JS.timezoneOffset;
			
	this.selectedTime = new XXX_Timestamp(now);
		
	this.elements = {};
	
	this.IDToTimeConversion = {};
	
	this.elements = {};
	
	this.eventDispatcher = new XXX_EventDispatcher();
	
	this.elements.input = XXX_DOM.get(input);
		XXX_CSS.setStyle(this.elements.input, 'text-align', 'right');
		
		XXX_DOM_NativeHelpers.nativeCharacterLineInput.setLineCharacterLength(this.elements.input, this.clockType == '24' ? 5 : 7);
	
	this.elements.clockContainer = XXX_DOM.createElementNode('div');
		XXX_CSS.setClass(this.elements.clockContainer, 'dialog');
		//XXX_CSS.setStyle(this.elements.clockContainer, 'width', '170px');
	
	XXX_DOM.appendChildNode(XXX_DOM.getBody(), this.elements.clockContainer);
	
	this.propagateTimeFromInput();
	this.propagateTimeFromClock();
	
	
		this.dialogVisibilityIndex = XXX_DOM_DialogVisibility.attachDialog(this);
		
		this.render();
		
		this.rerender();
		
		this.hide();
		
		
	this.addInputEventHandlers();	
		
};

XXX_Component_Clock.prototype.addInputEventHandlers = function ()
{
	var XXX_Component_Clock_instance = this;
	
	XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.input, 'blur', function (nativeEvent)
	{
		nativeEvent.stopPropagation();
		
		var target = XXX_DOM_NativeEventDispatcher.getTarget(nativeEvent);
		
		if (!XXX_DOM.isAncestor(XXX_Component_Clock_instance.elements.clockContainer, target))
		{
			XXX_Component_Clock_instance.propagateTimeFromInput();
			XXX_Component_Clock_instance.propagateTimeFromClock();
			XXX_Component_Clock_instance.rerender();
		}
	});
	XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.input, 'keyUp', function (nativeEvent)
	{
		nativeEvent.stopPropagation();
		
		XXX_Component_Clock_instance.propagateTimeFromInput();
		XXX_Component_Clock_instance.rerender();
	});
	XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.input, 'change', function (nativeEvent)
	{
		nativeEvent.stopPropagation();
		
		XXX_Component_Clock_instance.propagateTimeFromInput();
		XXX_Component_Clock_instance.rerender();
	});
	
	/*XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.input, 'mouseDown', function (nativeEvent)
	{
		nativeEvent.preventDefault();
		nativeEvent.stopPropagation();
	});*/
	XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.input, 'click', function (nativeEvent)
	{
		nativeEvent.stopPropagation();
		nativeEvent.preventDefault();
		
		XXX_Component_Clock_instance.show();
		XXX_Component_Clock_instance.rerender();
	});
	
	XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.input, 'focus', function (nativeEvent)
	{
		nativeEvent.stopPropagation();
		nativeEvent.preventDefault();
		
		XXX_Component_Clock_instance.show();
		XXX_Component_Clock_instance.rerender();
	});
};

	
XXX_Component_Clock.prototype.setSelectedTimeByTimestamp = function (timestamp)
{
	if (XXX_Type.isInteger(timestamp))
	{
		var tempTimestamp = new XXX_Timestamp();
		tempTimestamp.set(timestamp);
		timestamp = tempTimestamp;
	}
	
	this.selectedTime = timestamp;
	
	this.rerender();
	this.reposition();
	
	this.propagateTimeFromClock();
	
	this.hide();
};

XXX_Component_Clock.prototype.propagateTimeFromClock = function ()
{
	var composedTimeValue = XXX_TimestampHelpers.composeTimeValue(this.selectedTime, this.clockType);
			
	XXX_DOM_NativeHelpers.nativeCharacterLineInput.setValue(this.elements.input, composedTimeValue);
			
	this.eventDispatcher.dispatchEventToListeners('change', this);
};

XXX_Component_Clock.prototype.propagateTimeFromInput = function ()
{
	var value = XXX_DOM_NativeHelpers.nativeCharacterLineInput.getValue(this.elements.input);
	
	if (value == '')
	{
		var timezoneInformation = XXX_TimestampHelpers.getTimeZoneInformation();
		var offset = 0;
		if (timezoneInformation)
		{
			offset = timezoneInformation.secondOffset.current;
		}
		
		var tempTime = new XXX_Timestamp();
		tempTime.set((tempTime.get() + offset) + this.additionalOffsetFromNowIfEmpty);
	}
	else
	{
		var parsedTimeValue = XXX_TimestampHelpers.parseTimeValue(value, this.clockType);
	
		var tempTime = new XXX_Timestamp();
		tempTime.compose({hour: parsedTimeValue.hour, minute: parsedTimeValue.minute});		
	}
	
	this.selectedTime = tempTime;
			
	this.eventDispatcher.dispatchEventToListeners('change', this);
};

	XXX_Component_Clock.prototype.getOuterElementNode = function ()
	{
		return this.elements.clockContainer;
	};
	
	XXX_Component_Clock.prototype.render = function ()
	{
		var hourOptions = [];
		var minuteOptions = [];
		var meridiemOptions = [];
		
		switch (this.clockType)
		{
			case '12':
				hourOptions.push({
					value: 12,
					textLabel: 12
				});
				
				for (var i = 1, iEnd = 11; i <= iEnd; ++i)
				{
					hourOptions.push({
						value: i,
						textLabel: XXX_String.padLeft(i, '0', 2)
					});
				}
				break;
			case '24':
				for (var i = 0, iEnd = 23; i <= iEnd; ++i)
				{
					hourOptions.push({
						value: i,
						textLabel: XXX_String.padLeft(i, '0', 2)
					});
				}
				break;
		}
		
		for (var i = 0, iEnd = 59; i <= iEnd; ++i)
		{
			minuteOptions.push({
				value: i,
				textLabel: XXX_String.padLeft(i, '0', 2)
			});
		}
		
		var meridiems = XXX_I18n_Translation.get('dateTime', 'meridiems', 'abbreviations');
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(meridiems); i < iEnd; ++i)
		{
			meridiemOptions.push({
				value: meridiems[i],
				textLabel: meridiems[i]
			});
		}
		
		
		this.hourNativeExclusiveOptionSwitchInputs = [];
		
		
		this.elements.hourOptions = XXX_DOM.createElementNode('div');
		XXX_CSS.setStyle(this.elements.hourOptions, 'height', '100px');
		XXX_CSS.setStyle(this.elements.hourOptions, 'width', '60px');
		XXX_CSS.setStyle(this.elements.hourOptions, 'overflow', 'auto');
		XXX_CSS.setStyle(this.elements.hourOptions, 'float', 'left');
			
			for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(hourOptions); i < iEnd; ++i)
			{
				var hourOption = XXX_DOM.createElementNode('div');
				
				
					var nativeExclusiveOptionSwitchInput = XXX_DOM.createElementNode('input');
						XXX_CSS.setStyle(nativeExclusiveOptionSwitchInput, 'display', 'none');
					nativeExclusiveOptionSwitchInput.type = 'radio';
					nativeExclusiveOptionSwitchInput.name = this.ID + '_hour';
					nativeExclusiveOptionSwitchInput.id = this.ID + '_hour_' + i;
					nativeExclusiveOptionSwitchInput.value = hourOptions[i].value;
				
				XXX_DOM.appendChildNode(hourOption, nativeExclusiveOptionSwitchInput);
				
				var label = XXX_DOM.createElementNode('label');
				label.htmlFor = this.ID + '_hour_' + i;
				label.id = this.ID + '_hour_' + i + '_label';
					XXX_CSS.setStyle(label, 'display', 'block');
					XXX_CSS.setStyle(label, 'padding', '3px');
				XXX_CSS.setStyle(label, 'text-align', 'right');
												
				XXX_DOM.appendInner(label, hourOptions[i].textLabel);
				
				XXX_DOM.appendChildNode(hourOption, label);
				XXX_DOM.appendChildNode(this.elements.hourOptions, hourOption);
				
				this.hourNativeExclusiveOptionSwitchInputs.push(nativeExclusiveOptionSwitchInput);
			}
					
		XXX_DOM.appendChildNode(this.elements.clockContainer, this.elements.hourOptions);
		
		
		
		this.minuteNativeExclusiveOptionSwitchInputs = [];
		
		this.elements.minuteOptions = XXX_DOM.createElementNode('div');
		XXX_CSS.setStyle(this.elements.minuteOptions, 'height', '100px');
		XXX_CSS.setStyle(this.elements.minuteOptions, 'width', '60px');
		XXX_CSS.setStyle(this.elements.minuteOptions, 'overflow', 'auto');
		XXX_CSS.setStyle(this.elements.minuteOptions, 'float', 'left');
			
			for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(minuteOptions); i < iEnd; ++i)
			{
				var minuteOption = XXX_DOM.createElementNode('div');
				
					var nativeExclusiveOptionSwitchInput = XXX_DOM.createElementNode('input');
						XXX_CSS.setStyle(nativeExclusiveOptionSwitchInput, 'display', 'none');
					nativeExclusiveOptionSwitchInput.type = 'radio';
					nativeExclusiveOptionSwitchInput.name = this.ID + '_minute';
					nativeExclusiveOptionSwitchInput.id = this.ID + '_minute_' + i;
					nativeExclusiveOptionSwitchInput.value = minuteOptions[i].value;
										
				XXX_DOM.appendChildNode(minuteOption, nativeExclusiveOptionSwitchInput);
								
				var label = XXX_DOM.createElementNode('label');
				label.htmlFor = this.ID + '_minute_' + i;
				label.id = this.ID + '_minute_' + i + '_label';
					XXX_CSS.setStyle(label, 'display', 'block');
					XXX_CSS.setStyle(label, 'padding', '3px');
				XXX_CSS.setStyle(label, 'text-align', 'right');
				
				XXX_DOM.appendInner(label, minuteOptions[i].textLabel);
				
				XXX_DOM.appendChildNode(minuteOption, label);
				XXX_DOM.appendChildNode(this.elements.minuteOptions, minuteOption);
				
				this.minuteNativeExclusiveOptionSwitchInputs.push(nativeExclusiveOptionSwitchInput);
			}
					
		XXX_DOM.appendChildNode(this.elements.clockContainer, this.elements.minuteOptions);
		
		
		if (this.clockType == '12')
		{		
			this.meridiemNativeExclusiveOptionSwitchInputs = [];
			
			this.elements.meridiemOptions = XXX_DOM.createElementNode('div');
			XXX_CSS.setStyle(this.elements.meridiemOptions, 'height', '100px');
			XXX_CSS.setStyle(this.elements.meridiemOptions, 'width', '60px');
			XXX_CSS.setStyle(this.elements.meridiemOptions, 'overflow', 'auto');
			XXX_CSS.setStyle(this.elements.meridiemOptions, 'float', 'left');
				
				for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(meridiemOptions); i < iEnd; ++i)
				{
					var meridiemOption = XXX_DOM.createElementNode('div');
					
						var nativeExclusiveOptionSwitchInput = XXX_DOM.createElementNode('input');
						XXX_CSS.setStyle(nativeExclusiveOptionSwitchInput, 'display', 'none');
						nativeExclusiveOptionSwitchInput.type = 'radio';
						nativeExclusiveOptionSwitchInput.name = this.ID + '_meridiem';
						nativeExclusiveOptionSwitchInput.id = this.ID + '_meridiem_' + i;
						nativeExclusiveOptionSwitchInput.value = meridiemOptions[i].value;
											
					XXX_DOM.appendChildNode(meridiemOption, nativeExclusiveOptionSwitchInput);
					
					
					var label = XXX_DOM.createElementNode('label');
					label.htmlFor = this.ID + '_meridiem_' + i;
					XXX_CSS.setStyle(label, 'display', 'block');
					XXX_CSS.setStyle(label, 'padding', '3px');
				XXX_CSS.setStyle(label, 'text-align', 'right');
					label.id = this.ID + '_meridiem_' + i + '_label';
						
					XXX_DOM.appendInner(label, meridiemOptions[i].textLabel);
					
					XXX_DOM.appendChildNode(meridiemOption, label);
					XXX_DOM.appendChildNode(this.elements.meridiemOptions, meridiemOption);
					
					this.meridiemNativeExclusiveOptionSwitchInputs.push(nativeExclusiveOptionSwitchInput);
				}
						
			XXX_DOM.appendChildNode(this.elements.clockContainer, this.elements.meridiemOptions);
		}
		
		
		
		var clearFloats = XXX_DOM.createElementNode('span');
		XXX_CSS.setClass(clearFloats, 'clearFloats');
		
		
		XXX_DOM.appendChildNode(this.elements.clockContainer, clearFloats);
		
		
		
		/*
		
		this.elements.hour_nativeExclusiveOptionListBoxInput = XXX_DOM.createElementNode('select');
		
		XXX_DOM_NativeHelpers.nativeFreeOptionListBoxInput.setRows(this.elements.hour_nativeExclusiveOptionListBoxInput, 6);
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(hourOptions); i < iEnd; ++i)
		{
			XXX_DOM_NativeHelpers.nativeExclusiveOptionListBoxInput.addOption(this.elements.hour_nativeExclusiveOptionListBoxInput, hourOptions[i], 'right');
		}
		
		
		this.elements.minute_nativeExclusiveOptionListBoxInput = XXX_DOM.createElementNode('select');
		
		
		XXX_DOM_NativeHelpers.nativeFreeOptionListBoxInput.setRows(this.elements.minute_nativeExclusiveOptionListBoxInput, 6);
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(minuteOptions); i < iEnd; ++i)
		{
			XXX_DOM_NativeHelpers.nativeExclusiveOptionListBoxInput.addOption(this.elements.minute_nativeExclusiveOptionListBoxInput, minuteOptions[i], 'right');
		}
		
		
		this.elements.meridiem_nativeExclusiveOptionListBoxInput = XXX_DOM.createElementNode('select');
		
		XXX_DOM_NativeHelpers.nativeFreeOptionListBoxInput.setRows(this.elements.meridiem_nativeExclusiveOptionListBoxInput, 2);
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(meridiemOptions); i < iEnd; ++i)
		{
			XXX_DOM_NativeHelpers.nativeExclusiveOptionListBoxInput.addOption(this.elements.meridiem_nativeExclusiveOptionListBoxInput, meridiemOptions[i]);
		}
		
		switch (this.clockType)
		{
			case '12':
				XXX_DOM.appendChildNode(this.elements.clockContainer, this.elements.hour_nativeExclusiveOptionListBoxInput);
				XXX_DOM.appendChildNode(this.elements.clockContainer, this.elements.minute_nativeExclusiveOptionListBoxInput);
				XXX_DOM.appendChildNode(this.elements.clockContainer, this.elements.meridiem_nativeExclusiveOptionListBoxInput);
				break;
			case '24':
				XXX_DOM.appendChildNode(this.elements.clockContainer, this.elements.hour_nativeExclusiveOptionListBoxInput);
				XXX_DOM.appendChildNode(this.elements.clockContainer, this.elements.minute_nativeExclusiveOptionListBoxInput);
				break;
		}
		*/
		this.addClockEventHandlers();
	};
	
	XXX_Component_Clock.prototype.addClockEventHandlers = function ()
	{
		var XXX_Component_Clock_instance = this;
				
		XXX.debug.hourNativeExclusiveOptionSwitchInputs = this.hourNativeExclusiveOptionSwitchInputs;
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.hourNativeExclusiveOptionSwitchInputs); i < iEnd; ++i)
		{
			XXX_DOM_NativeEventDispatcher.addEventListener(this.hourNativeExclusiveOptionSwitchInputs[i].id + '_label', 'mouseDown', function (nativeEvent)
			{
				nativeEvent.stopPropagation();
				
				XXX_Component_Clock_instance.propagateDownFromClock();
			});
			
			XXX_DOM_NativeEventDispatcher.addEventListener(this.hourNativeExclusiveOptionSwitchInputs[i].id + '_label', 'click', function (nativeEvent)
			{
				nativeEvent.stopPropagation();
				
				XXX_Component_Clock_instance.propagateDownFromClock();
			});
			
			
			XXX_DOM_NativeEventDispatcher.addEventListener(this.hourNativeExclusiveOptionSwitchInputs[i], 'mouseDown', function (nativeEvent)
			{
				nativeEvent.stopPropagation();
				
				XXX_Component_Clock_instance.propagateDownFromClock();
			});
			
			XXX_DOM_NativeEventDispatcher.addEventListener(this.hourNativeExclusiveOptionSwitchInputs[i], 'click', function (nativeEvent)
			{
				nativeEvent.stopPropagation();
				
				XXX_Component_Clock_instance.propagateDownFromClock();
			});
			
			
			XXX_DOM_NativeEventDispatcher.addEventListener(this.hourNativeExclusiveOptionSwitchInputs[i], 'change', function (nativeEvent)
			{
				nativeEvent.stopPropagation();
				
				XXX_Component_Clock_instance.propagateDownFromClock();
			});
			
			XXX_DOM_NativeEventDispatcher.addEventListener(this.hourNativeExclusiveOptionSwitchInputs[i], 'blur', function (nativeEvent)
			{
				nativeEvent.stopPropagation();
				
				XXX_Component_Clock_instance.propagateDownFromClock();
			});
						
			
			XXX_DOM_NativeEventDispatcher.addEventListener(this.hourNativeExclusiveOptionSwitchInputs[i], 'keyUp', function (nativeEvent)
			{
				nativeEvent.stopPropagation();
				
				XXX_Component_Clock_instance.propagateDownFromClock();
			});
		}
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.minuteNativeExclusiveOptionSwitchInputs); i < iEnd; ++i)
		{
			XXX_DOM_NativeEventDispatcher.addEventListener(this.minuteNativeExclusiveOptionSwitchInputs[i].id + '_label', 'mouseDown', function (nativeEvent)
			{
				nativeEvent.stopPropagation();
				
				XXX_Component_Clock_instance.propagateDownFromClock();
			});
			
			XXX_DOM_NativeEventDispatcher.addEventListener(this.minuteNativeExclusiveOptionSwitchInputs[i].id + '_label', 'click', function (nativeEvent)
			{
				nativeEvent.stopPropagation();
				
				XXX_Component_Clock_instance.propagateDownFromClock();
			});
			
			
			XXX_DOM_NativeEventDispatcher.addEventListener(this.minuteNativeExclusiveOptionSwitchInputs[i], 'mouseDown', function (nativeEvent)
			{
				nativeEvent.stopPropagation();
				
				XXX_Component_Clock_instance.propagateDownFromClock();
			});
			
			XXX_DOM_NativeEventDispatcher.addEventListener(this.minuteNativeExclusiveOptionSwitchInputs[i], 'click', function (nativeEvent)
			{
				nativeEvent.stopPropagation();
				
				XXX_Component_Clock_instance.propagateDownFromClock();
			});
			
			XXX_DOM_NativeEventDispatcher.addEventListener(this.minuteNativeExclusiveOptionSwitchInputs[i], 'change', function (nativeEvent)
			{
				nativeEvent.stopPropagation();
				
				XXX_Component_Clock_instance.propagateDownFromClock();
			});
			
			XXX_DOM_NativeEventDispatcher.addEventListener(this.minuteNativeExclusiveOptionSwitchInputs[i], 'blur', function (nativeEvent)
			{
				nativeEvent.stopPropagation();
				
				XXX_Component_Clock_instance.propagateDownFromClock();
			});
						
			
			XXX_DOM_NativeEventDispatcher.addEventListener(this.minuteNativeExclusiveOptionSwitchInputs[i], 'keyUp', function (nativeEvent)
			{
				nativeEvent.stopPropagation();
				
				XXX_Component_Clock_instance.propagateDownFromClock();
			});
		}
		
		
		/*
		
		
		XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.hour_nativeExclusiveOptionListBoxInput, 'mouseDown', function (nativeEvent)
		{
			nativeEvent.stopPropagation();
		});
		XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.hour_nativeExclusiveOptionListBoxInput, 'click', function (nativeEvent)
		{
			nativeEvent.stopPropagation();
			
			XXX_Component_Clock_instance.propagateDownFromClock();
		});
		XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.hour_nativeExclusiveOptionListBoxInput, 'blur', function (nativeEvent)
		{
			nativeEvent.stopPropagation();
			
			XXX_Component_Clock_instance.propagateDownFromClock();
		});
		XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.hour_nativeExclusiveOptionListBoxInput, 'keyUp', function (nativeEvent)
		{
			nativeEvent.stopPropagation();
			
			XXX_Component_Clock_instance.propagateDownFromClock();
		});
		
		XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.minute_nativeExclusiveOptionListBoxInput, 'mouseDown', function (nativeEvent)
		{
			nativeEvent.stopPropagation();
		});
		XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.minute_nativeExclusiveOptionListBoxInput, 'click', function (nativeEvent)
		{
			nativeEvent.stopPropagation();
			
			XXX_Component_Clock_instance.propagateDownFromClock();
		});
		XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.minute_nativeExclusiveOptionListBoxInput, 'blur', function (nativeEvent)
		{
			nativeEvent.stopPropagation();
			
			XXX_Component_Clock_instance.propagateDownFromClock();
		});
		XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.minute_nativeExclusiveOptionListBoxInput, 'keyUp', function (nativeEvent)
		{
			nativeEvent.stopPropagation();
			
			XXX_Component_Clock_instance.propagateDownFromClock();
		});
		*/
		
		switch (this.clockType)
		{
			case '12':
				
				
				
				
				for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.meridiemNativeExclusiveOptionSwitchInputs); i < iEnd; ++i)
				{
					XXX_DOM_NativeEventDispatcher.addEventListener(this.meridiemNativeExclusiveOptionSwitchInputs[i].id + '_label', 'mouseDown', function (nativeEvent)
					{
						nativeEvent.stopPropagation();
						
						XXX_Component_Clock_instance.propagateDownFromClock();
					});
					
					XXX_DOM_NativeEventDispatcher.addEventListener(this.meridiemNativeExclusiveOptionSwitchInputs[i].id + '_label', 'click', function (nativeEvent)
					{
						nativeEvent.stopPropagation();
						
						XXX_Component_Clock_instance.propagateDownFromClock();
					});
					
					
					
					XXX_DOM_NativeEventDispatcher.addEventListener(this.meridiemNativeExclusiveOptionSwitchInputs[i], 'mouseDown', function (nativeEvent)
					{
						nativeEvent.stopPropagation();
						
						XXX_Component_Clock_instance.propagateDownFromClock();
					});
					
					XXX_DOM_NativeEventDispatcher.addEventListener(this.meridiemNativeExclusiveOptionSwitchInputs[i], 'click', function (nativeEvent)
					{
						nativeEvent.stopPropagation();
						
						XXX_Component_Clock_instance.propagateDownFromClock();
					});
					
					XXX_DOM_NativeEventDispatcher.addEventListener(this.meridiemNativeExclusiveOptionSwitchInputs[i], 'change', function (nativeEvent)
					{
						nativeEvent.stopPropagation();
						
						XXX_Component_Clock_instance.propagateDownFromClock();
					});
					
					XXX_DOM_NativeEventDispatcher.addEventListener(this.meridiemNativeExclusiveOptionSwitchInputs[i], 'blur', function (nativeEvent)
					{
						nativeEvent.stopPropagation();
						
						XXX_Component_Clock_instance.propagateDownFromClock();
					});
								
					
					XXX_DOM_NativeEventDispatcher.addEventListener(this.meridiemNativeExclusiveOptionSwitchInputs[i], 'keyUp', function (nativeEvent)
					{
						nativeEvent.stopPropagation();
						
						XXX_Component_Clock_instance.propagateDownFromClock();
					});
				}
				
				/*
				XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.meridiem_nativeExclusiveOptionListBoxInput, 'mouseDown', function (nativeEvent)
				{
					nativeEvent.stopPropagation();
				});
				XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.meridiem_nativeExclusiveOptionListBoxInput, 'click', function (nativeEvent)
				{
					nativeEvent.stopPropagation();
					
					XXX_Component_Clock_instance.propagateDownFromClock();
				});
				XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.meridiem_nativeExclusiveOptionListBoxInput, 'blur', function (nativeEvent)
				{
					nativeEvent.stopPropagation();
					
					XXX_Component_Clock_instance.propagateDownFromClock();
				});
				XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.meridiem_nativeExclusiveOptionListBoxInput, 'keyUp', function (nativeEvent)
				{
					nativeEvent.stopPropagation();
					
					XXX_Component_Clock_instance.propagateDownFromClock();
				});*/
				break;
		}
	};
		
	XXX_Component_Clock.prototype.propagateDownFromClock = function ()
	{		
		var hourValue = 0;
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.hourNativeExclusiveOptionSwitchInputs); i < iEnd; ++i)
		{
			if (XXX_DOM_NativeHelpers.nativeExclusiveOptionSwitchInput.isSelected(this.hourNativeExclusiveOptionSwitchInputs[i]))
			{
				hourValue = XXX_Type.makeInteger(XXX_DOM_NativeHelpers.nativeExclusiveOptionSwitchInput.getValue(this.hourNativeExclusiveOptionSwitchInputs[i]));
				
				break;
			}
		}
		
		var minuteValue = 0;
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.minuteNativeExclusiveOptionSwitchInputs); i < iEnd; ++i)
		{
			if (XXX_DOM_NativeHelpers.nativeExclusiveOptionSwitchInput.isSelected(this.minuteNativeExclusiveOptionSwitchInputs[i]))
			{
				minuteValue = XXX_Type.makeInteger(XXX_DOM_NativeHelpers.nativeExclusiveOptionSwitchInput.getValue(this.minuteNativeExclusiveOptionSwitchInputs[i]));
				
				break;
			}
		}
		
		var meridiemValue = 0;
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.meridiemNativeExclusiveOptionSwitchInputs); i < iEnd; ++i)
		{
			if (XXX_DOM_NativeHelpers.nativeExclusiveOptionSwitchInput.isSelected(this.meridiemNativeExclusiveOptionSwitchInputs[i]))
			{
				meridiemValue = XXX_DOM_NativeHelpers.nativeExclusiveOptionSwitchInput.getValue(this.meridiemNativeExclusiveOptionSwitchInputs[i]);
				
				break;
			}
		}
		
		/*
		var hourValue = XXX_Type.makeInteger(XXX_DOM_NativeHelpers.nativeExclusiveOptionListBoxInput.getSelectedOptionValue(this.elements.hour_nativeExclusiveOptionListBoxInput));
		var minuteValue = XXX_Type.makeInteger(XXX_DOM_NativeHelpers.nativeExclusiveOptionListBoxInput.getSelectedOptionValue(this.elements.minute_nativeExclusiveOptionListBoxInput));
		*/
		switch (this.clockType)
		{
			case '12':
				//var meridiemValue = XXX_DOM_NativeHelpers.nativeExclusiveOptionListBoxInput.getSelectedOptionValue(this.elements.meridiem_nativeExclusiveOptionListBoxInput);
				
				if (meridiemValue == 'am')
				{
					if (hourValue == 12)
					{
						hourValue = 0;
					}
				}
				else if (meridiemValue == 'pm')
				{
					if (hourValue != 12)
					{
						hourValue += 12;
					}
				}
				break;
		}
		
		var tempTime = new XXX_Timestamp();
		tempTime.compose({hour: hourValue, minute: minuteValue});
		
		this.selectedTime = tempTime;
		
		this.updateHighlighting();
		
		this.propagateTimeFromClock();
		
		XXX_JS.errorNotification(1, hourValue + ' ' + minuteValue + ' ' + meridiemValue);
	};
	
	XXX_Component_Clock.prototype.rerender = function ()
	{
		var selectedTimeParts = this.selectedTime.parse();
		
		var hour = selectedTimeParts.hour;
		var minute = selectedTimeParts.minute;
		
		
		
		
		
		switch (this.clockType)
		{
			case '12':
				var meridiem = 'am';
				
				if (hour > 11)
				{
					meridiem = 'pm';
				}
				
				hour %= 12;
				
				if (hour == 0)
				{
					hour = 12;
				}
				
				
				for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.meridiemNativeExclusiveOptionSwitchInputs); i < iEnd; ++i)
				{
					if (XXX_DOM_NativeHelpers.nativeExclusiveOptionSwitchInput.getValue(this.meridiemNativeExclusiveOptionSwitchInputs[i]) == minute)
					{
						XXX_DOM_NativeHelpers.nativeExclusiveOptionSwitchInput.select(this.meridiemNativeExclusiveOptionSwitchInputs[i]);
						
						break;
					}
				}
				
				/*
				XXX_DOM_NativeHelpers.nativeExclusiveOptionListBoxInput.selectOptionByValue(this.elements.hour_nativeExclusiveOptionListBoxInput, hour);
				XXX_DOM_NativeHelpers.nativeExclusiveOptionListBoxInput.selectOptionByValue(this.elements.minute_nativeExclusiveOptionListBoxInput, minute);
				
				XXX_DOM_NativeHelpers.nativeExclusiveOptionListBoxInput.selectOptionByValue(this.elements.meridiem_nativeExclusiveOptionListBoxInput, meridiem);
				*/
				break;
			case '24':
				/*
				XXX_DOM_NativeHelpers.nativeExclusiveOptionListBoxInput.selectOptionByValue(this.elements.hour_nativeExclusiveOptionListBoxInput, hour);
				XXX_DOM_NativeHelpers.nativeExclusiveOptionListBoxInput.selectOptionByValue(this.elements.minute_nativeExclusiveOptionListBoxInput, minute);
				*/
				break;
		}
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.hourNativeExclusiveOptionSwitchInputs); i < iEnd; ++i)
		{
			if (XXX_DOM_NativeHelpers.nativeExclusiveOptionSwitchInput.getValue(this.hourNativeExclusiveOptionSwitchInputs[i]) == hour)
			{
				XXX_DOM_NativeHelpers.nativeExclusiveOptionSwitchInput.select(this.hourNativeExclusiveOptionSwitchInputs[i]);
				
				break;
			}
		}
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.minuteNativeExclusiveOptionSwitchInputs); i < iEnd; ++i)
		{
			if (XXX_DOM_NativeHelpers.nativeExclusiveOptionSwitchInput.getValue(this.minuteNativeExclusiveOptionSwitchInputs[i]) == minute)
			{
				XXX_DOM_NativeHelpers.nativeExclusiveOptionSwitchInput.select(this.minuteNativeExclusiveOptionSwitchInputs[i]);
				
				break;
			}
		}
		
		
		this.updateHighlighting();
		
		
		this.reposition();
	};
	
	XXX_Component_Clock.prototype.updateHighlighting = function ()
	{
		var selectedTimeParts = this.selectedTime.parse();
		
		var hour = selectedTimeParts.hour;
		var minute = selectedTimeParts.minute;
				
		switch (this.clockType)
		{
			case '12':
				var meridiem = 'am';
				
				if (hour > 11)
				{
					meridiem = 'pm';
				}
				
				hour %= 12;
				
				if (hour == 0)
				{
					hour = 12;
				}
				
				
				for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.meridiemNativeExclusiveOptionSwitchInputs); i < iEnd; ++i)
				{
					if (XXX_DOM_NativeHelpers.nativeExclusiveOptionSwitchInput.getValue(this.meridiemNativeExclusiveOptionSwitchInputs[i]) == minute)
					{
						XXX_CSS.setClass(this.meridiemNativeExclusiveOptionSwitchInputs[i].id + '_label', 'clockSelected');
					}
					else
					{
						
						XXX_CSS.removeClass(this.meridiemNativeExclusiveOptionSwitchInputs[i].id + '_label', 'clockSelected');
					}
				}
				
				break;
		}
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.hourNativeExclusiveOptionSwitchInputs); i < iEnd; ++i)
		{
			if (XXX_DOM_NativeHelpers.nativeExclusiveOptionSwitchInput.getValue(this.hourNativeExclusiveOptionSwitchInputs[i]) == hour)
			{
				XXX_CSS.setClass(this.hourNativeExclusiveOptionSwitchInputs[i].id + '_label', 'clockSelected');
			}
			else
			{
				
				XXX_CSS.removeClass(this.hourNativeExclusiveOptionSwitchInputs[i].id + '_label', 'clockSelected');
			}
		}
		
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.minuteNativeExclusiveOptionSwitchInputs); i < iEnd; ++i)
		{
			if (XXX_DOM_NativeHelpers.nativeExclusiveOptionSwitchInput.getValue(this.minuteNativeExclusiveOptionSwitchInputs[i]) == minute)
			{
				XXX_CSS.setClass(this.minuteNativeExclusiveOptionSwitchInputs[i].id + '_label', 'clockSelected');
			}
			else
			{
				
				XXX_CSS.removeClass(this.minuteNativeExclusiveOptionSwitchInputs[i].id + '_label', 'clockSelected');
			}
		}
	};

	XXX_Component_Clock.prototype.hide = function ()
	{
		XXX_CSS.setStyle(this.elements.clockContainer, 'display', 'none');
		
		XXX_DOM_DialogVisibility.dialogHidden(this.dialogVisibilityIndex);
	};
	
	XXX_Component_Clock.prototype.show = function ()
	{
		XXX_DOM_DialogVisibility.hideAll();
		XXX_CSS.setStyle(this.elements.clockContainer, 'display', 'block');
		
		this.reposition();
		
		XXX_CSS_Depth.bringToFront(this.elements.clockContainer);
		
		XXX_DOM_DialogVisibility.dialogShown(this.dialogVisibilityIndex);
	};
	
	XXX_Component_Clock.prototype.reposition = function ()
	{
		XXX_CSS_Position.nextToOffsetElement(this.elements.input, this.elements.clockContainer, ['bottomRight', 'topRight'], 5);
	};