import {PostListComponent} from '../../../posts/components/post-list/post-list.component';
import {PostNewComponent} from '../../../posts/components/post-new/post-new.component';
import {PostEditComponent} from '../../../posts/components/post-edit/post-edit.component';
import {AboutComponent} from '../about/about.component';
import {LoginComponent} from '../../../auth/components/login/login.component';

import {CalendarComponent} from '../../../calendar/components/calendar/calendar.component';

export const routes = [
    {path: '/', component: CalendarComponent, name: 'Calendar', useAsDefault: true}
    // {path: '/calendar', component: CalendarComponent, name: 'Calendar'},
    // {path: '/new', component: PostNewComponent, name: 'New'},
    // {path: '/edit/:id', component: PostEditComponent, name: 'Edit'},
    // {path: '/about', component: AboutComponent, name: 'About'},
    // {path: '/login', component: LoginComponent, name: 'Login'}
];
