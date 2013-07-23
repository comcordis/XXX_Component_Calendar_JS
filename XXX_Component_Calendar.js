var XXX_Component_Calendar = function (input, weekStart, dateFormat, additionalOffsetFromNowIfEmpty)
	{
		this.ID = XXX.createID();
		
		
		this.additionalOffsetFromNowIfEmpty = XXX_Default.toInteger(additionalOffsetFromNowIfEmpty, 3600);
	
			var now = XXX_TimestampHelpers.getCurrentTimestamp() + XXX_JS.timezoneOffset;
			
		this.selectedDate = new XXX_Timestamp(now);
		this.todaysDate = new XXX_Timestamp(now);
		
		var selectedDateParts = this.selectedDate.parse();
		
		this.viewYear = selectedDateParts.year;
		this.viewMonth = selectedDateParts.month;
		
		if (!(weekStart == 'monday' || weekStart == 'sunday'))
		{
			weekStart = 'monday';
		}
		
		this.weekStart = weekStart;
		
		if (!(dateFormat == 'dateMonthYear' || dateFormat == 'monthDateYear'))
		{
			dateFormat = 'dateMonthYear';
		}
		
		this.dateFormat = dateFormat;
		
		this.IDToDateConversion = {};
		
		this.elements = {};
		
		this.eventDispatcher = new XXX_EventDispatcher();
		
		this.elements.input = XXX_DOM.get(input);
			XXX_CSS.setStyle(this.elements.input, 'text-align', 'right');
		
		this.elements.calendarContainer = XXX_DOM.createElementNode('div');
			XXX_CSS.setClass(this.elements.calendarContainer, 'dialog');
		
		XXX_DOM.appendChildNode(XXX_DOM.getBody(), this.elements.calendarContainer);
		
		
		this.propagateDateFromInput();
		this.propagateDateFromCalendar();
		
		this.dialogVisibilityIndex = XXX_DOM_DialogVisibility.attachDialog(this);
			
		this.rerender();
		
		this.hide();
		
		this.addInputEventHandlers();		
	};
	
	XXX_Component_Calendar.prototype.addInputEventHandlers = function ()
	{
		var XXX_Component_Calendar_instance = this;
		
		XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.input, 'blur', function (nativeEvent)
		{
			nativeEvent.stopPropagation();
			
			var target = XXX_DOM_NativeEventDispatcher.getTarget(nativeEvent);
			
			if (!XXX_DOM.isAncestor(XXX_Component_Calendar_instance.elements.calendarContainer, target))
			{
				XXX_Component_Calendar_instance.propagateDateFromInput();
				XXX_Component_Calendar_instance.propagateDateFromCalendar();
				XXX_Component_Calendar_instance.rerender();
			}
		});
		XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.input, 'keyUp', function (nativeEvent)
		{
			nativeEvent.stopPropagation();
			
			XXX_Component_Calendar_instance.propagateDateFromInput();
			XXX_Component_Calendar_instance.rerender();
		});
		XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.input, 'change', function (nativeEvent)
		{
			nativeEvent.stopPropagation();
			
			XXX_Component_Calendar_instance.propagateDateFromInput();
			XXX_Component_Calendar_instance.rerender();
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
			
			XXX_Component_Calendar_instance.show();
			XXX_Component_Calendar_instance.rerender();
		});
		
		XXX_DOM_NativeEventDispatcher.addEventListener(this.elements.input, 'focus', function (nativeEvent)
		{
			nativeEvent.stopPropagation();
			nativeEvent.preventDefault();
			
			XXX_Component_Calendar_instance.show();
			XXX_Component_Calendar_instance.rerender();
		});
	};
	
	XXX_Component_Calendar.prototype.setSelectedDateByTimestamp = function (timestamp)
	{
		if (XXX_Type.isInteger(timestamp))
		{
			var tempTimestamp = new XXX_Timestamp();
			tempTimestamp.set(timestamp);
			timestamp = tempTimestamp;
			
			var tempTimestampParts = tempTimestamp.parse();
			
			this.viewYear = tempTimestampParts.year;
			this.viewMonth = tempTimestampParts.month;
		}
		
		this.selectedDate = timestamp;
		
		this.rerender();
		this.reposition();
		
		this.propagateDateFromCalendar();
		
		this.hide();
	};
		
	XXX_Component_Calendar.prototype.propagateDateFromCalendar = function ()
	{
		var composedDateValue = XXX_TimestampHelpers.composeDateValue(this.selectedDate, this.dateFormat);
				
		XXX_DOM_NativeHelpers.nativeCharacterLineInput.setValue(this.elements.input, composedDateValue);
				
		this.eventDispatcher.dispatchEventToListeners('change', this);
	};
	
	XXX_Component_Calendar.prototype.propagateDateFromInput = function ()
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
			
			var tempDate = new XXX_Timestamp();
			tempDate.set((tempDate.get() + offset) + this.additionalOffsetFromNowIfEmpty);
			
			var tempDateParts = tempDate.parse();
			
			this.viewYear = tempDateParts.year;
			this.viewMonth = tempDateParts.month;
		}
		else
		{
			var parsedDateValue = XXX_TimestampHelpers.parseDateValue(value, this.dateFormat);
			
			var tempDate = new XXX_Timestamp();
			tempDate.compose({year: parsedDateValue.year, month: parsedDateValue.month, date: parsedDateValue.date});
			
			this.viewYear = parsedDateValue.year;
			this.viewMonth = parsedDateValue.month;
		}
		
		this.selectedDate = tempDate;
				
		this.eventDispatcher.dispatchEventToListeners('change', this);
	};
	
	XXX_Component_Calendar.prototype.getOuterElementNode = function ()
	{
		return this.elements.calendarContainer;
	};
	
	XXX_Component_Calendar.prototype.rerender = function ()
	{
		this.composeCalendarHTML();
		this.reposition();
		this.addCalendarEventHandlers();
	};
	
	XXX_Component_Calendar.prototype.composeCalendarHTML = function ()
	{
		var monthArray = XXX_TimestampHelpers.getMonthArray(this.viewYear, this.viewMonth, this.weekStart);
		
		if (monthArray)
		{
			var selectedDateParts = this.selectedDate.parse();
			var todaysDateParts = this.todaysDate.parse();
			
			this.IDToDateConversion = {};
			
			var calendarHTML = '';
							
			calendarHTML += '<div class="calendarTableHeader">';
			
			calendarHTML += '<a href="#" id="' + this.ID + '_closeCalendar" class="closeCalendar">X</a> ';
			
			calendarHTML += '<a href="#" id="' + this.ID + '_previousMonth" class="previousMonth">&lt;&lt;</a>&nbsp;&nbsp; ';
			
			calendarHTML += '<span class="viewMonthAndYear">';
			
			var monthAbbreviations =
			[
				XXX_I18n_Translation.get('custom', 'calendar', 'months', 'abbreviations', 'january'),
				XXX_I18n_Translation.get('custom', 'calendar', 'months', 'abbreviations', 'february'),
				XXX_I18n_Translation.get('custom', 'calendar', 'months', 'abbreviations', 'march'),
				XXX_I18n_Translation.get('custom', 'calendar', 'months', 'abbreviations', 'april'),
				XXX_I18n_Translation.get('custom', 'calendar', 'months', 'abbreviations', 'may'),
				XXX_I18n_Translation.get('custom', 'calendar', 'months', 'abbreviations', 'june'),
				XXX_I18n_Translation.get('custom', 'calendar', 'months', 'abbreviations', 'july'),
				XXX_I18n_Translation.get('custom', 'calendar', 'months', 'abbreviations', 'august'),
				XXX_I18n_Translation.get('custom', 'calendar', 'months', 'abbreviations', 'september'),
				XXX_I18n_Translation.get('custom', 'calendar', 'months', 'abbreviations', 'october'),
				XXX_I18n_Translation.get('custom', 'calendar', 'months', 'abbreviations', 'november'),
				XXX_I18n_Translation.get('custom', 'calendar', 'months', 'abbreviations', 'december')
			];
			
			calendarHTML += monthAbbreviations[this.viewMonth - 1];
			
			calendarHTML += ' ' + this.viewYear;
			calendarHTML += '</span>';
			
			calendarHTML += ' &nbsp;&nbsp;<a href="#" id="' + this.ID + '_nextMonth" class="nextMonth">&gt;&gt;</a>';
			
			calendarHTML += '</div>';
			
			calendarHTML += '<table class="calendarTable">';
			calendarHTML += '<tr>';
			
			var dayAbbreviations =
			[
				XXX_I18n_Translation.get('custom', 'calendar', 'daysOfTheWeek', 'abbreviations', 'monday'),
				XXX_I18n_Translation.get('custom', 'calendar', 'daysOfTheWeek', 'abbreviations', 'tuesday'),
				XXX_I18n_Translation.get('custom', 'calendar', 'daysOfTheWeek', 'abbreviations', 'wednesday'),
				XXX_I18n_Translation.get('custom', 'calendar', 'daysOfTheWeek', 'abbreviations', 'thursday'),
				XXX_I18n_Translation.get('custom', 'calendar', 'daysOfTheWeek', 'abbreviations', 'friday'),
				XXX_I18n_Translation.get('custom', 'calendar', 'daysOfTheWeek', 'abbreviations', 'saturday'),
				XXX_I18n_Translation.get('custom', 'calendar', 'daysOfTheWeek', 'abbreviations', 'sunday')
			];
			
			for (var i = 0, iEnd = XXX_Array.getFirstLevelItemTotal(monthArray); i < iEnd; ++i)
			{
				var temp = monthArray[i];
				
				// Only week inidication, and week days
				if (i < 8)
				{
					if (i == 0)
					{
						calendarHTML += '<th>' + temp + '</th>';
					}
					else
					{
						calendarHTML += '<th style="border-bottom: 1px dashed #DDDDDD;">';
						
						calendarHTML += dayAbbreviations[temp - 1];
						
						calendarHTML += '</th>';
					}
				}
				else
				{
					if (temp.type == 'weekOfTheYear')
					{
						calendarHTML += '</tr><tr>';
						calendarHTML += '<th style="border-right: 1px dashed #DDDDDD;">' + temp.weekOfTheYear + '</th>';
					}
					else
					{
						var ID = this.ID + '_date_' + i;
						var IDDate =
						{
							year: temp.year,
							month: temp.month,
							date: temp.date
						};
						
						this.IDToDateConversion[ID] = IDDate;
							
						if (temp.year == selectedDateParts.year && temp.month == selectedDateParts.month && temp.date == selectedDateParts.date)
						{
							
							calendarHTML += '<td class="selected" id="' + ID + '">' + temp.date + '</td>';
						}
						else if (temp.year == todaysDateParts.year && temp.month == todaysDateParts.month && temp.date == todaysDateParts.date)
						{
							calendarHTML += '<td class="today" id="' + ID + '">' + temp.date + '</td>';
						}
						else
						{						
							if (temp.type == 'previous')
							{
								calendarHTML += '<td class="previous" id="' + ID + '">' + temp.date + '</td>';
							}
							else if (temp.type == 'next')
							{
								calendarHTML += '<td class="next" id="' + ID + '">' + temp.date + '</td>';
							}
							else if (temp.type == 'current')
							{
								calendarHTML += '<td class="current" id="' + ID + '">' + temp.date + '</td>';
							}
						}
					}
				}
			}
			
			calendarHTML += '</tr>';
			calendarHTML += '</table>';
			
			calendarHTML += '<div class="calendarTableFooter">';
				calendarHTML += '<a href="#" id="' + this.ID + '_today" class="today">' + XXX_I18n_Translation.get('dateTime', 'today') + '</a> ';
				calendarHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
				calendarHTML += '<a href="#" id="' + this.ID + '_tomorrow" class="tomorrow">' + XXX_I18n_Translation.get('dateTime', 'tomorrow') + '</a>';
			calendarHTML += '</div>';
			
			XXX_DOM.setInner(this.elements.calendarContainer, calendarHTML);
		}
	};
	
	XXX_Component_Calendar.prototype.addCalendarEventHandlers = function ()
	{
		var XXX_Component_Calendar_instance = this;
		
		XXX_DOM_NativeEventDispatcher.addEventListener(this.ID + '_closeCalendar', 'mouseDown', function (nativeEvent)
		{	
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();
		});
		XXX_DOM_NativeEventDispatcher.addEventListener(this.ID + '_closeCalendar', 'click', function (nativeEvent)
		{	
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();
			
			XXX_Component_Calendar_instance.hide();
		});
				
		XXX_DOM_NativeEventDispatcher.addEventListener(this.ID + '_nextMonth', 'mouseDown', function (nativeEvent)
		{	
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();
		});
		XXX_DOM_NativeEventDispatcher.addEventListener(this.ID + '_nextMonth', 'click', function (nativeEvent)
		{	
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();
			
			XXX_Component_Calendar_instance.nextMonthClicked();
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
			
			XXX_Component_Calendar_instance.previousMonthClicked();
		});
		
		XXX_DOM_NativeEventDispatcher.addEventListener(this.ID + '_today', 'mouseDown', function (nativeEvent)
		{	
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();
		});
		XXX_DOM_NativeEventDispatcher.addEventListener(this.ID + '_today', 'click', function (nativeEvent)
		{	
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();
			
			XXX_Component_Calendar_instance.todayClicked();
		});
		
		XXX_DOM_NativeEventDispatcher.addEventListener(this.ID + '_tomorrow', 'mouseDown', function (nativeEvent)
		{	
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();
		});
		XXX_DOM_NativeEventDispatcher.addEventListener(this.ID + '_tomorrow', 'click', function (nativeEvent)
		{	
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();
			
			XXX_Component_Calendar_instance.tomorrowClicked();
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
				
				XXX_Component_Calendar_instance.dateClicked(this.id);
			});
		}
	};
	
	XXX_Component_Calendar.prototype.dateClicked = function (ID)
	{
		var temp = this.IDToDateConversion[ID];
			
		if (temp)
		{
			this.viewYear = temp.year;
			this.viewMonth = temp.month;
			
			this.selectedDate = new XXX_Timestamp();
			this.selectedDate.compose(temp);
			
			this.rerender();
			this.reposition();
			
			this.propagateDateFromCalendar();
			
			this.hide();
		}
	};
	
	XXX_Component_Calendar.prototype.todayClicked = function ()
	{
		var todaysDateParts = this.todaysDate.parse();
		
		this.viewYear = todaysDateParts.year;
		this.viewMonth = todaysDateParts.month;
		
		this.selectedDate = this.todaysDate;
		
		this.rerender();
			
		this.propagateDateFromCalendar();
	};
	
	XXX_Component_Calendar.prototype.tomorrowClicked = function ()
	{
		var tomorrowsDate = new XXX_Timestamp(this.todaysDate.get() + 86400);
		var tomorrowsDateParts = tomorrowsDate.parse();
				
		this.viewYear = tomorrowsDateParts.year;
		this.viewMonth = tomorrowsDateParts.month;
		
		this.selectedDate = tomorrowsDate;
		
		this.rerender();
			
		this.propagateDateFromCalendar();
	};
	
	XXX_Component_Calendar.prototype.nextMonthClicked = function ()
	{
		var newYearAndMonth = XXX_TimestampHelpers.getYearAndMonthByMonthOffset(this.viewYear, this.viewMonth, 1);
			
		this.viewYear = newYearAndMonth.year;
		this.viewMonth = newYearAndMonth.month;
		
		this.rerender();
	};
	
	XXX_Component_Calendar.prototype.previousMonthClicked = function ()
	{
		var newYearAndMonth = XXX_TimestampHelpers.getYearAndMonthByMonthOffset(this.viewYear, this.viewMonth, -1);
		
		this.viewYear = newYearAndMonth.year;
		this.viewMonth = newYearAndMonth.month;
		
		this.rerender();
	};
	
	XXX_Component_Calendar.prototype.hide = function ()
	{
		XXX_CSS.setStyle(this.elements.calendarContainer, 'display', 'none');
		
		XXX_DOM_DialogVisibility.dialogHidden(this.dialogVisibilityIndex);
	};
	
	XXX_Component_Calendar.prototype.show = function ()
	{
		XXX_DOM_DialogVisibility.hideAll();
		XXX_CSS.setStyle(this.elements.calendarContainer, 'display', 'block');
		
		this.reposition();
		
		XXX_CSS_Depth.bringToFront(this.elements.calendarContainer);
		
		XXX_DOM_DialogVisibility.dialogShown(this.dialogVisibilityIndex);
	};
	
	XXX_Component_Calendar.prototype.reposition = function ()
	{
		XXX_CSS_Position.nextToOffsetElement(this.elements.input, this.elements.calendarContainer, ['bottomRight', 'topRight'], 5);
	};