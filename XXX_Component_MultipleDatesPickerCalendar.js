var XXX_Component_MultipleDatesPickerCalendar = function (container, weekStart, jsonInput)
	{
		this.ID = XXX.createID();
		
		var now = XXX_TimestampHelpers.getCurrentTimestamp() + XXX_JS.timezoneOffset;
			
		var selectedDate = new XXX_Timestamp(now);
		var selectedDateParts = selectedDate.parse();
		
		this.viewYear = selectedDateParts.year;
		this.viewMonth = selectedDateParts.month;
		
		this.elements = {};
		
		this.elements.container = XXX_DOM.get(container);
		
		this.elements.jsonInput = XXX_DOM.get(jsonInput);
				
		this.year = XXX_TimestampHelpers.getCurrentYear();
		
		this.IDToDateConversion = {};
		
		if (!(weekStart == 'monday' || weekStart == 'sunday'))
		{
			weekStart = 'monday';
		}
		
		this.weekStart = weekStart;
		
		this.selectedDates = [];
				
		this.rerender();
	};
	
	XXX_Component_MultipleDatesPickerCalendar.prototype.addSelectedDates = function (selectedDates)
	{
		if (XXX_Type.isArray(selectedDates))
		{
			for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(selectedDates); i < iEnd; ++i)
			{
				var selectedDate = selectedDates[i];
				
				if (XXX_TimestampHelpers.isExistingDate(selectedDate.year, selectedDate.month, selectedDate.date))
				{
					if (this.isDateSelected(selectedDate.year, selectedDate.month, selectedDate.date) === false)
					{
						this.selectedDates.push({year: selectedDate.year, month: selectedDate.month, date:selectedDate.date});
					}
				}
			}
		}
		
		this.rerender();
	};
	
	XXX_Component_MultipleDatesPickerCalendar.prototype.rerender = function ()
	{
		this.composeCalendarHTML();
		
		this.addCalendarEventHandlers();
				
		this.updateJSONInput();
	};
	
	XXX_Component_MultipleDatesPickerCalendar.prototype.updateJSONInput = function ()
	{
		if (this.elements.jsonInput)
		{
			XXX_DOM_NativeHelpers.nativeCharacterLineInput.setValue(this.elements.jsonInput, XXX_String_JSON.encode(this.selectedDates));
		}
	};
	
	XXX_Component_MultipleDatesPickerCalendar.prototype.composeCalendarHTML = function ()
	{
		var output = '';
		
		this.IDToDateConversion = {};
		
		var monthAbbreviations = XXX_I18n_Translation.get('dateTime', 'months', 'abbreviations');
		var dayAbbreviations = XXX_I18n_Translation.get('dateTime', 'daysOfTheWeek', 'abbreviations');
		
		var monthArray = XXX_TimestampHelpers.getMonthArray(this.viewYear, this.viewMonth, this.weekStart);
	
		if (monthArray)
		{								
			output += '<div class="calendarTableHeader">';
		
			output += '<a href="#" id="' + this.ID + '_previousMonth" class="previousMonth">&lt;&lt;</a>&nbsp;&nbsp; ';
			
			output += '<span class="viewMonthAndYear">';
			
					output += monthAbbreviations[this.viewMonth - 1];
					
					output += ' ' + this.viewYear;
			output += '</span>';
			
			output += ' &nbsp;&nbsp;<a href="#" id="' + this.ID + '_nextMonth" class="nextMonth">&gt;&gt;</a>';
			
			output += '</div>';
			
			
			
			output += '<table class="calendarTable">';
			output += '<tr>';
			
			
			
			for (var j = 0, jEnd = XXX_Array.getFirstLevelItemTotal(monthArray); j < jEnd; ++j)
			{
				var temp = monthArray[j];
				
				// Only week inidication, and week days
				if (j < 8)
				{
					if (j == 0)
					{
						output += '<th>' + temp + '</th>';
					}
					else
					{
						output += '<th style="border-bottom: 1px dashed #DDDDDD;">';
						
						output += dayAbbreviations[temp - 1];
						
						output += '</th>';
					}
				}
				else
				{
					if (temp.type == 'weekOfTheYear')
					{
						output += '</tr><tr>';
						output += '<th style="border-right: 1px dashed #DDDDDD;">' + temp.weekOfTheYear + '</th>';
					}
					else
					{		
						var ID = this.ID + '_date_' + temp.year + '_' + temp.month + '_' + temp.date + '_' + j;
				
						var IDDate =
						{
							year: temp.year,
							month: temp.month,
							date: temp.date,
							type: temp.type
						};
						
						this.IDToDateConversion[ID] = IDDate;
						
						var isSelected = this.isDateSelected(temp.year, temp.month, temp.date) !== false;
						
						if (temp.type == 'previous')
						{
							output += '<td class="' + (isSelected ? 'selected' : 'previous') + '" id="' + ID + '">' + temp.date + '</td>';
						}
						else if (temp.type == 'next')
						{
							output += '<td class="' + (isSelected ? 'selected' : 'next') + '" id="' + ID + '">' + temp.date + '</td>';
						}
						else if (temp.type == 'current')
						{
							output += '<td class="' + (isSelected ? 'selected' : 'current') + '" id="' + ID + '">' + temp.date + '</td>';
						}
					}
				}
			}
			
			output += '</tr>';
			output += '</table>';
		}		
		
		XXX_DOM.setInner(this.elements.container, output);
		
		
	};
	
	XXX_Component_MultipleDatesPickerCalendar.prototype.addCalendarEventHandlers = function ()
	{
		var XXX_Component_MultipleDatesPickerCalendar_instance = this;
		
		XXX_DOM_NativeEventDispatcher.addEventListener(this.ID + '_nextMonth', 'mouseDown', function (nativeEvent)
		{	
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();
		});
		XXX_DOM_NativeEventDispatcher.addEventListener(this.ID + '_nextMonth', 'click', function (nativeEvent)
		{	
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();
			
			XXX_Component_MultipleDatesPickerCalendar_instance.nextMonthClicked();
		});
		
		XXX_DOM_NativeEventDispatcher.addEventListener(this.ID + '_previousMonth', 'mouseDown', function (nativeEvent)
		{	
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();
		});
		XXX_DOM_NativeEventDispatcher.addEventListener(this.ID + '_previousMonth', 'click', function (nativeEvent)
		{	
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();
			
			XXX_Component_MultipleDatesPickerCalendar_instance.previousMonthClicked();
		});
		
		for (var key in this.IDToDateConversion)
		{
			var ID = key;
			
			XXX_DOM_NativeEventDispatcher.addEventListener(ID, 'mouseDown', function (nativeEvent)
			{	
				nativeEvent.preventDefault();
				nativeEvent.stopPropagation();
			});
			
			XXX_DOM_NativeEventDispatcher.addEventListener(ID, 'click', function (nativeEvent)
			{	
				nativeEvent.preventDefault();
				nativeEvent.stopPropagation();
				
				XXX_Component_MultipleDatesPickerCalendar_instance.dateClicked(this.id);
			});
		}
	};
		
	XXX_Component_MultipleDatesPickerCalendar.prototype.nextMonthClicked = function ()
	{
		var newYearAndMonth = XXX_TimestampHelpers.getYearAndMonthByMonthOffset(this.viewYear, this.viewMonth, 1);
			
		this.viewYear = newYearAndMonth.year;
		this.viewMonth = newYearAndMonth.month;
		
		this.rerender();
	};
	
	XXX_Component_MultipleDatesPickerCalendar.prototype.previousMonthClicked = function ()
	{
		var newYearAndMonth = XXX_TimestampHelpers.getYearAndMonthByMonthOffset(this.viewYear, this.viewMonth, -1);
		
		this.viewYear = newYearAndMonth.year;
		this.viewMonth = newYearAndMonth.month;
		
		this.rerender();
	};
	
	XXX_Component_MultipleDatesPickerCalendar.prototype.isDateSelected = function (year, month, date)
	{
		var result = false;
					
		for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(this.selectedDates); i < iEnd; ++i)
		{
			if (this.selectedDates[i].year == year && this.selectedDates[i].month == month && this.selectedDates[i].date == date)
			{
				
				result = i;
				
				break;
			}
		}
		
		return result;
	};
	
	XXX_Component_MultipleDatesPickerCalendar.prototype.dateClicked = function (ID)
	{
		var temp = this.IDToDateConversion[ID];
			
		if (temp)
		{
			var dateElement = XXX_DOM.get(ID);
			
			var previouslySelected = this.isDateSelected(temp.year, temp.month, temp.date);
					
			if (XXX_CSS.hasClass(dateElement, 'selected'))
			{
				XXX_CSS.setClass(dateElement, temp.type);
				
				if (previouslySelected !== false)
				{
					this.selectedDates.splice(previouslySelected, 1);
				}
			}
			else
			{
				XXX_CSS.setClass(dateElement, 'selected');
				
				if (previouslySelected === false)
				{
					this.selectedDates.push({year: temp.year, month: temp.month, date: temp.date});
				}
			}
			
			if (temp.year != this.viewYear || temp.month != this.viewMonth)
			{
				this.viewYear = temp.year;
				this.viewMonth = temp.month;
				
				this.rerender();
			}
			
			this.updateJSONInput();
		}
	};