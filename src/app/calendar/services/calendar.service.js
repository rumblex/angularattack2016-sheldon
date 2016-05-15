import { Injectable, Inject, ApplicationRef } from '@angular/core';
import { Http, JSONP_PROVIDERS, Jsonp } from '@angular/http';
import { UserService } from '../../auth/services/user/user.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import moment from 'moment';
require('moment-range');


@Injectable()
export class CalendarService {
    remoteEvents = new BehaviorSubject([]);

    constructor (userService:UserService, @Inject('googleApi') googleApi, applicationRef:ApplicationRef) {
        this._googleApi = googleApi;
        this._userService = userService;
        this._applicationRef = applicationRef;
    }

    getRange(month, year) {
        var value = month !== undefined ? moment({month: month, year: year}) : moment();

        this.title = value.format("MMMM YYYY");

        var start = value.clone().startOf('month');
        var startDay = (start.day() === 0 ? 7 : start.day()) - 1;
        var begin = start.subtract(startDay, 'days');
        var end = begin.clone().add(41, 'days');
        return moment.range(begin, end).toArray('days').map((item) => {
            return {
                date: item.date(),
                value: item,
                otherMonth: item.month() !== value.month(),
                isCurrent: item.isSame(moment(), 'day'),
                isWeekend: this.dateIsWeekend(item.day()),
                startOfWeek: item.day() === 1,
                events: []
            }
        });
    }

    dateIsWeekend(day) {
        return day === 0 || day === 6;
    }

    createEvent ({summary, location, description, remind}) {
        var event = {
            summary,
            location,
            description,
            'start': {
                'dateTime': '2015-05-28T09:00:00-07:00',
                'timeZone': 'America/Los_Angeles'
            },
            'end': {
                'dateTime': '2015-05-28T17:00:00-07:00',
                'timeZone': 'America/Los_Angeles'
            },
            'recurrence': [
                'RRULE:FREQ=DAILY;COUNT=2'
            ],
            'attendees': [
                { 'email': 'lpage@example.com' },
                { 'email': 'sbrin@example.com' }
            ],
            'reminders': {
                'useDefault': false,
                'overrides': [
                    { 'method': 'email', 'minutes': 24 * 60 },
                    { 'method': 'popup', 'minutes': 10 }
                ]
            }
        };
        var promise = new Promise();

        if (remind) {
            event.reminders = {}
        }

        var request = gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': event
        });

        request.execute(function (event) {
            promise.resolve(event);
        });
    }

    @loggedIn
    listUpcomingEvents ({from, to}, gapi) {
        var request = gapi.client.calendar.events.list({
            calendarId: 'primary',
            timeMin: from || null,
            timeMax: to || null,
            showDeleted: false,
            singleEvents: true,
            orderBy: 'startTime'
        });

        return new Promise((resolve, reject) => {
            request.execute((resp) => {
                console.log(resp.items);
                resolve(resp.items);

                this.remoteEvents.next(resp.items);

                this._applicationRef.tick();
            });
        });
    }
}

function loggedIn (target, key, descriptor) {
    var method = descriptor.value;
    descriptor.value = function (...args) {
        return new Promise(resolve => {
            this._userService.getLoggedIn().subscribe((isLoggedIn) => {
                isLoggedIn && resolve(this._googleApi);
            });
        }).then(gapi => {
            return new Promise(resolve => {
                gapi.client.load('calendar', 'v3', () => resolve(gapi));
            })
        }).then(gapi => {
            return method.apply(this, args.concat(gapi));
        });
    };
    return descriptor;
}