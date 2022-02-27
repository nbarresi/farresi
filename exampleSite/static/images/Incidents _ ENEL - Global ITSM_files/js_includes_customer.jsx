/*! RESOURCE: /scripts/js_includes_customer.js */
/*! RESOURCE: GGPA News dialog */
addLoadEvent(function() {
var pathName = window.location.pathname;
var welcomePage = pathName.endsWith("welcome.do");
var oldURL = document.referrer;
if(!welcomePage){
return;
}
if(oldURL != undefined && !oldURL.endsWith("navpage.do") && !oldURL.endsWith(".com/")){
return;
}
var gaLanguageUserIT =false;
var gaUserVis = new GlideAjax("global.GGPANews");
gaUserVis.addParam("sysparm_name", "getUserLanguageIT");
gaUserVis.getXML(function(serverResponse) {
var answer = serverResponse.responseXML.documentElement.getAttribute("answer");
if (answer == 'true'){
gaLanguageUserIT = true;
}
});
var ga = new GlideAjax('global.GGPANews');
ga.addParam('sysparm_name', 'handleSession');
ga.getXML(function(serverResponse) {
var answer = serverResponse.responseXML.documentElement.getAttribute("answer");
if (answer == 'false'){
showTerms(gaLanguageUserIT);
}
});
});
var showTerms = function(gaLanguageUserIT) {
var title = "Guapo - New features";
if(gaLanguageUserIT){
title = "Guapo - Nuove funzionalità";
}
var dialog = new GlideDialogWindow('ggpa_news_dialog');
dialog.setTitle(title);
dialog.setSize(300, 300);
dialog.removeCloseDecoration();
dialog.render();
};
/*! RESOURCE: ScrumReleaseImportGroupDialog */
var ScrumReleaseImportGroupDialog = Class.create();
ScrumReleaseImportGroupDialog.prototype = {
initialize: function () {
this.setUpFacade();
},
setUpFacade: function () {
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
this._mstrDlg = new dialogClass("task_window");
this._mstrDlg.setTitle(getMessage("Add Members From Group"));
this._mstrDlg.setBody(this.getMarkUp(), false, false);
},
setUpEvents: function () {
var self = this, dialog = this._mstrDlg;
var okButton = $("ok");
if (okButton) {
okButton.on("click", function () {
var mapData = {};
if (self.fillDataMap (mapData)) {
var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembersProcessor");
for (var strKey in mapData) {
processor.addParam(strKey, mapData[strKey]);
}
self.showStatus(getMessage("Adding group users..."));
processor.getXML(function () {
self.refresh();
dialog.destroy();
});
} else {
dialog.destroy();
}
});
}
var cancelButton = $("cancel");
if (cancelButton) {
cancelButton.on("click", function () {
dialog.destroy();
});
}
var okNGButton = $("okNG");
if (okNGButton) {
okNGButton.on("click", function () {
dialog.destroy();
});
}
var cancelNGButton = $("cancelNG");
if (cancelNGButton) {
cancelNGButton.on("click", function () {
dialog.destroy();
});
}
},
refresh: function(){
GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
},
getScrumReleaseTeamSysId: function () {
return g_form.getUniqueValue() + "";
},
getUserChosenGroupSysIds: function () {
return $F('groupId') + "";
},
showStatus: function (strMessage) {
$("task_controls").update(strMessage);
},
display: function(bIsVisible) {
$("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
},
getRoleIds: function () {
var arrRoleNames = ["scrum_user", "scrum_admin", "scrum_release_planner", "scrum_sprint_planner", "scrum_story_creator"];
var arrRoleIds = [];
var record = new GlideRecord ("sys_user_role");
record.addQuery ("name", "IN", arrRoleNames.join (","));
record.query ();
while (record.next ())
arrRoleIds.push (record.sys_id + "");
return arrRoleIds;
},
hasScrumRole: function (roleSysId, arrScrumRoleSysIds) {
for (var index = 0; index < arrScrumRoleSysIds.length; ++index)
if (arrScrumRoleSysIds[index] == "" + roleSysId)
return true;
var record = new GlideRecord ("sys_user_role_contains");
record.addQuery("role", roleSysId);
record.query ();
while (record.next())
if (this.hasScrumRole (record.contains, arrScrumRoleSysIds))
return true;
return false;
},
getGroupIds: function () {
var arrScrumRoleIds = this.getRoleIds ();
var arrGroupIds = [];
var record = new GlideRecord ("sys_group_has_role");
record.query ();
while (record.next ())
if (this.hasScrumRole (record.role, arrScrumRoleIds))
arrGroupIds.push (record.group + "");
return arrGroupIds;
},
getGroupInfo: function () {
var mapGroupInfo = {};
var arrRoleIds = this.getRoleIds ();
var arrGroupIds = this.getGroupIds (arrRoleIds);
var record = new GlideRecord ("sys_user_group");
record.addQuery("sys_id", "IN", arrGroupIds.join (","));
record.query ();
while (record.next ()) {
var strName = record.name + "";
var strSysId = record.sys_id + "";
mapGroupInfo [strName] = {name: strName, sysid: strSysId};
}
return mapGroupInfo;
},
getMarkUp: function () {
var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
groupAjax.addParam('sysparm_name', 'getGroupInfo');
groupAjax.getXML(this.generateMarkUp.bind(this));
},
generateMarkUp: function(response) {
var mapGroupInfo = {};
var groupData = response.responseXML.getElementsByTagName("group");
var strName, strSysId;
for (var i = 0; i < groupData.length; i++) {
strName = groupData[i].getAttribute("name");
strSysId = groupData[i].getAttribute("sysid");
mapGroupInfo[strName] = {
name: strName,
sysid: strSysId
};
}
var arrGroupNames = [];
for (var strGroupName in mapGroupInfo) {
arrGroupNames.push (strGroupName + "");
}
arrGroupNames.sort ();
var strMarkUp = "";
if (arrGroupNames.length > 0) {
var strTable = "<div class='row'><div class='form-group'><span class='col-sm-12'><select class='form-control' id='groupId'>";
for (var nSlot = 0; nSlot < arrGroupNames.length; ++nSlot) {
strName = arrGroupNames[nSlot];
strSysId = mapGroupInfo [strName].sysid;
strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
}
strTable += "</select></span></div></div>";
strMarkUp = "<div id='task_controls'>" + strTable +
"<div style='text-align:right;padding-top:20px;'>" +
"<button id='cancel' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>"+
"&nbsp;&nbsp;<button id='ok' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
"</div></div>";
} else {
strMarkUp = "<div id='task_controls'><p>No groups with scrum_user role found</p>" +
"<div style='text-align: right;padding-top:20px;'>" +
"<button id='cancelNG' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>"+
"&nbsp;&nbsp;<button id='okNG' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
"</div></div>";
}
this._mstrDlg.setBody(strMarkUp, false, false);
this.setUpEvents();
this.display(true);
},
fillDataMap: function (mapData) {
var strChosenGroupSysId = this.getUserChosenGroupSysIds ();
if (strChosenGroupSysId) {
mapData.sysparm_name = "createReleaseTeamMembers";
mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId ();
mapData.sysparm_groups = strChosenGroupSysId;
return true;
} else {
return false;
}
}
};
/*! RESOURCE: SCA_API_for_Item_Form */
var SCA_ServicePortal_API = {
convertData: function (g_user,g_form,data)
{
var log = 'SCA Load API: SCA_ServicePortal_API.convertData()';
var showAlert = true;
var date_value = data.toString();
log+= '\n Input Date: '+data;
date_value = date_value.replace(/\//g , "-");
date_value = date_value.replace(/\./g , "-");
log+= '\n Input Date (replaced with -): '+date_value;
try
{
var date_split, date_parse;
var gr = GlideRecordAdvanced( 'sys_user' , 'sys_id='+g_user.userID , 'date_format');
var user_format = gr[0].date_format.toString().toLowerCase();
log+= '\n user_format: '+ user_format;
user_format = user_format.replace(/\//g , "-");
user_format = user_format.replace(/\./g , "-");
log+= '\n user_format (replaced with -): '+ user_format;
date_split = date_value.split(" ");
switch( user_format ) {
case 'dd-mm-yyyy':
date_parse = date_split[0].split("-");
date_value = date_parse[2] + "-" + date_parse[1] + "-" + date_parse[0];
break;
case 'mm-dd-yyyy':
date_parse = date_split[0].split("-");
date_value = date_parse[2] + "-" + date_parse[0] + "-" + date_parse[1];
break;
}
if( data != date_value && date_split[1] !== undefined)
date_value += " " + date_split[1];
log+= '\n SUCCESS';
showAlert = false;
}
catch(error)
{
log+= '\n FATAL ERROR: '+error;
}
log+='\n Output date: '+date_value;
console.log(log);
if(showAlert)alert(log);
return date_value;
},
array_include: function(array, element) {
var log = 'SCA Load API: SCA_ServicePortal_API.array_include()';
var result = false;
try {
for (var i = 0; i < array.length; i++)
{
if (array[i].toString().toLowerCase() == element.toString().toLowerCase())
{
result = true;
log += '\nresult'+result;
}
}
} catch (e) {
log += '\n FATAL ERROR: ' + e;
}
console.log(log);
return result;
},
array_unique: function(a1)
{
var log = 'SCA Load API: SCA_ServicePortal_API.array_unique()';
try
{
var a = [];
var l = a1.length;
for (var i = 0; i < l; i++) {
for (var j = i + 1; j < l; j++) {
if (a1[i] === a1[j])
j = ++i;
}
a.push(a1[i]);
}
}
catch(e)
{
log+= '\n FATAL ERROR: '+e;
}
console.log(log);
return a;
},
sortIP: function (ip_array)
{
function formatNumber(num){		return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');	}
var ip_array_sort = [];
var log = 'SCA Load API: SCA_ServicePortal_API.sortIP()';
var temp = ip_array.toString();
temp = temp.replace(/,/g, "\n");
log+= '\n\nArray input:\n'+temp;
try
{
for(var i=0; i<ip_array.length;i++)
{
var ip = ip_array[i];
ip = ip.split(".").map( function(i) { return ("00"+i).slice(-3);} ).join(".");
ip = ip.replace(/\./g, "");
ip_array[i] = ip;
}
ip_array_sort = ip_array.sort();
for(i=0; i<ip_array_sort.length;i++)
{
var ip2 = formatNumber(ip_array_sort[i]);
if(ip2.match(/\.00/g)){
var res = ip2.replace(/\.00/g, ".");
}
if(ip2.match(/\.0/g)){
res = ip2.replace(/\.0/g, ".");
}
if(res &&(res.match(/\.0/g))){
res = res.replace(/\.0/g, ".");
}
if((!ip2.match(/\.00/g))&&(!ip2.match(/\.0/g))){
res=ip2;
}
if(res.startsWith('00')){
var result=res.substring(2);
}else if(res.startsWith('0')){
result=res.substring(1);
}else{
result=res;
}
ip_array_sort[i] = result;
}
temp = ip_array_sort.toString();
temp = temp.replace(/,/g, "\n");
log+= '\nArray ordinato:\n'+temp;
}
catch(e)
{
log+= '\n FATAL ERROR: '+e;
}
console.log(log);
return ip_array_sort;
},
compareDate_number: function (date, number)
{
var log = 'SCA Load API: SCA_ServicePortal_API.compareDate_number(date,number)';
var showAlert = true;
var result = {};
try
{
date = date.toString();
log+= '\n date: '+date;
date = date.replace(/\//g , "-");
date = date.replace(/\./g , "-");
log+= '\n date_replaced: '+date;
log+= '\n number: '+number;
var restEndPoint = "api/eneld/sca_api/compareDateInput_number/";
restEndPoint = restEndPoint + date + "/" + number;
var serverRequest = new XMLHttpRequest();
serverRequest.open("get", restEndPoint, false);
serverRequest.setRequestHeader("X-UserToken", g_ck);
serverRequest.setRequestHeader("Accept", "application/json");
serverRequest.setRequestHeader("Content-Type", "application/json");
serverRequest.send();
if (serverRequest.status === 200)
{
log+='\n response: '+ serverRequest.responseText;
var response_string = serverRequest.response;
var response_parsed = JSON.parse(response_string);
var result_boolean = response_parsed.result.value;
log+='\n Result: '+ result_boolean;
log+= '\n\nAPI REST LOG: '+ response_parsed.result.log;
if(result_boolean)
{
result["test"] = true;
result["message"] = "";
}
else
{
result["test"] = false;
result["message"] = "Date cannot be in the past";
}
log+= '\n\nAPI Call Completed';
showAlert = false;
}
else
{
log+= '\n\nAPI Call Failed';
log+= "\n status: "+ serverRequest.status;
log+= "\n statusText: "+ serverRequest.statusText;
log+= "\n responseText: "+ serverRequest.responseText;
}
}
catch(error)
{
log+= '\n FATAL ERROR: '+error;
}
console.log(log);
if(showAlert)alert(log);
return result;
},
getDateDiff: function (date_start, date_end)
{
var log = 'SCA Load API: SCA_ServicePortal_API.getDateDiff(date_start,date_end)';
var showAlert = true;
var result = {};
try
{
date_start = date_start.toString();
log+= '\n date_start: '+date_start;
date_start = date_start.replace(/\//g , "-");
date_start = date_start.replace(/\./g , "-");
log+= '\n date_start_replaced: '+date_start;
date_end = date_end.toString();
log+= '\n date_end: '+date_end;
date_end = date_end.replace(/\//g , "-");
date_end = date_end.replace(/\./g , "-");
log+= '\n date_end_replaced: '+date_end;
var param = 'getDateDiff';
var restEndPoint = "api/eneld/sca_api/compareDateInput/";
restEndPoint = restEndPoint + date_start + "/" + date_end + "/" + param;
var serverRequest = new XMLHttpRequest();
serverRequest.open("get", restEndPoint, false);
serverRequest.setRequestHeader("X-UserToken", g_ck);
serverRequest.setRequestHeader("Accept", "application/json");
serverRequest.setRequestHeader("Content-Type", "application/json");
serverRequest.send();
if (serverRequest.status === 200)
{
log+='\n response: '+ serverRequest.responseText;
var response_string = serverRequest.response;
var response_parsed = JSON.parse(response_string);
log+='\n Result: '+ response_parsed.result.value;
log+= '\n\nAPI REST LOG: '+ response_parsed.result.log;
result["seconds"] = response_parsed.result.value;
result["message"] = "";
log+= '\n\nAPI Call Completed';
showAlert = false;
}
else
{
log+= '\n\nAPI Call Failed';
log+= "\n status: "+ serverRequest.status;
log+= "\n statusText: "+ serverRequest.statusText;
log+= "\n responseText: "+ serverRequest.responseText;
}
}
catch(error)
{
log+= '\n FATAL ERROR: '+error;
}
console.log(log);
if(showAlert)alert(log);
return result;
},
compareDate: function (date_start, date_end)
{
var log = 'SCA Load API: SCA_ServicePortal_API.compareDate()';
var showAlert = true;
var result = {};
try
{
date_start = date_start.toString();
log+= '\n date_start: '+date_start;
date_start = date_start.replace(/\//g , "-");
date_start = date_start.replace(/\./g , "-");
log+= '\n date_start_replaced: '+date_start;
date_end = date_end.toString();
log+= '\n date_end: '+date_end;
date_end = date_end.replace(/\//g , "-");
date_end = date_end.replace(/\./g , "-");
log+= '\n date_end_replaced: '+date_end;
var param = 'compare';
var restEndPoint = "api/eneld/sca_api/compareDateInput/";
restEndPoint = restEndPoint + date_start + "/" + date_end + "/" + param;
var serverRequest = new XMLHttpRequest();
serverRequest.open("get", restEndPoint, false);
serverRequest.setRequestHeader("X-UserToken", g_ck);
serverRequest.setRequestHeader("Accept", "application/json");
serverRequest.setRequestHeader("Content-Type", "application/json");
serverRequest.send();
if (serverRequest.status === 200)
{
log+='\n response status: '+ serverRequest.status;
log+='\n response: '+ serverRequest.responseText;
var response_string = serverRequest.response;
var response_parsed = JSON.parse(response_string);
var result_boolean = response_parsed.result.value;
log+='\n Result: '+ result_boolean;
log+= '\n\nAPI REST LOG: '+ response_parsed.result.log;
if(result_boolean)
{
result["test"] = true;
result["message"] = "";
}
else
{
result["test"] = false;
result["message"] = "Date cannot be in the past";
}
log+= '\n\nAPI Call Completed';
showAlert = false;
}
else
{
log+= '\n\nAPI Call Failed';
log+= "\n status: "+ serverRequest.status;
log+= "\n statusText: "+ serverRequest.statusText;
log+= "\n responseText: "+ serverRequest.responseText;
}
}
catch(error)
{
log+= '\n FATAL ERROR: '+error;
}
console.log(log);
if(showAlert)alert(log);
return result;
},
checkDataPast_no_time: function (data )
{
var log = 'SCA Load API: SCA_ServicePortal_API.checkDataPast_no_time()';
var showAlert = true;
var result = {};
try
{
data = data.toString();
log+= '\n data: '+data;
data = data.replace(/\//g , "-");
data = data.replace(/\./g , "-");
log+= '\n data_replace: '+data;
var timezone = 'no';
var restEndPoint = "api/eneld/sca_api/compareDate/";
restEndPoint = restEndPoint + data + "/" + timezone;
var serverRequest = new XMLHttpRequest();
serverRequest.open("get", restEndPoint, false);
serverRequest.setRequestHeader("X-UserToken", g_ck);
serverRequest.setRequestHeader("Accept", "application/json");
serverRequest.setRequestHeader("Content-Type", "application/json");
serverRequest.send();
if (serverRequest.status === 200)
{
log+='\n response: '+ serverRequest.responseText;
var response_string = serverRequest.response;
var response_parsed = JSON.parse(response_string);
var result_boolean = response_parsed.result.value;
log+='\n Result: '+ result_boolean;
log+= '\n\nAPI REST LOG: '+ response_parsed.result.log;
if(result_boolean)
{
result["test"] = true;
result["message"] = "";
}
else
{
result["test"] = false;
result["message"] = "Date cannot be in the past";
}
log+= '\n\nAPI Call Completed';
showAlert = false;
}
else
{
log+= '\n\nAPI Call Failed';
log+= "\n status: "+ serverRequest.status;
log+= "\n statusText: "+ serverRequest.statusText;
log+= "\n responseText: "+ serverRequest.responseText;
}
}
catch(error)
{
log+= '\n FATAL ERROR: '+error;
}
console.log(log);
if(showAlert)alert(log);
return result;
},
checkDataPast: function (data)
{
var log = 'SCA Load API: SCA_ServicePortal_API.checkDataPast(data)';
var showAlert = true;
var result = {};
try
{
data = data.toString();
log+= '\n data: '+data;
data = data.replace(/\//g , "-");
data = data.replace(/\./g , "-");
log+= '\n data_replace: '+data;
var timezone = 'yes';
var restEndPoint = "api/eneld/sca_api/compareDate/";
restEndPoint = restEndPoint + data + "/" + timezone;
var serverRequest = new XMLHttpRequest();
serverRequest.open("get", restEndPoint, false);
serverRequest.setRequestHeader("X-UserToken", g_ck);
serverRequest.setRequestHeader("Accept", "application/json");
serverRequest.setRequestHeader("Content-Type", "application/json");
serverRequest.send();
if (serverRequest.status === 200)
{
log+='\n response status: '+ serverRequest.status;
log+='\n\n serverRequest.response: '+serverRequest.serverResponse;
log+='\n serverRequest.responseText: '+ serverRequest.responseText;
log+= '\n\n';
var response_string = serverRequest.response;
var response_parsed = JSON.parse(response_string);
var result_boolean = response_parsed.result.value;
log+='\n Result: '+ result_boolean;
log+= '\n\nAPI REST LOG: '+ response_parsed.result.log;
if(result_boolean)
{
result["test"] = true;
result["message"] = "";
}
else
{
result["test"] = false;
result["message"] = "Date cannot be in the past";
}
log+= '\n\nAPI Call Completed';
showAlert = false;
}
else
{
log+= '\n\nAPI Call FAILED';
log+= "\n status: "+ serverRequest.status;
log+= "\n statusText: "+ serverRequest.statusText;
log+= "\n responseText: "+ serverRequest.responseText;
}
}
catch(error)
{
log+= '\n FATAL ERROR: '+error;
}
console.log(log);
if(showAlert)alert(log);
return result;
},
checkDataPast_include_today: function (data)
{
var log = 'SCA Load API: SCA_ServicePortal_API.checkDataPast_include_today(data)';
var showAlert = true;
var result = {};
try
{
data = data.toString();
log+= '\n data: '+data;
data = data.replace(/\//g , "-");
data = data.replace(/\./g , "-");
log+= '\n data_replace: '+data;
var timezone = 'yes';
var restEndPoint = "api/eneld/sca_api/DateNowDiff/";
restEndPoint = restEndPoint + data + "/" + timezone;
var serverRequest = new XMLHttpRequest();
serverRequest.open("get", restEndPoint, false);
serverRequest.setRequestHeader("X-UserToken", g_ck);
serverRequest.setRequestHeader("Accept", "application/json");
serverRequest.setRequestHeader("Content-Type", "application/json");
serverRequest.send();
if (serverRequest.status === 200)
{
log+='\n response status: '+ serverRequest.status;
log+='\n\n serverRequest.response: '+serverRequest.serverResponse;
log+='\n serverRequest.responseText: '+ serverRequest.responseText;
log+= '\n\n';
var response_string = serverRequest.response;
var response_parsed = JSON.parse(response_string);
var result_diff = response_parsed.result.value;
log+='\n Result: '+ result_diff;
log+= '\n\nAPI REST LOG: '+ response_parsed.result.log;
if(parseInt(result_diff) <= 86400)
{
result["test"] = true;
result["message"] = "";
}
else
{
result["test"] = false;
result["message"] = "Date cannot be in the past";
}
log+= '\n\nAPI Call Completed';
showAlert = false;
}
else
{
log+= '\n\nAPI Call FAILED';
log+= "\n status: "+ serverRequest.status;
log+= "\n statusText: "+ serverRequest.statusText;
log+= "\n responseText: "+ serverRequest.responseText;
}
}
catch(error)
{
log+= '\n FATAL ERROR: '+error;
}
console.log(log);
if(showAlert)alert(log);
return result;
},
setValueTest: function(g_form, field, value){
g_form.setValue(field , value);
},
getValueTest: function(g_form, field){
return result = g_form.getValue(field);
},
example: function ()
{
var log = 'SCA Load API: SCA_ServicePortal_API.example()';
var showAlert = true;
var result = '';
try
{
result = 'ok';
log+= '\n SUCCESS';
showAlert = false;
}
catch(error)
{
log+= '\n FATAL ERROR: '+error;
}
console.log(log);
if(showAlert)alert(log);
return result;
},
get_variable_name_obsolete_operating_system: function (g_form)
{
var log = 'SCA Load API: SCA_ServicePortal_API.get_variable_name_obsolete_operating_system()';
var showAlert = true;
var result = '';
try
{
var var_oparting_system = '';
if(g_form.getValue('u_dco_as_cloud_kindofsystem')) var_oparting_system = 'u_dco_as_cloud_kindofsystem';
else if(g_form.getValue('u_sca_os_version') ) var_oparting_system = 'u_sca_os_version';
else if(g_form.getValue('u_sca_os_type') ) var_oparting_system = 'u_sca_os_type';
else if(g_form.getValue('u_sca_os')) var_oparting_system = 'u_sca_os';
else if(g_form.getValue('u_sca_operating_system') ) var_oparting_system = 'u_sca_operating_system';
else if(g_form.getValue('u_sca_oracle_operating_system') ) var_oparting_system = 'u_sca_oracle_operating_system';
else if(g_form.getValue('u_sca_tibco_version') ) var_oparting_system = 'u_sca_tibco_version';
else if(g_form.getValue('u_sca_apache_version') ) var_oparting_system = 'u_sca_apache_version';
else if(g_form.getValue('u_sca_application_server_type') ) var_oparting_system = 'u_sca_application_server_type';
else if(g_form.getValue('u_sca_connect_direct_version') ) var_oparting_system = 'u_sca_connect_direct_version';
else if(g_form.getValue('u_sca_database_engine') ) var_oparting_system = 'u_sca_database_engine';
else if(g_form.getValue('u_sca_database_type') ) var_oparting_system = 'u_sca_database_type';
else if(g_form.getValue('u_sca_db_type') ) var_oparting_system = 'u_sca_db_type';
else if(g_form.getValue('u_sca_oracle_version') ) var_oparting_system = 'u_sca_oracle_version';
result = 'ok';
log+= '\n SUCCESS';
showAlert = false;
}
catch(error)
{
log+= '\n FATAL ERROR: '+error;
}
console.log(log);
if(showAlert)alert(log);
return var_oparting_system;
},
checkLinuxSystemPathShrink: function (path)
{
var log = 'SCA Load API: SCA_ServicePortal_API.checkLinuxSystemPathShrink()';
var showAlert = true;
var result = {};
var regex_path = /^\/(bin|system|opt|etc|Prodotti\/Control-M|Prodotti\/WebCCS|Prodotti\/Netbackup_Client|tmp|Prodotti\/patrol|Prodotti\/ConnectD|home|sap|root|usr|usr\/lib|dev|var|lib|lib64|proc|sys|boot|((oracle|postgres|mysql|dev)(\/.*|)))$/;
try
{
if( regex_path.test(path) ) {
result["test"] = false;
result["message"] = "Path must be different from: /bin; /system; /home; /sap; /root; /usr; /usr/lib; /dev; /var; /lib; /lib64; /proc; /sys; /boot; /opt; /etc; /Prodotti/Control-M; /Prodotti/WebCCS; /Prodotti/Netbackup_Client; /tmp; /Prodotti/patrol; /Prodotti/ConnectD";
} else {
result["test"] = true;
result["message"] = "";
}
log+= '\n SUCCESS';
showAlert = false;
}
catch(error)
{
log+= '\n FATAL ERROR: '+error;
}
console.log(log);
if(showAlert)alert(log);
return result;
},
checkUser:function(user){
var log = 'SCA Load API: SCA_ServicePortal_API.checkUser()';
var showAlert = true;
var result = {};
var regex_user = /^(root|bin|daemon|lp|mail|games|wwwrun|ftp|nobody|man|news|uucp|messagebus|polkituser|haldaemon|mysql|uuidd|at|postfix|sshd|puppet|ntp|suse-ncc|ec2-use|enel|patrol|ccsadm|bea|we2beatwf|CtrlM|ctmagent)$/;
try
{
if( regex_user.test(user) ) {
result["test"] = false;
result["message"] = "User must be different from: root; bin; daemon; lp; mail; games; wwwrun; ftp; nobody; man; news; uucp; messagebus; polkituser; haldaemon; mysql; uuidd; at; postfix; sshd; puppet; ntp; suse-ncc; ec2-use; enel; patrol; ccsadm; bea; we2beatwf; CtrlM; ctmagent";
} else {
result["test"] = true;
result["message"] = "";
}
log+= '\n SUCCESS';
showAlert = false;
}
catch(error)
{
log+= '\n FATAL ERROR: '+error;
}
console.log(log);
if(showAlert)alert(log);
return result;
},
checkGroup : function (group) {
var log = 'SCA Load API: SCA_ServicePortal_API.checkGroup()';
var showAlert = true;
var result = {};
var regex_group = /^(root|bin|daemon|sys|tty|disk|lp|www|kmem|wheel|mail|news|uucp|shadow|dialout|audio|floppy|cdrom|console|utmp|public|video|games|xok|trusted|modem|ftp|man|users|nobody|nogroup|tape|messagebus|polkituser|haldaemon|mysql|uuidd|at|postfix|maildrop|sshd|puppet|ntp|suse-ncc|ccsgrp|controlm|dba|bea|CtrlM)$/;
try
{
if( regex_group.test(group) ) {
result["test"] = false;
result["message"] = "Group must be different from: ; root; bin; daemon; sys; tty; disk; lp; www; kmem; wheel; mail; news; uucp; shadow; dialout; audio; floppy; cdrom; console; utmp; public; video; games; xok; trusted; modem; ftp; man; users; nobody; nogroup; tape; messagebus; polkituser; haldaemon; mysql; uuidd; at; postfix; maildrop; sshd; puppet; ntp; suse-ncc; ccsgrp; controlm; dba; bea; CtrlM";
} else {
result["test"] = true;
result["message"] = "ciao";
}
log+= '\n SUCCESS';
showAlert = false;
}
catch(error)
{
log+= '\n FATAL ERROR: '+error;
}
console.log(log);
if(showAlert)alert(log);
return result;
},
checkIsMemberOf: function(group_sysid, user_sysid)
{
var log = 'SCA_ServicePortal_API.checkIsMemberOf(' +group_sysid+ ' , ' +user_sysid+ ')';
var showAlert = true;
var result_boolean;
try
{
var restEndPoint = "api/eneld/sca_api/checkIsMemberOf/";
restEndPoint = restEndPoint + group_sysid + "/" + user_sysid;
var serverRequest = new XMLHttpRequest();
serverRequest.open("get", restEndPoint, false);
serverRequest.setRequestHeader("X-UserToken", g_ck);
serverRequest.setRequestHeader("Accept", "application/json");
serverRequest.setRequestHeader("Content-Type", "application/json");
serverRequest.send();
if (serverRequest.status === 200)
{
log+='\n response: '+ serverRequest.responseText;
var response_string = serverRequest.response;
var response_parsed = JSON.parse(response_string);
result_boolean = response_parsed.result;
log+= '\n SUCCESS';
showAlert = false;
}
else
{
log+= '\n FAILURE';
log+= "\n status: "+ serverRequest.status;
log+= "\n statusText: "+ serverRequest.statusText;
log+= "\n responseText: "+ serverRequest.responseText;
}
}
catch(error)
{
log+= '\n FATAL ERROR: '+error;
}
console.log(log);
if(showAlert)alert(log);
return result_boolean;
},
getValueV2: function(variable_name)
{
var log = 'SCA Load API: SCA_ServicePortal_API.getValueV2()';
var showAlert = true;
var result = '';
try
{
var log = 'SCA_ServicePortal_API.getValueV2 <br>';
var restEndPoint = "api/eneld/sca_api/getValueV2/";
restEndPoint = restEndPoint + variable_name;
var serverRequest = new XMLHttpRequest();
serverRequest.open("get", restEndPoint, false);
serverRequest.setRequestHeader("X-UserToken", g_ck);
serverRequest.setRequestHeader("Accept", "application/json");
serverRequest.setRequestHeader("Content-Type", "application/json");
serverRequest.send();
if (serverRequest.status === 200)
{
log+='\n response: '+ serverRequest.responseText;
var response_string = serverRequest.response;alert(response_string);
var response_parsed = JSON.parse(response_string);
result = response_parsed.result;
log+= '\n SUCCESS';
showAlert = false;
}
else
{
log+= '\n FAILURE';
log+= "\n status: "+ serverRequest.status;
log+= "\n statusText: "+ serverRequest.statusText;
log+= "\n responseText: "+ serverRequest.responseText;
}
}
catch(error)
{
log+= '\n FATAL ERROR: '+error;
}
console.log(log);
if(showAlert)alert(log);
return result;
},
networkDomain: function (domain)
{
var log = 'SCA Load API: SCA_ServicePortal_API.networkDomain()';
var showAlert = true;
var result = {};
var regex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}$/;
try
{
if( regex.test(domain) )
{
result["test"] = true;
result["message"] = "";
}
else
{
result["test"] = false;
result["message"] = "You must insert a valid Domain value";
}
log+= '\n SUCCESS';
showAlert = false;
}
catch(error)
{
result["test"] = false;
result["message"] = error;
log+= '\n FATAL ERROR: '+error;
alert('SCA_ServicePortal_API.networkDomain <br>'+error);
}
console.log(log);
return result;
},
checkEmail: function (mail)
{
var result = {};
var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
try
{
if( regex.test(mail) ) {
result["test"] = true;
result["message"] = "";
} else {
result["test"] = false;
result["message"] = "You must insert a valid mail address";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkEmail() --> SUCCESS');
}
catch(error_checkEmail)
{
result["test"] = false;
result["message"] =error_checkEmail;
console.log('SCA Load API: SCA_ServicePortal_API.checkEmail() --> FATAL ERROR: '+error_checkEmail);
}
return result;
},
checkMacAddress: function (mac)
{
var result = {};
var regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
try
{
if( regex.test(mac) ) {
result["test"] = true;
result["message"] = "";
} else {
result["test"] = false;
result["message"] = "You must insert a valid MAC Address";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkMacAddress() --> SUCCESS');
}
catch(error_checkMacAddress)
{
result["test"] = false;
result["message"] = error_checkMacAddress;
console.log('SCA Load API: SCA_ServicePortal_API.checkMacAddress() --> FATAL ERROR: '+error_checkMacAddress);
}
return result;
},
checkPortNumber: function (port)
{
var result = {};
try
{
if (!isNaN(port)) {
var patt = new RegExp(/\./);
if(!patt.test(port))
{
if ( port < 1 || port > 65535) {
result["test"] = false;
result["message"] = "Port Value must be a number between 1 and 65535";
} else {
result["test"] = true;
result["message"] = "";
}
} else {
result["test"] = false;
result["message"] = "Port Value must be an Integer";
}
} else {
result["test"] = false;
result["message"] = "Port Value must be a number";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkPortNumber() --> SUCCESS');
}
catch(error_checkPortNumber)
{
result["test"] = false;
result["message"] =error_checkPortNumber;
console.log('SCA Load API: SCA_ServicePortal_API.checkPortNumber() --> FATAL ERROR: '+error_checkPortNumber);
}
return result;
},
checkInteger: function (value)
{
var result = {};
try
{
if ( !isNaN(value) ) {
var patt = new RegExp(/\./);
if( patt.test(value) || value.match(' ') ) {
result["test"] = false;
result["message"] = "Value must be an Integer";
} else {
result["test"] = true;
result["message"] = "";
}
} else {
result["test"] = false;
result["message"] = "Value must be a number";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkInteger() --> SUCCESS');
}
catch(error_checkInteger)
{
result["test"] = false;
result["message"] =error_checkInteger;
console.log('SCA Load API: SCA_ServicePortal_API.checkInteger() --> FATAL ERROR: '+error_checkInteger);
}
return result;
},
checkDecimal: function (value)
{
var result = {};
try
{
if ( !isNaN(value) )
{
result["test"] = true;
result["message"] = "";
}
else
{
result["test"] = false;
result["message"] = "Value must be a number";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkDecimal() --> SUCCESS');
}
catch(error_checkDecimal)
{
result["test"] = false;
result["message"] =error_checkDecimal;
console.log('SCA Load API: SCA_ServicePortal_API.checkDecimal() --> FATAL ERROR: '+error_checkDecimal);
}
return result;
},
checkURL: function (url)
{
var result = {};
var regex = /[^+.%_a-zA-Z0-9\x2f-]/g;
var check_url = true;
try
{
if(url[0]!='/')
check_url = false;
if (url.length<2)
check_url = false;
for(var i = 0; i<url.length; i++) {
var match = url[i].match(regex);
if(match) {
check_url = false;
}
}
if(!check_url) {
result["test"] = false;
result["message"] = "Invalid URL";
} else {
result["test"] = true;
result["message"] = "";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkURL() --> SUCCESS');
}
catch(error_checkURL)
{
result["test"] = false;
result["message"] = error_checkURL;
console.log('SCA Load API: SCA_ServicePortal_API.checkURL() --> FATAL ERROR: '+error_checkURL);
}
return result;
},
checkPattern: function (pattern)
{
var result = {};
var regex = /[^.$_&\*\?\/+a-zA-Z1-9]/g;
var check_pattern = true;
try
{
for(var i = 0; i<pattern.length; i++) {
var match = pattern[i].match(regex);
if(match) {
check_pattern = false;
}
}
if(!check_pattern) {
result["test"] = false;
result["message"] = "Invalid Pattern";
} else {
result["test"] = true;
result["message"] = "";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkPattern() --> SUCCESS');
}
catch(error_checkPattern)
{
result["test"] = false;
result["message"] = error_checkPattern;
console.log('SCA Load API: SCA_ServicePortal_API.checkPattern() --> FATAL ERROR: '+error_checkPattern);
}
return result;
},
checkDiskSize: function (size, min, max, multiple)
{
var result = {};
try
{
console.log("Lib SCA Check Disk Size. Function checkDiskSize. Controllo: Numero");
if (!isNaN(size)) {
var patt = new RegExp(/\./);
console.log("Lib SCA Check Disk Size. Function checkDiskSize. Controllo: Intero");
if(!patt.test(size)) {
size = parseInt(size);
console.log("Lib SCA Check Disk Size. Function checkDiskSize. Ricerca controllo da effettuare");
if ( min != "" && max != "") {
min = parseInt(min);
max = parseInt(max);
if ( size < min || size > max) {
console.log("Lib SCA Check Disk Size. Function checkDiskSize. Controllo: Minimo e Massimo");
result["test"] = false;
result["message"] = "Value must be between " + min + " and " + max;
} else {
if(multiple != undefined && multiple != "") {
console.log("Lib SCA Check Disk Size. Function checkDiskSize. Controllo: Multiplo");
if(size % multiple != 0) {
result["test"] = false;
result["message"] = "Value must be a multiple of " + multiple;
} else {
result["test"] = true;
result["message"] = "";
}
} else {
result["test"] = true;
result["message"] = "";
}
}
} else if ( min != "" && max == "") {
min = parseInt(min);
console.log("Lib SCA Check Disk Size. Function checkDiskSize. Controllo: Solo Minimo");
if ( size < min ) {
result["test"] = false;
result["message"] = "Value must be greater or equal than " + min;
} else {
result["test"] = true;
result["message"] = "";
}
} else if ( min == "" && max != "") {
max = parseInt(max);
console.log("Lib SCA Check Disk Size. Function checkDiskSize. Controllo: Solo Massimo");
if ( size > max ) {
result["test"] = false;
result["message"] = "Value must be lesser or equal than " + max;
} else {
result["test"] = true;
result["message"] = "";
}
}
console.log("Lib SCA Check Disk Size. Function checkDiskSize. Risultati if. Check min,max: " + ( min != "" && max != "") );
console.log("Check Multiplo: " + (multiple != undefined && multiple != "") );
console.log("Check solo minimo: " + ( min != "" && max == "") );
console.log("Check solo massimo: " + ( min == "" && max != "") );
} else {
result["test"] = false;
result["message"] = "Value must be an Integer";
}
} else {
result["test"] = false;
result["message"] = "Value must be a number";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkDiskSize() --> SUCCESS');
}
catch(error_checkDiskSize)
{
result["test"] = false;
result["message"] =error_checkDiskSize;
console.log('SCA Load API: SCA_ServicePortal_API.checkDiskSize() --> FATAL ERROR: '+error_checkDiskSize);
}
return result;
},
checkShareNameCIFS: function (share_name)
{
var result = {};
var regex = /^[\w\-\$]+$/;
try
{
if( regex.test(share_name) ) {
result["test"] = true;
result["message"] = "";
} else {
result["test"] = false;
result["message"] = "CIFS Share Name must contain only alphanumeric, underscore(_), hyphen(-) and dollar sign ($) characters";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkShareNameCIFS() --> SUCCESS');
}
catch(error_checkShareNameCIFS)
{
result["test"] = false;
result["message"] =error_checkShareNameCIFS;
console.log('SCA Load API: SCA_ServicePortal_API.checkShareNameCIFS() --> FATAL ERROR: '+error_checkShareNameCIFS);
}
return result;
},
checkMountPointWindows: function (path)
{
var result = {};
var regex = /^[a-z]{1}:$/i;
var pattern = new RegExp(regex);
try
{
if( pattern.test(path) ) {
result["test"] = true;
result["message"] = "";
} else {
result["test"] = false;
result["message"] = "Windows Mount Point must be a letter followed by :";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkMountPointWindows() --> SUCCESS');
}
catch(error_checkMountPointWindows)
{
result["test"] = false;
result["message"] =error_checkMountPointWindows;
console.log('SCA Load API: SCA_ServicePortal_API.checkMountPointWindows() --> FATAL ERROR: '+error_checkMountPointWindows);
}
return result;
},
checkMountPointLinux: function (path)
{
var result = {};
var regex = /^\/dev\/sd[a-z]{1}$/;
var patt = new RegExp(regex);
try
{
if( patt.test(path) ) {
result["test"] = true;
result["message"] = "";
} else {
result["test"] = false;
result["message"] = "Linux Mount Point must be /dev/sdX where X is a letter";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkMountPointLinux() --> SUCCESS');
}
catch(error_checkMountPointLinux){
result["test"] = false;
result["message"] =error_checkMountPointLinux;
console.log('SCA Load API: SCA_ServicePortal_API.checkMountPointLinux() --> FATAL ERROR: '+error_checkMountPointLinux);
}
return result;
},
checkPathLinux: function (path)
{
var result = {};
var regex = /^(\/[^\/]*)+\/?$/;
var patt = new RegExp(regex);
try
{
if( patt.test(path) ) {
result["test"] = true;
result["message"] = "";
} else {
result["test"] = false;
result["message"] = "Invalid Linux Path: " + path;
}
console.log('SCA Load API: SCA_ServicePortal_API.chekPathLinux() --> SUCCESS');
}
catch(error_chekPathLinux)
{
result["test"] = false;
result["message"] =error_chekPathLinux;
console.log('SCA Load API: SCA_ServicePortal_API.chekPathLinux() --> FATAL ERROR: '+error_chekPathLinux);
}
return result;
},
checkLinuxLocalUser: function (user)
{
var result = {};
var regex = /^\w+$/;
var patt = new RegExp(regex);
try
{
if( patt.test(user) ) {
result["test"] = true;
result["message"] = "";
} else {
result["test"] = false;
result["message"] = "Invalid Local User Linux/Unix: " + user;
}
console.log('SCA Load API: SCA_ServicePortal_API.checkLinuxLocalUser() --> SUCCESS');
}
catch(error_checkLinuxLocalUser)
{
result["test"] = false;
result["message"] = error_checkLinuxLocalUser;
console.log('SCA Load API: SCA_ServicePortal_API.checkLinuxLocalUser() --> FATAL ERROR: '+error_checkLinuxLocalUser);
}
return result;
},
checkLinuxSystemUser: function (user)
{
var result = {};
var regex_user = /^(root|bin|daemon|lp|mail|games|wwwrun|ftp|nobody|man|news|uucp|messagebus|polkituser|haldaemon|mysql|uuidd|at|postfix|sshd|puppet|ntp|suse-ncc|ec2-use|enel|patrol|ccsadm|bea|we2beatwf|CtrlM|ctmagent)$/;
try
{
if( regex_user.test(user) ) {
result["test"] = false;
result["message"] = "User must be different from: root; bin; daemon; lp; mail; games; wwwrun; ftp; nobody; man; news; uucp; messagebus; polkituser; haldaemon; mysql; uuidd; at; postfix; sshd; puppet; ntp; suse-ncc; ec2-use; enel; patrol; ccsadm; bea; we2beatwf; CtrlM; ctmagent";
} else {
result["test"] = true;
result["message"] = "";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkLinuxSystemUser() --> SUCCESS');
}
catch(error_checkLinuxSystemUser)
{
console.log('SCA Load API: SCA_ServicePortal_API.checkLinuxSystemUser() --> FATAL ERROR: '+error_checkLinuxSystemUser);
}
return result;
},
checkLinuxSystemPath_pgsql: function (path)
{
var result = {};
var regex_path = /^\/(bin|system|oradata|oraarchive|orabase|opt|etc|Prodotti\/Control-M|dev\/mapper|dev|Prodotti\/WebCCS|Prodotti\/Netbackup_Client|Prodotti\/TSCO|tmp|Prodotti\/patrol|Prodotti\/ConnectD|tibco\/install|tibco\/home|etc\/passwd|tibco\/EMS|home|sap|root|usr|usr\/lib|var|lib|lib64|proc|sys|boot|((oracle|postgres|mysql)(\/.*|)))$/;
try
{
if( regex_path.test(path) ) {
result["test"] = false;
result["message"] = "Path must be different from: /bin; /system; /home; /sap; /root; /usr; /usr/lib; /dev/mapper;/dev; /var; /lib; /lib64; /proc; /sys; /boot; /opt; /etc;/etc/passwd; /Prodotti/Control-M; /Prodotti/WebCCS; /Prodotti/Netbackup_Client; /tmp; /Prodotti/patrol; /Prodotti/ConnectD; /tibco/install; /tibco/home; /tibco/EMS; /oracle (and its subpath); /system; /oradata; /oraarchive; /orabase; /postgres (and its subpath);/mysql (and its subpath)";
} else {
result["test"] = true;
result["message"] = "";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkLinuxSystemPath_pgsql() --> SUCCESS');
}
catch(error_checkLinuxSystemPath_pgsql)
{
console.log('SCA Load API: SCA_ServicePortal_API.checkLinuxSystemPath_pgsql() --> FATAL ERROR: '+error_checkLinuxSystemPath_pgsql);
}
return result;
},
checkLinuxSystemPath: function (path)
{
var result = {};
var regex_path = /^\/(bin|system|oradata|oraarchive|orabase|opt|etc|Prodotti\/Control-M|dev\/mapper|dev|Prodotti\/WebCCS|Prodotti\/Netbackup_Client|Prodotti\/TSCO|tmp|Prodotti\/patrol|Prodotti\/ConnectD|tibco\/install|tibco\/home|etc\/passwd|tibco\/EMS|home|sap|root|usr|usr\/lib|var|lib|lib64|proc|sys|boot|((oracle|postgres|mysql|pgsql)(\/.*|)))$/;
try
{
if( regex_path.test(path) ) {
result["test"] = false;
result["message"] = "Path must be different from: /bin; /system; /home; /sap; /root; /usr; /usr/lib; /dev/mapper;/dev; /var; /lib; /lib64; /proc; /sys; /boot; /opt; /etc;/etc/passwd; /Prodotti/Control-M; /Prodotti/WebCCS; /Prodotti/Netbackup_Client; /tmp; /Prodotti/patrol; /Prodotti/ConnectD; /tibco/install; /tibco/home; /tibco/EMS; /oracle (and its subpath); /system; /oradata; /oraarchive; /orabase; /postgres (and its subpath);/pgsql(and its subpath);/mysql (and its subpath)";
} else {
result["test"] = true;
result["message"] = "";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkLinuxSystemPath() --> SUCCESS');
}
catch(error_checkLinuxSystemPath)
{
console.log('SCA Load API: SCA_ServicePortal_API.checkLinuxSystemPath() --> FATAL ERROR: '+error_checkLinuxSystemPath);
}
return result;
},
checkSID: function (value)
{
var regex = /^[0-9A-Z_]+$/i;
var result = {};
try
{
if(regex.test(value)) {
result["test"] = true;
result["message"] = "";
} else {
result["test"] = false;
result["message"] = "SID name must be contain only alphanumeric and underscore(_) characters. " + value + " is not valid";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkSID() --> SUCCESS');
}
catch(error_checkSID)
{
result["test"] = false;
result["message"] =error_checkSID
console.log('SCA Load API: SCA_ServicePortal_API.checkSID() --> FATAL ERROR: '+error_checkSID);
}
return result;
},
checkUsername: function (g_form,value, db_type)
{
var regex, err_message;
var result = {};
db_type = db_type.replace(/ /g, "");
db_type = db_type.toLowerCase();
var user_list = /^(ANONYMOUS|APPQOSSYS|AUDSYS|CTXSYS|DBSNMP|DCA-MI|DCA-NA|DCA-RM|DG_TRANSPORT_USER|DIP|ENEL_UTILITIES|GSMADMIN_INTERNAL|GSMCATUSER|GSMUSER|MDSYS|OJVMSYS|ORACLE_OCM|ORDDATA|ORDPLUGINS|ORDSYS|OUTLN|SI_INFORMTN_SCHEMA|SYS|SYSBACKUP|SYSDG|SYSKM|SYSTEM|WMSYS|XDB|XS\$NULL)$/i;
var login_tipology = g_form.getValue('u_sca_login_tipology').toString().toLowerCase();
try
{
if( db_type == "sqlserver" ) {
regex = /^[A-Z0-9_\\-]+$/i;
err_message = "Username must be contain only alphanumeric, underscore(_), backslash(\) and dash(-) characters";
} else {
regex = /^[A-Z0-9_]+$/i;
err_message = "Username must be contain only alphanumeric and underscore(_) characters";
}
if( db_type == "sqlserver" && login_tipology=='windows_authentication') {
regex = /^[A-Z0-9_\\-]+$/i;
err_message = "Username must be contain only alphanumeric, underscore(_), backslash(\) and dash(-) characters";
}
if( db_type == "sqlserver" && login_tipology=='sql_server_login') {
regex = /^[A-Z0-9_-]+$/i;
err_message = "Username must be contain only alphanumeric, underscore(_), and dash(-) characters";
}
if(!user_list.test(value)) {
if(regex.test(value)) {
result["test"] = true;
result["message"] = "";
} else {
result["test"] = false;
result["message"] = err_message + ". " + value + " is not valid";
}
} else {
result["test"] = false;
result["message"] = "These users are not allowed: ANONYMOUS; APPQOSSYS; AUDSYS; CTXSYS; DBSNMP; DCA-MI; DCA-NA; DCA-RM; DG_TRANSPORT_USER; DIP; ENEL_UTILITIES; GSMADMIN_INTERNAL; GSMCATUSER; GSMUSER; MDSYS; OJVMSYS; ORACLE_OCM; ORDDATA; ORDPLUGINS; ORDSYS; OUTLN; SI_INFORMTN_SCHEMA; SYS; SYSBACKUP; SYSDG; SYSKM; SYSTEM; WMSYS; XDB; XS$NULL.";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkUsername() --> SUCCESS');
}
catch(error_checkUsername)
{
console.log('SCA Load API: SCA_ServicePortal_API.checkUsername() --> FATAL ERROR: '+error_checkUsername);
}
return result;
},
checkDbName: function (value)
{
var regex = /^[0-9A-Z_]+$/i;
var result = {};
try
{
if(regex.test(value)) {
result["test"] = true;
result["message"] = "";
} else {
result["test"] = false;
result["message"] = "Database name must be contain only alphanumeric and underscore(_) characters. " + value + " is not valid";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkDbName() --> SUCCESS');
}
catch(error_checkDbName)
{
result["test"] = false;
result["message"] = error_checkDbName
console.log('SCA Load API: SCA_ServicePortal_API.checkDbName() --> FATAL ERROR: '+error_checkDbName);
}
return result;
},
checkIpAddress:	function (ip)
{
var result = {};
var regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
try
{
if( regex.test(ip) )
{
result["test"] = true;
result["message"] = "";
}
else
{
result["test"] = false;
result["message"] = "You must insert a valid Ip Address";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkIpAddress() --> SUCCESS');
}
catch(error_checkIpAddress)
{
result["test"] = false;
result["message"] = error_checkIpAddress;
console.log('SCA Load API: SCA_ServicePortal_API.checkIpAddress() --> FATAL ERROR: '+error_checkIpAddress);
}
return result;
},
checkIpWithSubnet:	function (ip)
{
var result = {};
var regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/[1-9]{1,2}$/;
try
{
if( regex.test(ip) )
{
result["test"] = true;
result["message"] = "";
}
else
{
result["test"] = false;
result["message"] = "You must insert a valid Ip Address with subnet (i.e. 172.20.166.0/28)";
}
console.log('SCA Load API: SCA_ServicePortal_API.checkIpWithSubnet() --> SUCCESS');
}
catch(error_checkIpWithSubnet)
{
result["test"] = false;
result["message"] = error_checkIpWithSubnet;
console.log('SCA Load API: SCA_ServicePortal_API.checkIpWithSubnet() --> FATAL ERROR: '+error_checkIpWithSubnet);
}
return result;
},
getAttachmentCount: function()
{
var length;
try
{
length = angular.element("#sc_cat_item").scope().attachments.length;
}
catch(e)
{
length = -1;
}
return length;
},
getAttachmentInfo: function()
{
var log = 'SCA Load API: SCA_ServicePortal_API.getAttachmentInfo()';
try
{
var result = {};
var obj = {};
var array_obj_result = [];
try
{
var attachment_count = 0;
var attachment_name_list = '';
var attachment_name_array = [];
var record_sysid = '';
if( gel('sysparm_cart_edit') || gel('sysparm_cart_edit') != undefined )
record_sysid = gel('sysparm_cart_edit').value;
else if( gel('sysparm_item_guid') || gel('sysparm_item_guid') != undefined )
record_sysid = gel('sysparm_item_guid').value;
var gr_attachment = new GlideRecord('sys_attachment');
gr_attachment.addQuery('table_sys_id',record_sysid);
gr_attachment.query();
while(gr_attachment.next())
{
var file_name = gr_attachment.file_name.toString();
var ext = file_name.split('.');
ext = ext[parseInt(ext.length)-1];
obj = {};
obj['file_name'] = file_name;
obj['ext'] = ext;
obj['sys_id'] = gr_attachment.sys_id;
obj['size'] = 'null';
array_obj_result.push(obj);
}
log+= '\n Script per il Desktop';
}
catch(e1)
{
var attachmentElements = angular.element("#sc_cat_item").scope().attachments;
var count = angular.element("#sc_cat_item").scope().attachments.length;
var catalogAttachments = [];
for (var index_attach = 0; index_attach < attachmentElements.length; index_attach++)
{
obj = {};
obj['file_name'] = attachmentElements[index_attach].file_name.toString();
obj['ext'] = attachmentElements[index_attach].ext.toString();
obj['sys_id'] = attachmentElements[index_attach].sys_id.toString();
obj['size'] = attachmentElements[index_attach].size.toString();
array_obj_result.push(obj);
}
log+= '\n Script per il Portale';
log+= '\n Attachment count: '+count;
log+= '\n AttachmentElements: '+count;
}
result['attachment'] = array_obj_result;
var string_obj = JSON.stringify(result, null, "\t");
log+= '\n Result:\n'+string_obj;
}
catch(e2)
{
log+= '\n FATAL ERROR: '+e2;
}
console.log(log);
return array_obj_result;
},
getAttachmentNameArray: function()
{
var attachmentElements = angular.element("#sc_cat_item").scope().attachments;
var catalogAttachments = [];
var array_result = [];
for (var index_attach = 0; index_attach < attachmentElements.length; index_attach++)
{
array_result.push(attachmentElements[index_attach].file_name.toString());
}
return array_result;
},
};
/*! RESOURCE: ConnectionUtils */
var ConnectionUtils = {
getSysConnection: function() {
var connGR = new GlideRecord("sys_connection");
connGR.addQuery('active', true);
connGR.addQuery("connection_alias", g_form.getValue("connection_alias"));
connGR.addQuery("sys_domain", g_form.getValue("sys_domain"));
connGR.addQuery("sys_id", "!=", g_form.getUniqueValue());
connGR.query();
return connGR;
},
doConnection: function(verb) {
if (g_form.getValue("active") == "false") {
gsftSubmit(null, g_form.getFormElement(), verb);
}
var connGR;
var performOverride = function() {
connGR.active = false;
connGR.update();
gsftSubmit(null, g_form.getFormElement(), verb);
};
var grConnAlias = new GlideRecord("sys_alias");
if (grConnAlias.get(g_form.getValue("connection_alias"))) {
if (grConnAlias.multiple_connections == 'true') {
gsftSubmit(null, g_form.getFormElement(), verb);
} else {
connGR = this.getSysConnection();
if (connGR.next()) {
var currName = g_form.getValue("name");
if (connGR.name.toUpperCase() == currName.toUpperCase()) {
var uniqueErrMsg = new GwtMessage().getMessage("A connection with {0} name already exists, duplicate connection names are not allowed", currName);
g_form.addErrorMessage(uniqueErrMsg);
return false;
}
var title = new GwtMessage().getMessage("Confirm inactivation");
var question = new GwtMessage().getMessage("You already have a {0} connection active, {1}.<br/>By making this one active, {2} will become inactive. <br/>Are you sure you want to make {3} the active connection?", connGR.protocol, connGR.name, connGR.name, currName);
this.confirmOverride(title, question, performOverride);
} else {
gsftSubmit(null, g_form.getFormElement(), verb);
}
}
}
},
confirmOverride: function(title, question, onPromptComplete) {
var dialogClass = (window.GlideModal) ? GlideModal : GlideDialogWindow;
var dialog = new GlideDialogWindow('glide_confirm_basic');
dialog.setTitle(title);
dialog.setSize(400, 325);
dialog.setPreference('title', question);
dialog.setPreference('onPromptComplete', onPromptComplete);
dialog.render();
},
};
/*! RESOURCE: RiskRankCalculatorUtil */
var RiskRankCalculatorUtil = Class.create();
RiskRankCalculatorUtil.prototype = {
initialize: function(g_form) {
this.g_form = g_form;
},
setRiskRank: function() {
var ajax = new GlideAjax('AjaxRiskUtil');
ajax.addParam("sysparm_impact", g_form.getValue('impact'));
ajax.addParam("sysparm_probability", g_form.getValue('probability'));
ajax.addParam("sysparm_name", 'getRiskRankDetails');
ajax.addParam("sysparm_risk_id", g_form.getUniqueValue());
ajax.getXML(function(response) {
var result = response.responseXML.getElementsByTagName("result");
result = result[0];
g_form.setValue('risk_rank', result.getAttribute('rank'));
g_form.setValue('risk_value', result.getAttribute('value'));
g_form.getControl('risk_rank').setStyle('background-color:'+ result.getAttribute('color')) ;
});
},
type: 'RiskRankCalculatorUtil'
};
/*! RESOURCE: PpmIntGroupSprintCreationHandler */
var PpmIntGroupSprintCreationHandler = Class.create({
initialize: function (gr) {
this._gr = gr;
this._isList = (gr.type+""=="GlideList2")||(gr.type+""=="GlideList3");
this._sysId = this._isList ? this._gr.getChecked() : this._gr.getUniqueValue();
this._tableName = this._gr.getTableName();
this._prmErr = [];
},
showLoadingDialog: function() {
this.loadingDialog = new GlideDialogWindow("dialog_loading", true, 300);
this.loadingDialog.setPreference('table', 'loading');
this.loadingDialog.render();
},
hideLoadingDialog: function() {
this.loadingDialog && this.loadingDialog.destroy();
},
showDialog: function () {
if(this._tableName=='m2m_release_group')
this.getGroupFromReleaseGroup(this._sysId);
else
this.getDefaultDataAndShowDialog();
},
getDefaultDataAndShowDialog: function(){
if(!(this._sysId == '')){
(new GlideUI()).clearOutputMessages();
this.showLoadingDialog();
this._getDefaultData();
}else{
var span = document.createElement('span');
span.setAttribute('data-type', 'system');
span.setAttribute('data-text', getMessage('Please select a Group'));
span.setAttribute('data-duration', '4000');
span.setAttribute('data-attr-type', 'error');
var notification  = {xml: span};
GlideUI.get().fire(new GlideUINotification(notification));
}
},
getGroupFromReleaseGroup: function(releaseGroupIds){
var ga = new GlideAjax("agile2_AjaxProcessor");
ga.addParam('sysparm_name', 'getGroupsFromReleaseGroups');
ga.addParam('sysparm_releasegroups', releaseGroupIds);
ga.getXML(this._groupCallback.bind(this));
},
_groupCallback: function (response) {
var groups = response.responseXML.getElementsByTagName("group");
var groupIds = '';
var id;
for(var i = 0; i < groups.length; i++) {
id = groups[i].getAttribute("id");
if(groupIds=='')
groupIds = id;
else
groupIds = groupIds + ',' + id;
}
this._sysId = groupIds;
this.getDefaultDataAndShowDialog();
},
showMainDialog: function() {
this.hideLoadingDialog();
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
this._mstrDlg = new dialogClass("ppm_int_TeamSprintCreationPage");
var titleMsg = getMessage("Create Sprints");
this._mstrDlg.setTitle(titleMsg);
this._mstrDlg.setPreference('sprintCreationHandler', this);
this._mstrDlg.setPreference('sysparm_nostack', true);
this._mstrDlg.setPreference('sysparm_start_date', this._defaultStartDate);
this._mstrDlg.setPreference('sysparm_count', this._defaultCount);
this._mstrDlg.setPreference('sysparm_duration', this._defultDuration);
this._mstrDlg.setPreference('sysparm_name', this.defaultName);
this._mstrDlg.render();
},
onSubmit: function () {
try {
this.sprintCount = this._getValue('sprint_count');
this.startDate = this._getValue('start_date');
this.name = this._getValue('sprint_name');
this.startAt = this._getValue('sprint_start_count');
this.duration = this._getValue('sprint_duration');
if (!this._validate()) {
return false;
}
var ga = new GlideAjax("ppm_int_TeamProcessor");
ga.addParam('sysparm_name', 'createSprints');
ga.addParam('sysparm_start_date', this.startDate);
ga.addParam('sysparm_sysid', this._sysId);
ga.addParam('sysparm_count', this.sprintCount);
ga.addParam('sysparm_start_count', this.startAt);
ga.addParam('sysparm_sprint_name', this.name);
ga.addParam('sysparm_duration', this.duration);
this.showLoadingDialog();
ga.getXML(this.callback.bind(this));
} catch(err) {
this._displayErrorDialog();
console.log(err);
}
return false;
},
callback: function (response) {
this.hideLoadingDialog();
this._mstrDlg.destroy();
var resp = response.responseXML.getElementsByTagName("result");
if (resp[0] && resp[0].getAttribute("status") == "success") {
window.location.reload();
} else if (resp[0] && resp[0].getAttribute("status") == "hasOverlappingSprints") {
this._hasOverlappingSprints = true;
if(this._isList)
this._gr._refreshAjax();
}else {
this._displayErrorDialog();
}
},
_displayErrorDialog: function() {
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
this._createError = new dialogClass("ppm_int_error_dialog");
this._createError.setTitle(getMessage("Error while creating Sprints for Team."));
this._createError.render();
},
_validate: function () {
this._prmErr = [];
this.sprintCountLimit = 25;
var field = '';
this._removeAllError('ppm_int_TeamSprintCreationPage');
if (this.name == 'undefined' || this.name.trim() == "") {
this._prmErr.push(getMessage("Provide name"));
field = 'sprint_name';
}
else if (!this.startAt || isNaN(this.startAt)) {
this._prmErr.push(getMessage("Provide integer value"));
field = 'sprint_start_count';
}
else if (this.startDate == 'undefined'
|| this.startDate.trim() == ""
|| getDateFromFormat(this.startDate, g_user_date_format) == 0) {
this._prmErr.push(getMessage("Provide valid start date"));
field = 'start_date';
}
else if (!this.duration || isNaN(this.duration)) {
this._prmErr.push(getMessage("Provide integer value"));
field = 'sprint_duration';
}
else if (!this.sprintCount || isNaN(this.sprintCount)) {
this._prmErr.push(getMessage("Provide integer value"));
field = 'sprint_count';
}
else if (this.sprintCount > this.sprintCountLimit) {
this._prmErr.push(formatMessage(getMessage('The total number of sprints should not be more than {0}'), this.sprintCountLimit));
field = 'sprint_count';
}
if (this._prmErr.length > 0) {
setTimeout("var refocus = document.getElementById('" + field + "');refocus.focus();", 0);
this._showFieldError(field, this._prmErr[0]);
return false;
}
return true;
},
_getValue: function (inptNm) {
return gel(inptNm).value;
},
_getDefaultData: function () {
var ga = new GlideAjax("ppm_int_TeamProcessor");
ga.addParam('sysparm_name', 'calculateSprintDefaults');
ga.addParam('sysparm_sysid', this._sysId);
ga.getXML(this._defaultDataCallback.bind(this));
},
_defaultDataCallback: function (response) {
var resp = response.responseXML.getElementsByTagName("result");
if (resp[0]) {
this._defaultStartDate = resp[0].getAttribute("next_start_date");
this._defaultCount = resp[0].getAttribute("count");
this._defultDuration = resp[0].getAttribute("duration");
this.defaultName = resp[0].getAttribute('name');
}
this.showMainDialog();
},
_showFieldError: function(groupId,message){
var $group = $j('#'+groupId+'_group');
var $helpBlock = $group.find('.help-block');
if(!$group.hasClass('has-error'))
$group.addClass('has-error');
if($helpBlock.css('display')!="inline"){
$helpBlock.text(message);
$helpBlock.css('display','inline');
}
},
_removeAllError: function(dialogName){
$j('#'+dialogName+' .form-group.has-error').each(function(){
$j(this).removeClass('has-error');
$j(this).find('.help-block').css('display','none');
});
},
type: "PpmIntGroupSprintCreationHandler"
});
/*! RESOURCE: Matomo Backend Tracking */
(function() {
if (NOW.user.name != "guest") {
var envSn = 'https://' + window.location.hostname;
var oReq = new XMLHttpRequest();
oReq.open("GET", envSn + "/api/now/table/u_web_analytics_configuration?sysparm_query=u_active=true^u_backend_tracking=true&sysparm_fields=u_tracking_api_hostname%2Cu_site_id%2Cu_containers_list%2Cu_apm.u_gbl_apm_applicationcode", true);
oReq.setRequestHeader("X-UserToken", window.g_ck);
oReq.setRequestHeader("Accept", "application/json");
oReq.setRequestHeader("Content-Type", "application/json");
oReq.onload = function(e) {
var config = JSON.parse(oReq.response);
if (config.result.length > 0) {
loadUserInfo(config.result[0]);
} else {
console.log('Analytics not available for backend.');
}
};
oReq.onerror = function(e) {
console.error('Unable to retrieve webanalytics configuration.');
};
oReq.send();
function loadUserInfo(configInfo) {
var oReq = new XMLHttpRequest();
oReq.open("GET", envSn + "/api/now/table/sys_user?sysparm_query=sys_id=" + NOW.user.userID + "&sysparm_fields=u_gbl_super_cid", true);
oReq.setRequestHeader("X-UserToken", window.g_ck);
oReq.setRequestHeader("Accept", "application/json");
oReq.setRequestHeader("Content-Type", "application/json");
oReq.onload = function(e) {
var userInfo = JSON.parse(oReq.response);
loadScript(configInfo, userInfo.result[0]);
};
oReq.onerror = function(e) {
loadScript(configInfo);
};
oReq.send();
}
function loadScript(configInfo, userInfo) {
var _paq = window._paq = window._paq || [];
var _mtm = window._mtm = window._mtm || [];
_mtm.push({
'mtm.startTime': (new Date().getTime()),
'event': 'mtm.Start'
});
_mtm.push({
'mtm_user_id': NOW.user.userID
});
_paq.push(['setUserId', NOW.user.userID]);
if (userInfo && userInfo.u_gbl_super_cid) {
_paq.push(['setCustomVariable', '1', 'user_supercid', userInfo.u_gbl_super_cid, "visit"]);
_mtm.push({
'mtm_user_super_cid': userInfo.u_gbl_super_cid
});
}
var scope = typeof g_form !== "undefined" ? g_form.scope : '';
_paq.push(['setCustomVariable', '1', 'scope', scope, "page"]);
_paq.push(['setCustomDimension', customDimensionId = 1, customDimensionValue = scope]);
var session = typeof NOW.session_id !== "undefined" ? NOW.session_id : top.NOW.session_id;
if (typeof session !== "undefined") {
_paq.push(['setCustomVariable', '2', 'SessionID', session, "visit"]);
}
_paq.push(['setCustomVariable', '3', 'User_Name', NOW.user.name, "visit"]);
_paq.push(['alwaysUseSendBeacon']);
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
var envMatomo = '//' + configInfo.u_tracking_api_hostname;
_paq.push(['setTrackerUrl', envMatomo + '/matomo.php']);
_paq.push(['setSiteId', configInfo.u_site_id.toString()]);
var d = document,
g = d.createElement('script'),
s = d.getElementsByTagName('script')[0];
g.type = 'text/javascript';
g.async = true;
g.src = envMatomo + '/matomo.js';
s.parentNode.insertBefore(g, s);
var containers = configInfo.u_containers_list == "" ? {} : JSON.parse(configInfo.u_containers_list);
var keys = Object.keys(containers);
for (var i = 0; i < keys.length; i++) {
var g_mtm = d.createElement('script'),
s_mtm = d.getElementsByTagName('script')[0];
g_mtm.type = 'text/javascript';
g_mtm.async = true;
g_mtm.src = envMatomo + '/js/container_' + containers[keys[i]] + '.js';
s_mtm.parentNode.insertBefore(g_mtm, s_mtm);
}
})();
}
}
})();
/*! RESOURCE: PlannedTaskDateUtil */
var PlannedTaskDateUtil = Class.create();
PlannedTaskDateUtil.prototype = {
initialize: function(g_form, g_scratchpad) {
this.g_form = g_form;
this.g_scratchpad = g_scratchpad;
var tableName = g_form.getTableName();
this.dayField = "ni." + tableName + ".durationdur_day";
this.hourField = "ni." + tableName + ".durationdur_hour";
this.minuteField = "ni." + tableName + ".durationdur_min";
this.secondField = "ni." + tableName + ".durationdur_sec";
this.tableName = tableName;
},
_showErrorMessage: function(column, message) {
if (!message && !column) {
try {
this._gForm.showFieldMsg(column, message, 'error');
} catch(e) {}
}
},
setEndDate: function(answer) {
this.g_scratchpad.flag = true;
this.g_form.setValue('end_date', answer);
},
setDuration: function(answer) {
this.g_scratchpad.flag = true;
this.g_form.setValue('duration', answer);
},
getStartDate: function() {
return this.g_form.getValue('start_date');
},
getDays: function() {
var days = this.g_form.getValue(this.dayField);
return this._getIntValue(days);
},
getHours: function() {
var hours = this.g_form.getValue(this.hourField);
return this._getIntValue(hours);
},
getMinutes: function() {
var minutes = this.g_form.getValue(this.minuteField);
return this._getIntValue(minutes);
},
getSeconds: function() {
var seconds = this.g_form.getValue(this.secondField);
return this._getIntValue(seconds);
},
_getIntValue: function(value) {
var intValue = 0;
if (value && !isNaN(value))
intValue = parseInt(value);
return intValue;
},
setDurationHoursAndDays: function() {
var g_form = this.g_form;
var days = this.getDays();
var hours = this.getHours();
var minutes = this.getMinutes();
var seconds = this.getSeconds();
this.g_scratchpad.flag = false;
if (seconds >= 60) {
minutes += Math.floor(seconds / 60);
seconds = seconds % 60;
}
if (minutes >= 60) {
hours += Math.floor(minutes / 60);
minutes = minutes % 60;
}
if (hours >= 24) {
days += Math.floor(hours / 24);
hours = hours % 24;
}
if (hours < 9)
hours = "0" + hours;
if (minutes < 9)
minutes = "0" + minutes;
if (seconds < 9)
seconds = "0" + seconds;
g_form.setValue(this.dayField, days);
g_form.setValue(this.hourField, hours);
g_form.setValue(this.minuteField, minutes);
g_form.setValue(this.secondField, seconds);
},
validateDurationFields: function() {
var g_form = this.g_form;
var day = g_form.getValue(this.dayField);
var hour = g_form.getValue(this.hourField);
var minute = g_form.getValue(this.minuteField);
var second = g_form.getValue(this.secondField);
if (!day || day.trim() == '')
g_form.setValue(this.dayField, "00");
if (!hour || hour.trim() == '')
g_form.setValue(this.hourField, "00");
if (!minute || minute.trim() == '')
g_form.setValue(this.minuteField, "00");
if (!second || second.trim() == '')
g_form.setValue(this.secondField, "00");
var startDate = g_form.getValue("start_date");
if (g_form.getValue("duration") == '')
g_form.setValue("end_date", g_form.getValue("start_date"));
},
handleResponse: function(response, column) {
if (response && response.responseXML) {
var result = response.responseXML.getElementsByTagName("result");
if (result) {
result = result[0];
var status = result.getAttribute("status");
var answer = result.getAttribute("answer");
if (status == 'error') {
var message = result.getAttribute('message');
this._showErrorMessage(result.getAttribute("column"), message);
} else {
if (column == 'duration' || column == 'start_date')
this.setEndDate(answer);
else if (column == 'end_date')
this.setDuration(answer);
}
}
}
},
calculateDateTime: function(column) {
var self = this;
var ga = new GlideAjax('AjaxPlannedTaskDateUtil');
ga.addParam('sysparm_start_date', this.g_form.getValue('start_date'));
if (column == 'duration' || column == 'start_date') {
ga.addParam('sysparm_duration', this.g_form.getValue('duration'));
ga.addParam('sysparm_name', 'getEndDate');
} else if (column == 'end_date') {
ga.addParam('sysparm_end_date', this.g_form.getValue('end_date'));
ga.addParam('sysparm_name', 'getDuration');
}
ga.getXML(function(response) {
self.handleResponse(response, column);
});
},
calculateEndDateFromDuration: function(control, oldValue, newValue, isLoading, isTemplate) {
var g_form = this.g_form;
var g_scratchpad = this.g_scratchpad;
this.validateDurationFields();
if (isLoading || g_scratchpad.flag) {
g_scratchpad.flag = false;
return;
}
var startDate = this.getStartDate();
var startDateEmpty = !startDate || startDate.trim() === '';
if (newValue.indexOf("-") > -1 || startDateEmpty)
return;
this.setDurationHoursAndDays();
this.calculateDateTime('duration');
},
calculateEndDateFromStartDate: function(control, oldValue, newValue, isLoading, isTemplate) {
var g_form = this.g_form;
var g_scratchpad = this.g_scratchpad;
try {
g_form.hideFieldMsg('start_date');
} catch (e) {
}
if (isLoading || g_scratchpad.flag) {
g_scratchpad.flag = false;
return;
}
if (newValue == '')
return;
this.calculateDateTime('start_date');
},
calculateDurationFromEndDate: function(control, oldValue, newValue, isLoading, isTemplate) {
var g_form = this.g_form;
var g_scratchpad = this.g_scratchpad;
var startDateColumn = 'start_date';
var startDate;
if (isLoading || g_scratchpad.flag) {
g_scratchpad.flag = false;
return;
}
startDate = g_form.getValue(startDateColumn);
this.calculateDateTime('end_date');
},
type: "PlannedTaskDateUtil"
};
/*! RESOURCE: Validate Client Script Functions */
function validateFunctionDeclaration(fieldName, functionName) {
var code = g_form.getValue(fieldName);
if (code == "")
return true;
code = removeCommentsFromClientScript(code);
var patternString = "function(\\s+)" + functionName + "((\\s+)|\\(|\\[\r\n])";
var validatePattern = new RegExp(patternString);
if (!validatePattern.test(code)) {
var msg = new GwtMessage().getMessage('Missing function declaration for') + ' ' + functionName;
g_form.showErrorBox(fieldName, msg);
return false;
}
return true;
}
function validateNoServerObjectsInClientScript(fieldName) {
var code = g_form.getValue(fieldName);
if (code == "")
return true;
code = removeCommentsFromClientScript(code);
var doubleQuotePattern = /"[^"\r\n]*"/g;
code = code.replace(doubleQuotePattern,"");
var singleQuotePattern = /'[^'\r\n]*'/g;
code = code.replace(singleQuotePattern,"");
var rc = true;
var gsPattern = /(\s|\W)gs\./;
if (gsPattern.test(code)) {
var msg = new GwtMessage().getMessage('The object "gs" should not be used in client scripts.');
g_form.showErrorBox(fieldName, msg);
rc = false;
}
var currentPattern = /(\s|\W)current\./;
if (currentPattern.test(code)) {
var msg = new GwtMessage().getMessage('The object "current" should not be used in client scripts.');
g_form.showErrorBox(fieldName, msg);
rc = false;
}
return rc;
}
function validateUIScriptIIFEPattern(fieldName, scopeName, scriptName) {
var code = g_form.getValue(fieldName);
var rc = true;
if("global" == scopeName)
return rc;
code = removeCommentsFromClientScript(code);
code = removeSpacesFromClientScript(code);
code = removeNewlinesFromClientScript(code);
var requiredStart =  "var"+scopeName+"="+scopeName+"||{};"+scopeName+"."+scriptName+"=(function(){\"usestrict\";";
var requiredEnd = "})();";
if(!code.startsWith(requiredStart)) {
var msg = new GwtMessage().getMessage("Missing closure assignment.");
g_form.showErrorBox(fieldName,msg);
rc = false;
}
if(!code.endsWith(requiredEnd)) {
var msg = new GwtMessage().getMessage("Missing immediately-invoked function declaration end.");
g_form.showErrorBox(fieldName,msg);
rc = false;
}
return rc;
}
function validateNotCallingFunction (fieldName, functionName) {
var code = g_form.getValue(fieldName);
var rc = true;
var reg = new RegExp(functionName, "g");
var matches;
code = removeCommentsFromClientScript(code);
if (code == '')
return rc;
matches = code.match(reg);
rc = (matches && (matches.length == 1));
if(!rc) {
var msg = "Do not explicitly call the " + functionName + " function in your business rule. It will be called automatically at execution time.";
msg = new GwtMessage().getMessage(msg);
g_form.showErrorBox(fieldName,msg);
}
return rc;
}
function removeCommentsFromClientScript(code) {
var pattern1 = /\/\*(.|[\r\n])*?\*\//g;
code = code.replace(pattern1,"");
var pattern2 = /\/\/.*/g;
code = code.replace(pattern2,"");
return code;
}
function removeSpacesFromClientScript(code) {
var pattern = /\s*/g;
return code.replace(pattern,"");
}
function removeNewlinesFromClientScript(code) {
var pattern = /[\r\n]*/g;
return code.replace(pattern,"");
}
/*! RESOURCE: ProjectTaskUtil */
var ProjectTaskUtil = Class.create();
ProjectTaskUtil.prototype = {
initialize: function() {
},
type: 'ProjectTaskUtil'
};
ProjectTaskUtil.decodeOnLoadActualDatesState = function(response) {
var result = (response.responseXML.getElementsByTagName('result'))[0];
var status = result.getAttribute('status');
var workStartReadOnly = true;
var workEndReadOnly = true;
if(status == 'success') {
var state = result.getAttribute('state');
if(state == 'closed') {
workStartReadOnly = false;
workEndReadOnly = false;
} else if(state == 'started')
workStartReadOnly = false;
}
return {
workStartReadOnly: workStartReadOnly,
workEndReadOnly: workEndReadOnly
};
};
ProjectTaskUtil.decodeOnChangeActualDatesState = function(response) {
var result = (response.responseXML.getElementsByTagName('result'))[0];
var state = JSON.parse(result.getAttribute('state'));
return {
workStartState: ProjectTaskUtil._decodeActualStartDateState(state.work_start_state),
workEndState: ProjectTaskUtil._decodeActualEndDateState(state.work_end_state)
};
};
ProjectTaskUtil._decodeActualStartDateState = function(result) {
var workStartState = {
date: '',
readOnly: true
};
var status = result.work_start_status;
if(status == 'success') {
var state = result.work_start_state;
if(state == 'already_started' || state == 'about_to_start') {
workStartState.readOnly = false;
workStartState.date = result.work_start;
}
}
return workStartState;
};
ProjectTaskUtil._decodeActualEndDateState = function(result) {
var workEndState = {
date: '',
readOnly: true
};
var status = result.work_end_status;
if(status == 'success') {
var state = result.work_end_state;
if(state == 'already_closed' || state == 'about_to_close') {
workEndState.readOnly = false;
workEndState.date = result.work_end;
}
}
return workEndState;
};
/*! RESOURCE: ScrumTaskDialog */
var ScrumTaskDialog = Class.create(GlideDialogWindow, {
initialize: function () {
if (typeof g_list != "undefined")
this.list = g_list;
else
this.list = null;
this.storyID = typeof rowSysId == 'undefined' ? (gel('sys_uniqueValue') ? gel('sys_uniqueValue').value : "") : rowSysId;
this.setUpFacade();
this.setUpEvents();
this.display(true);
this.checkOKButton();
this.setWidth(155);
this.focusFirstSelectElement();
},
toggleOKButton: function(visible){
$("ok").style.display = (visible?"inline":"none");
},
setUpFacade: function () {
GlideDialogWindow.prototype.initialize.call(this, "task_window", false);
this.setTitle(getMessage("Add Scrum Tasks"));
var mapCount = this.getTypeCounts();
this.setBody(this.getMarkUp(mapCount), false, false);
},
checkOKButton: function(){
var visible = false;
var thisDialog = this;
this.container.select("select").each(function(elem){
if (elem.value + "" != "0")
visible = true;
if (!elem.onChangeAdded){
elem.onChangeAdded = true;
elem.on("change", function(){
thisDialog.checkOKButton();
});
}
});
this.toggleOKButton(visible);
},
focusFirstSelectElement: function() {
this.container.select("select")[0].focus();
},
getTypeCounts: function() {
var mapLabel = this.getLabels("rm_scrum_task", "type");
var mapCount = {};
for (var strKey in mapLabel) {
mapCount[strKey] = getPreference("com.snc.sdlc.scrum.pp.tasks." + strKey, 0);
}
return mapCount;
},
setUpEvents: function () {
var dialog = this;
$("ok").on("click", function () {
var mapTaskData = {};
if (dialog.fillDataMap(mapTaskData)) {
var taskProducer = new GlideAjax("ScrumAjaxTaskProducer");
for (var strKey in mapTaskData) {
taskProducer.addParam("sysparm_" + strKey, mapTaskData[strKey]);
}
dialog.showStatus("Adding tasks...");
taskProducer.getXML(function () {
dialog.refresh();
dialog._onCloseClicked();
});
} else {
dialog._onCloseClicked();
}
});
$("cancel").on("click", function () {
dialog._onCloseClicked();
});
},
refresh: function(){
if (this.list)
this.list.refresh();
else
this.reloadList("rm_story.rm_scrum_task.story");
},
getSysID: function(){
return this.storyID;
},
fillDataMap: function (mapTaskData) {
var bTasksRequired = false;
mapTaskData.name = "createTasks";
mapTaskData.sys_id = this.getSysID();
var mapDetails = this.getLabels("rm_scrum_task", "type");
var arrTaskTypes = [];
for (var key in mapDetails) {
arrTaskTypes.push(key);
}
for (var nSlot = 0; nSlot < arrTaskTypes.length; ++nSlot) {
var strTaskType = arrTaskTypes[nSlot];
var strTaskData = $(strTaskType).getValue();
mapTaskData[strTaskType] = strTaskData;
setPreference("com.snc.sdlc.scrum.pp.tasks." + strTaskType, strTaskData);
if (strTaskData != "0") {
bTasksRequired = true;
}
}
return bTasksRequired;
},
getMarkUp: function (mapCounts) {
function getSelectMarkUp(strFieldId, nValue) {
var strMarkUp = "<select id='" + strFieldId + "'>";
for (var nSlot = 0; nSlot <= 10; nSlot++) {
if (nValue != 0 && nValue == nSlot) {
strMarkUp += "<option value='" + nSlot + "' + " + "selected='selected'" + ">" + nSlot + "</choice>";
} else {
strMarkUp += "<option value='" + nSlot + "'>" + nSlot + "</choice>";
}
}
strMarkUp += "</select>";
return strMarkUp;
}
function buildRow(strMessage, strLabel, nValue) {
return "<tr><td><label for='" + strLabel + "'>" + strMessage + "</label></td><td>" + getSelectMarkUp(strLabel, nValue) +"</td></tr>";
}
function buildTable(mapDetails, mapCounts) {
var arrDetails = [];
for (var strKey in mapDetails) {
arrDetails.push(strKey + "");
}
arrDetails.sort();
var strBuf = "<table>";
for (var index = 0; index < arrDetails.length; ++index) {
var strTitleCase = arrDetails[index].charAt(0).toString().toUpperCase() + arrDetails[index].substring(1);
var nCount = mapCounts[arrDetails[index]];
strBuf += buildRow(strTitleCase, arrDetails[index], nCount);
}
strBuf += "</table>";
return strBuf;
}
var mapLabels = this.getLabels("rm_scrum_task", "type");
return "<div id='task_controls'>" + buildTable(mapLabels, mapCounts) +
"<button id='ok' type='button'>" + getMessage('OK') + "</button>" +
"<button id='cancel' type='button'>" + getMessage('Cancel') + "</button></div>";
},
reloadForm: function () {
document.location.href = document.location.href;
},
reloadList: function (strListName) {
GlideList2.get(strListName).refresh();
},
showStatus: function (strMessage) {
$("task_controls").update("Loading...");
},
display: function(bIsVisible) {
$("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
},
getLabels: function(strTable, strAttribute) {
var taskProducer = new GlideAjax("ScrumAjaxTaskProducer");
taskProducer.addParam("sysparm_name" ,"getLabels");
taskProducer.addParam("sysparm_table", strTable);
taskProducer.addParam("sysparm_attribute", strAttribute);
var result = taskProducer.getXMLWait();
return this._parseResponse(result);
},
_parseResponse: function(resultXML) {
var jsonStr = resultXML.documentElement.getAttribute("answer");
var map = (isMSIE7 || isMSIE8) ? eval("(" + jsonStr + ")") : JSON.parse(jsonStr);
return map;
}
});
/*! RESOURCE: fixed_table */
(function ($) {
$.fn.fxdHdrCol = function (o) {
var cfg = {
height: 0,
width: 0,
fixedCols: 0,
colModal: [],
tableTmpl: function () {
return '<table />';
},
sort: false
};
$.extend(cfg, o);
return this.each (function () {
var lc = {
ft_container: null,
ft_rel_container: null,
ft_wrapper: null,
ft_rc: null,
ft_r: null,
ft_c: null,
tableWidth: 0
};
var $this = $(this);
$this.addClass('ui-widget-header');
$this.find('tbody tr').addClass('ui-widget-content');
$this.wrap('<div class="ft_container" />');
lc.ft_container = $this.parent().css({width: cfg.width, height: cfg.height});
var $ths = $('thead tr', $this).first().find('th');
if (cfg.sort && sorttable && cfg.fixedCols == 0) {
$ths.addClass('fx_sort_bg');
}
var $thFirst = $ths.first();
var thSpace = parseInt($thFirst.css('paddingLeft'), 10) + parseInt($thFirst.css('paddingRight'), 10);
var ct = 0;
$ths.each(function (i, el) {
var calcWidth = 0;
for (var j = 0; j < el.colSpan; j++) {
calcWidth += cfg.colModal[ct].width;
ct++;
}
$(el).css({width: calcWidth, textAlign: cfg.colModal[ct-1].align});
lc.tableWidth += calcWidth + thSpace + ((i == 0)?2:1);
});
$('tbody', $this).find('tr').each(function (i, el) {
$('td', el).each(function (i, tdel) {
tdel.style.textAlign = cfg.colModal[i].align;
});
});
$this.width(lc.tableWidth);
$this.wrap('<div class="ft_rel_container" />');
lc.ft_rel_container = $this.parent();
$this.wrap('<div class="ft_scroller" />');
lc.ft_wrapper = $this.parent().css('width', cfg.width - 5);
var theadTr = $('thead', $this);
var theadTrClone = theadTr.clone();
lc.ft_rel_container
.prepend($(cfg.tableTmpl(), {'class': 'ft_r ui-widget-header'})
.append(theadTrClone));
lc.ft_r = $('.ft_r', lc.ft_rel_container);
lc.ft_r.wrap($('<div />', {'class': 'ft_rwrapper'}));
lc.ft_r.width(lc.tableWidth);
if (cfg.fixedCols > 0) {
theadTrClone = theadTr.clone();
var r1c1ColSpan = 0;
for (var i = 0; i < cfg.fixedCols; i++ ) {
r1c1ColSpan += this.rows[0].cells[i].colSpan;
}
$('tr', theadTrClone).each(function () {
var tdct = 0;
$(this).find('th').filter(function() {
tdct += this.colSpan;
return tdct > r1c1ColSpan;
}).remove();
});
lc.ft_rel_container
.prepend($(cfg.tableTmpl(), {'class': 'ft_rc ui-widget-header'})
.append(theadTrClone));
lc.ft_rc = $('.ft_rc', lc.ft_rel_container);
lc.ft_c = lc.ft_rc.clone();
lc.ft_c[0].className = 'ft_c';
lc.ft_c.append('<tbody />');
var ftc_tbody = lc.ft_c.find('tbody');
$.each ($this.find('tbody > tr'), function (idx, el) {
var tr = $(el).clone();
tdct = 0;
tr.find('td').filter(function (){
tdct += this.colSpan;
return tdct > r1c1ColSpan;
}).remove();
ftc_tbody.append(tr);
});
lc.ft_rc.after(lc.ft_c);
lc.ft_c.wrap($('<div />', {'class': 'ft_cwrapper'}));
var tw = 0;
for (var i = 0; i < cfg.fixedCols; i++) {
tw += $(this.rows[0].cells[i]).outerWidth(true);
}
lc.ft_c.add(lc.ft_rc).width(tw);
lc.ft_c.height($this.outerHeight(true));
for (var i = 0; i < this.rows.length; i++) {
var ch = $(this.rows[i]).outerHeight();
var fch = $(lc.ft_c[0].rows[i]).outerHeight(true);
ch = (ch>fch)?ch:fch;
if (i < lc.ft_rc[0].rows.length) {
$(lc.ft_r[0].rows[i])
.add(lc.ft_rc[0].rows[i])
.height(ch);
}
$(lc.ft_c[0].rows[i])
.add(this.rows[i])
.height(ch);
}
lc.ft_c
.parent()
.css({height: lc.ft_container.height() - 17})
.width(lc.ft_rc.outerWidth(true) + 1);
}
lc.ft_r
.parent()
.css({width: lc.ft_wrapper.width()- 17});
lc.ft_wrapper.scroll(function () {
if (cfg.fixedCols > 0) {
lc.ft_c.css('top', ($(this).scrollTop()*-1));
}
lc.ft_r.css('left', ($(this).scrollLeft()*-1));
});
if (cfg.sort && sorttable && cfg.fixedCols == 0) {
$('table', lc.ft_container).addClass('sorttable');
sorttable.makeSortable(this);
var $sortableTh = $('.fx_sort_bg', lc.ft_rel_container);
$sortableTh.click (function () {
var $this = $(this);
var isAscSort = $this.hasClass('fx_sort_asc');
$sortableTh.removeClass('fx_sort_asc fx_sort_desc');
if (isAscSort) {
$this.addClass('fx_sort_desc').removeClass('fx_sort_asc');
} else {
$this.addClass('fx_sort_asc').removeClass('fx_sort_desc');
}
var idx = $(this).index();
sorttable.innerSortFunction.apply(lc.ft_wrapper.find('th').get(idx), []);
});
}
});
};
})(jQuery);
/*! RESOURCE: AssetSetDomainParameters */
function assetSetDomainParameters(gDialog) {
var ga = new GlideAjax('global.AssetUtilsAJAX');
ga.addParam('sysparm_name', 'isDomainDataSeparationEnabled');
ga.getXMLWait();
if (ga.getAnswer() === 'true') {
gDialog.setPreference('sysparm_domain', g_form.getValue('sysparm_domain'));
gDialog.setPreference('sysparm_domain_scope', g_form.getValue('sysparm_domain_scope'));
}
}
/*! RESOURCE: EUS_ShortcutHandler */
shortcut = {
'all_shortcuts':{},
'add': function(shortcut_combination,callback,opt) {
console.log("ADD called");
var default_options = {
'type':'keydown',
'propagate':false,
'disable_in_input':false,
'target':document,
'keycode':false
};
if(!opt) opt = default_options;
else {
for(var dfo in default_options) {
if(typeof opt[dfo] == 'undefined') opt[dfo] = default_options[dfo];
}
}
var ele = opt.target;
if(typeof opt.target == 'string') ele = document.getElementById(opt.target);
var ths = this;
shortcut_combination = shortcut_combination.toLowerCase();
var func = function(e) {
e = e || window.event;
if(opt['disable_in_input']) {
var element;
if(e.target) element=e.target;
else if(e.srcElement) element=e.srcElement;
if(element.nodeType==3) element=element.parentNode;
if(element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') return;
}
if (e.keyCode) code = e.keyCode;
else if (e.which) code = e.which;
var character = String.fromCharCode(code).toLowerCase();
if(code == 188) character=",";
if(code == 190) character=".";
var keys = shortcut_combination.split("+");
var kp = 0;
var shift_nums = {
"`":"~",
"1":"!",
"2":"@",
"3":"#",
"4":"$",
"5":"%",
"6":"^",
"7":"&",
"8":"*",
"9":"(",
"0":")",
"-":"_",
"=":"+",
";":":",
"'":"\"",
",":"<",
".":">",
"/":"?",
"\\":"|"
};
var special_keys = {
'esc':27,
'escape':27,
'tab':9,
'space':32,
'return':13,
'enter':13,
'backspace':8,
'scrolllock':145,
'scroll_lock':145,
'scroll':145,
'capslock':20,
'caps_lock':20,
'caps':20,
'numlock':144,
'num_lock':144,
'num':144,
'pause':19,
'break':19,
'insert':45,
'home':36,
'delete':46,
'end':35,
'pageup':33,
'page_up':33,
'pu':33,
'pagedown':34,
'page_down':34,
'pd':34,
'left':37,
'up':38,
'right':39,
'down':40,
'f1':112,
'f2':113,
'f3':114,
'f4':115,
'f5':116,
'f6':117,
'f7':118,
'f8':119,
'f9':120,
'f10':121,
'f11':122,
'f12':123
};
var modifiers = {
shift: { wanted:false, pressed:false},
ctrl : { wanted:false, pressed:false},
alt  : { wanted:false, pressed:false},
meta : { wanted:false, pressed:false}
};
if(e.ctrlKey)modifiers.ctrl.pressed = true;
if(e.shiftKey)modifiers.shift.pressed = true;
if(e.altKey)modifiers.alt.pressed = true;
if(e.metaKey)   modifiers.meta.pressed = true;
for(var i=0;i<keys.length; i++) {
k=keys[i];
if(k == 'ctrl' || k == 'control') {
kp++;
modifiers.ctrl.wanted = true;
} else if(k == 'shift') {
kp++;
modifiers.shift.wanted = true;
} else if(k == 'alt') {
kp++;
modifiers.alt.wanted = true;
} else if(k == 'meta') {
kp++;
modifiers.meta.wanted = true;
} else if(k.length > 1) {
if(special_keys[k] == code) kp++;
} else if(opt['keycode']) {
if(opt['keycode'] == code) kp++;
} else {
if(character == k) kp++;
else {
if(shift_nums[character] && e.shiftKey) {
character = shift_nums[character];
if(character == k) kp++;
}
}
}
}
if(kp == keys.length &&
modifiers.ctrl.pressed == modifiers.ctrl.wanted &&
modifiers.shift.pressed == modifiers.shift.wanted &&
modifiers.alt.pressed == modifiers.alt.wanted &&
modifiers.meta.pressed == modifiers.meta.wanted) {
callback(e);
if(!opt['propagate']) {
e.cancelBubble = true;
e.returnValue = false;
if (e.stopPropagation) {
e.stopPropagation();
e.preventDefault();
}
return false;
}
}
};
this.all_shortcuts[shortcut_combination] = {
'callback':func,
'target':ele,
'event': opt['type']
};
if(ele.addEventListener) ele.addEventListener(opt['type'], func, false);
else if(ele.attachEvent) ele.attachEvent('on'+opt['type'], func);
else ele['on'+opt['type']] = func;
},
'remove':function(shortcut_combination) {
shortcut_combination = shortcut_combination.toLowerCase();
var binding = this.all_shortcuts[shortcut_combination];
delete(this.all_shortcuts[shortcut_combination]);
if(!binding)
return;
var type = binding['event'];
var ele = binding['target'];
var callback = binding['callback'];
if(ele.detachEvent) ele.detachEvent('on'+type, callback);
else if(ele.removeEventListener) ele.removeEventListener(type, callback, false);
else ele['on'+type] = false;
}
};
/*! RESOURCE: tm_AssignDefect */
var tm_AssignDefect = Class.create({
initialize: function (gr) {
this._gr = gr;
this._isList = (gr.type + "" == "GlideList2");
this._sysId = this._gr.getUniqueValue();
this._tableName = this._gr.getTableName();
this._redirect = false;
this._testCaseInstance = 'tm_test_case_instance';
this._prmErr = [];
if (this._tableName == 'tm_test_instance') {
this._sysId = this._gr.getValue('tm_test_case_instance');
}
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
this._mstrDlg = new dialogClass("tm_ref_choose_dialog");
var titleMsg = getMessage("Assign Defect to Test Case");
this._mstrDlg.setTitle(titleMsg);
this._mstrDlg.setPreference("sysparam_reference_table", "rm_defect");
this._mstrDlg.setPreference("sysparam_query", "");
this._mstrDlg.setPreference("sysparam_field_label", getMessage("Defect"));
this._mstrDlg.setPreference("handler", this);
},
showLoadingDialog: function() {
this.loadingDialog = new GlideDialogWindow("dialog_loading", true, 300);
this.loadingDialog.setPreference('table', 'loading');
this.loadingDialog.render();
},
hideLoadingDialog: function() {
this.loadingDialog && this.loadingDialog.destroy();
},
showDialog: function () {
this._mstrDlg.render();
},
onSubmit: function () {
this.defectId = this._getValue('rm_defect_ref');
this.defectLabel = this._getDisplayValue('rm_defect_ref');
if (!this._validate()) {
var e = gel("sys_display.rm_defect_ref");
if (e)
e.focus();
return false;
}
this._mstrDlg.destroy();
if (this.defectId) {
var ga = new GlideAjax("tm_AjaxProcessor");
ga.addParam('sysparm_name', 'mapDefectToTestCase');
ga.addParam('sysparm_sysId', this._sysId);
ga.addParam('sysparm_defect', this.defectId);
ga.addParam('sysparm_tn', this._testCaseInstance);
this.showLoadingDialog();
ga.getXML(this.callback.bind(this));
}
return false;
},
callback: function (response) {
this.hideLoadingDialog();
var resp = response.responseXML.getElementsByTagName("result");
if (resp[0] && resp[0].getAttribute("status") == "success") {
if (this._tableName == this._testCaseInstance) {
var list = GlideList2.get(g_form.getTableName() + '.REL:5da20971872121003706db5eb2e3ec0b');
if(list)
list.setFilterAndRefresh('');
} else {
this._displayInfoMessage(resp[0]);
}
} else {
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
this._createError = new dialogClass("tm_error_dialog");
this._createError.setTitle(getMessage("Error while assigning defect."));
this._createError.render();
}
},
_validate: function () {
this._prmErr = [];
this._removeAllError('tm_ref_choose_dialog');
if (this._getValue('rm_defect_ref') == 'undefined' || this._getValue('rm_defect_ref').trim() == "") {
this._prmErr.push(getMessage("Select the defect."));
this._showFieldError('ref_test_suite_field', getMessage(this._prmErr[0]));
return false;
}
return this._checkForDuplicateEntry();
},
_getValue: function (inptNm) {
return gel(inptNm).value;
},
_getDisplayValue: function (inputNm) {
return gel('display_hidden.' + inputNm).value;
},
_displayInfoMessage: function (result) {
var infoMessage = result.textContent;
this._gr.addInfoMessage(infoMessage);
},
_checkForDuplicateEntry: function () {
this.defectId = this._getValue('rm_defect_ref');
this._testCaseInstance;
var ga = new GlideAjax("tm_AjaxProcessor");
ga.addParam('sysparm_name', 'hasAssociation');
ga.addParam('sysparm_testcaseinstance', this._sysId);
ga.addParam('sysparm_defect', this._getValue('rm_defect_ref'));
this.showLoadingDialog();
var responseXML = ga.getXMLWait();
return this._parseResponse(responseXML);
},
_parseResponse: function (responseXML) {
this.hideLoadingDialog();
var resp = responseXML.getElementsByTagName("result");
if (resp[0] && resp[0].getAttribute("status") == "success") {
var isDuplicate = responseXML.documentElement.getAttribute("answer");
this._removeAllError('tm_ref_choose_dialog');
if (isDuplicate == 'true') {
this._showFieldError('ref_test_suite_field', getMessage('Already assigned'));
return false;
}
}
return true;
},
_removeAllError: function (dialogName) {
$$('#'+dialogName+' .form-group.has-error').each(function(item){
$(item).removeClassName('has-error');
$(item).down('.help-block').setStyle({'display':'none'});
});
},
_showFieldError: function (groupId, message) {
var $group = $(groupId);
var $helpBlock = $group.down('.help-block');
if(!$group.hasClassName('has-error'))
$group.addClassName('has-error');
if($helpBlock.getStyle('display')!='inline-block'){
$helpBlock.update(message);
$helpBlock.setStyle({'display':'inline-block'});
}
},
type: "tm_AssignDefect"
});
/*! RESOURCE: qrcode.min.js */
var QRCode;!function(){function a(a){this.mode=c.MODE_8BIT_BYTE,this.data=a,this.parsedData=[];for(var b=[],d=0,e=this.data.length;e>d;d++){var f=this.data.charCodeAt(d);f>65536?(b[0]=240|(1835008&f)>>>18,b[1]=128|(258048&f)>>>12,b[2]=128|(4032&f)>>>6,b[3]=128|63&f):f>2048?(b[0]=224|(61440&f)>>>12,b[1]=128|(4032&f)>>>6,b[2]=128|63&f):f>128?(b[0]=192|(1984&f)>>>6,b[1]=128|63&f):b[0]=f,this.parsedData=this.parsedData.concat(b)}this.parsedData.length!=this.data.length&&(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239))}function b(a,b){this.typeNumber=a,this.errorCorrectLevel=b,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function i(a,b){if(void 0==a.length)throw new Error(a.length+"/"+b);for(var c=0;c<a.length&&0==a[c];)c++;this.num=new Array(a.length-c+b);for(var d=0;d<a.length-c;d++)this.num[d]=a[d+c]}function j(a,b){this.totalCount=a,this.dataCount=b}function k(){this.buffer=[],this.length=0}function m(){return"undefined"!=typeof CanvasRenderingContext2D}function n(){var a=!1,b=navigator.userAgent;return/android/i.test(b)&&(a=!0,aMat=b.toString().match(/android ([0-9]\.[0-9])/i),aMat&&aMat[1]&&(a=parseFloat(aMat[1]))),a}function r(a,b){for(var c=1,e=s(a),f=0,g=l.length;g>=f;f++){var h=0;switch(b){case d.L:h=l[f][0];break;case d.M:h=l[f][1];break;case d.Q:h=l[f][2];break;case d.H:h=l[f][3]}if(h>=e)break;c++}if(c>l.length)throw new Error("Too long data");return c}function s(a){var b=encodeURI(a).toString().replace(/\%[0-9a-fA-F]{2}/g,"a");return b.length+(b.length!=a?3:0)}a.prototype={getLength:function(){return this.parsedData.length},write:function(a){for(var b=0,c=this.parsedData.length;c>b;b++)a.put(this.parsedData[b],8)}},b.prototype={addData:function(b){var c=new a(b);this.dataList.push(c),this.dataCache=null},isDark:function(a,b){if(0>a||this.moduleCount<=a||0>b||this.moduleCount<=b)throw new Error(a+","+b);return this.modules[a][b]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=new Array(this.moduleCount);for(var e=0;e<this.moduleCount;e++)this.modules[d][e]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(a,c),this.typeNumber>=7&&this.setupTypeNumber(a),null==this.dataCache&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,b){for(var c=-1;7>=c;c++)if(!(-1>=a+c||this.moduleCount<=a+c))for(var d=-1;7>=d;d++)-1>=b+d||this.moduleCount<=b+d||(this.modules[a+c][b+d]=c>=0&&6>=c&&(0==d||6==d)||d>=0&&6>=d&&(0==c||6==c)||c>=2&&4>=c&&d>=2&&4>=d?!0:!1)},getBestMaskPattern:function(){for(var a=0,b=0,c=0;8>c;c++){this.makeImpl(!0,c);var d=f.getLostPoint(this);(0==c||a>d)&&(a=d,b=c)}return b},createMovieClip:function(a,b,c){var d=a.createEmptyMovieClip(b,c),e=1;this.make();for(var f=0;f<this.modules.length;f++)for(var g=f*e,h=0;h<this.modules[f].length;h++){var i=h*e,j=this.modules[f][h];j&&(d.beginFill(0,100),d.moveTo(i,g),d.lineTo(i+e,g),d.lineTo(i+e,g+e),d.lineTo(i,g+e),d.endFill())}return d},setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2);for(var b=8;b<this.moduleCount-8;b++)null==this.modules[6][b]&&(this.modules[6][b]=0==b%2)},setupPositionAdjustPattern:function(){for(var a=f.getPatternPosition(this.typeNumber),b=0;b<a.length;b++)for(var c=0;c<a.length;c++){var d=a[b],e=a[c];if(null==this.modules[d][e])for(var g=-2;2>=g;g++)for(var h=-2;2>=h;h++)this.modules[d+g][e+h]=-2==g||2==g||-2==h||2==h||0==g&&0==h?!0:!1}},setupTypeNumber:function(a){for(var b=f.getBCHTypeNumber(this.typeNumber),c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[Math.floor(c/3)][c%3+this.moduleCount-8-3]=d}for(var c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[c%3+this.moduleCount-8-3][Math.floor(c/3)]=d}},setupTypeInfo:function(a,b){for(var c=this.errorCorrectLevel<<3|b,d=f.getBCHTypeInfo(c),e=0;15>e;e++){var g=!a&&1==(1&d>>e);6>e?this.modules[e][8]=g:8>e?this.modules[e+1][8]=g:this.modules[this.moduleCount-15+e][8]=g}for(var e=0;15>e;e++){var g=!a&&1==(1&d>>e);8>e?this.modules[8][this.moduleCount-e-1]=g:9>e?this.modules[8][15-e-1+1]=g:this.modules[8][15-e-1]=g}this.modules[this.moduleCount-8][8]=!a},mapData:function(a,b){for(var c=-1,d=this.moduleCount-1,e=7,g=0,h=this.moduleCount-1;h>0;h-=2)for(6==h&&h--;;){for(var i=0;2>i;i++)if(null==this.modules[d][h-i]){var j=!1;g<a.length&&(j=1==(1&a[g]>>>e));var k=f.getMask(b,d,h-i);k&&(j=!j),this.modules[d][h-i]=j,e--,-1==e&&(g++,e=7)}if(d+=c,0>d||this.moduleCount<=d){d-=c,c=-c;break}}}},b.PAD0=236,b.PAD1=17,b.createData=function(a,c,d){for(var e=j.getRSBlocks(a,c),g=new k,h=0;h<d.length;h++){var i=d[h];g.put(i.mode,4),g.put(i.getLength(),f.getLengthInBits(i.mode,a)),i.write(g)}for(var l=0,h=0;h<e.length;h++)l+=e[h].dataCount;if(g.getLengthInBits()>8*l)throw new Error("code length overflow. ("+g.getLengthInBits()+">"+8*l+")");for(g.getLengthInBits()+4<=8*l&&g.put(0,4);0!=g.getLengthInBits()%8;)g.putBit(!1);for(;;){if(g.getLengthInBits()>=8*l)break;if(g.put(b.PAD0,8),g.getLengthInBits()>=8*l)break;g.put(b.PAD1,8)}return b.createBytes(g,e)},b.createBytes=function(a,b){for(var c=0,d=0,e=0,g=new Array(b.length),h=new Array(b.length),j=0;j<b.length;j++){var k=b[j].dataCount,l=b[j].totalCount-k;d=Math.max(d,k),e=Math.max(e,l),g[j]=new Array(k);for(var m=0;m<g[j].length;m++)g[j][m]=255&a.buffer[m+c];c+=k;var n=f.getErrorCorrectPolynomial(l),o=new i(g[j],n.getLength()-1),p=o.mod(n);h[j]=new Array(n.getLength()-1);for(var m=0;m<h[j].length;m++){var q=m+p.getLength()-h[j].length;h[j][m]=q>=0?p.get(q):0}}for(var r=0,m=0;m<b.length;m++)r+=b[m].totalCount;for(var s=new Array(r),t=0,m=0;d>m;m++)for(var j=0;j<b.length;j++)m<g[j].length&&(s[t++]=g[j][m]);for(var m=0;e>m;m++)for(var j=0;j<b.length;j++)m<h[j].length&&(s[t++]=h[j][m]);return s};for(var c={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},d={L:1,M:0,Q:3,H:2},e={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},f={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var b=a<<10;f.getBCHDigit(b)-f.getBCHDigit(f.G15)>=0;)b^=f.G15<<f.getBCHDigit(b)-f.getBCHDigit(f.G15);return(a<<10|b)^f.G15_MASK},getBCHTypeNumber:function(a){for(var b=a<<12;f.getBCHDigit(b)-f.getBCHDigit(f.G18)>=0;)b^=f.G18<<f.getBCHDigit(b)-f.getBCHDigit(f.G18);return a<<12|b},getBCHDigit:function(a){for(var b=0;0!=a;)b++,a>>>=1;return b},getPatternPosition:function(a){return f.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,b,c){switch(a){case e.PATTERN000:return 0==(b+c)%2;case e.PATTERN001:return 0==b%2;case e.PATTERN010:return 0==c%3;case e.PATTERN011:return 0==(b+c)%3;case e.PATTERN100:return 0==(Math.floor(b/2)+Math.floor(c/3))%2;case e.PATTERN101:return 0==b*c%2+b*c%3;case e.PATTERN110:return 0==(b*c%2+b*c%3)%2;case e.PATTERN111:return 0==(b*c%3+(b+c)%2)%2;default:throw new Error("bad maskPattern:"+a)}},getErrorCorrectPolynomial:function(a){for(var b=new i([1],0),c=0;a>c;c++)b=b.multiply(new i([1,g.gexp(c)],0));return b},getLengthInBits:function(a,b){if(b>=1&&10>b)switch(a){case c.MODE_NUMBER:return 10;case c.MODE_ALPHA_NUM:return 9;case c.MODE_8BIT_BYTE:return 8;case c.MODE_KANJI:return 8;default:throw new Error("mode:"+a)}else if(27>b)switch(a){case c.MODE_NUMBER:return 12;case c.MODE_ALPHA_NUM:return 11;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 10;default:throw new Error("mode:"+a)}else{if(!(41>b))throw new Error("type:"+b);switch(a){case c.MODE_NUMBER:return 14;case c.MODE_ALPHA_NUM:return 13;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 12;default:throw new Error("mode:"+a)}}},getLostPoint:function(a){for(var b=a.getModuleCount(),c=0,d=0;b>d;d++)for(var e=0;b>e;e++){for(var f=0,g=a.isDark(d,e),h=-1;1>=h;h++)if(!(0>d+h||d+h>=b))for(var i=-1;1>=i;i++)0>e+i||e+i>=b||(0!=h||0!=i)&&g==a.isDark(d+h,e+i)&&f++;f>5&&(c+=3+f-5)}for(var d=0;b-1>d;d++)for(var e=0;b-1>e;e++){var j=0;a.isDark(d,e)&&j++,a.isDark(d+1,e)&&j++,a.isDark(d,e+1)&&j++,a.isDark(d+1,e+1)&&j++,(0==j||4==j)&&(c+=3)}for(var d=0;b>d;d++)for(var e=0;b-6>e;e++)a.isDark(d,e)&&!a.isDark(d,e+1)&&a.isDark(d,e+2)&&a.isDark(d,e+3)&&a.isDark(d,e+4)&&!a.isDark(d,e+5)&&a.isDark(d,e+6)&&(c+=40);for(var e=0;b>e;e++)for(var d=0;b-6>d;d++)a.isDark(d,e)&&!a.isDark(d+1,e)&&a.isDark(d+2,e)&&a.isDark(d+3,e)&&a.isDark(d+4,e)&&!a.isDark(d+5,e)&&a.isDark(d+6,e)&&(c+=40);for(var k=0,e=0;b>e;e++)for(var d=0;b>d;d++)a.isDark(d,e)&&k++;var l=Math.abs(100*k/b/b-50)/5;return c+=10*l}},g={glog:function(a){if(1>a)throw new Error("glog("+a+")");return g.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;a>=256;)a-=255;return g.EXP_TABLE[a]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},h=0;8>h;h++)g.EXP_TABLE[h]=1<<h;for(var h=8;256>h;h++)g.EXP_TABLE[h]=g.EXP_TABLE[h-4]^g.EXP_TABLE[h-5]^g.EXP_TABLE[h-6]^g.EXP_TABLE[h-8];for(var h=0;255>h;h++)g.LOG_TABLE[g.EXP_TABLE[h]]=h;i.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var b=new Array(this.getLength()+a.getLength()-1),c=0;c<this.getLength();c++)for(var d=0;d<a.getLength();d++)b[c+d]^=g.gexp(g.glog(this.get(c))+g.glog(a.get(d)));return new i(b,0)},mod:function(a){if(this.getLength()-a.getLength()<0)return this;for(var b=g.glog(this.get(0))-g.glog(a.get(0)),c=new Array(this.getLength()),d=0;d<this.getLength();d++)c[d]=this.get(d);for(var d=0;d<a.getLength();d++)c[d]^=g.gexp(g.glog(a.get(d))+b);return new i(c,0).mod(a)}},j.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],j.getRSBlocks=function(a,b){var c=j.getRsBlockTable(a,b);if(void 0==c)throw new Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+b);for(var d=c.length/3,e=[],f=0;d>f;f++)for(var g=c[3*f+0],h=c[3*f+1],i=c[3*f+2],k=0;g>k;k++)e.push(new j(h,i));return e},j.getRsBlockTable=function(a,b){switch(b){case d.L:return j.RS_BLOCK_TABLE[4*(a-1)+0];case d.M:return j.RS_BLOCK_TABLE[4*(a-1)+1];case d.Q:return j.RS_BLOCK_TABLE[4*(a-1)+2];case d.H:return j.RS_BLOCK_TABLE[4*(a-1)+3];default:return void 0}},k.prototype={get:function(a){var b=Math.floor(a/8);return 1==(1&this.buffer[b]>>>7-a%8)},put:function(a,b){for(var c=0;b>c;c++)this.putBit(1==(1&a>>>b-c-1))},getLengthInBits:function(){return this.length},putBit:function(a){var b=Math.floor(this.length/8);this.buffer.length<=b&&this.buffer.push(0),a&&(this.buffer[b]|=128>>>this.length%8),this.length++}};var l=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]],o=function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){function g(a,b){var c=document.createElementNS("http://www.w3.org/2000/svg",a);for(var d in b)b.hasOwnProperty(d)&&c.setAttribute(d,b[d]);return c}var b=this._htOption,c=this._el,d=a.getModuleCount();Math.floor(b.width/d),Math.floor(b.height/d),this.clear();var h=g("svg",{viewBox:"0 0 "+String(d)+" "+String(d),width:"100%",height:"100%",fill:b.colorLight});h.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),c.appendChild(h),h.appendChild(g("rect",{fill:b.colorDark,width:"1",height:"1",id:"template"}));for(var i=0;d>i;i++)for(var j=0;d>j;j++)if(a.isDark(i,j)){var k=g("use",{x:String(i),y:String(j)});k.setAttributeNS("http://www.w3.org/1999/xlink","href","#template"),h.appendChild(k)}},a.prototype.clear=function(){for(;this._el.hasChildNodes();)this._el.removeChild(this._el.lastChild)},a}(),p="svg"===document.documentElement.tagName.toLowerCase(),q=p?o:m()?function(){function a(){this._elImage.src=this._elCanvas.toDataURL("image/png"),this._elImage.style.display="block",this._elCanvas.style.display="none"}function d(a,b){var c=this;if(c._fFail=b,c._fSuccess=a,null===c._bSupportDataURI){var d=document.createElement("img"),e=function(){c._bSupportDataURI=!1,c._fFail&&_fFail.call(c)},f=function(){c._bSupportDataURI=!0,c._fSuccess&&c._fSuccess.call(c)};return d.onabort=e,d.onerror=e,d.onload=f,d.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",void 0}c._bSupportDataURI===!0&&c._fSuccess?c._fSuccess.call(c):c._bSupportDataURI===!1&&c._fFail&&c._fFail.call(c)}if(this._android&&this._android<=2.1){var b=1/window.devicePixelRatio,c=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(a,d,e,f,g,h,i,j){if("nodeName"in a&&/img/i.test(a.nodeName))for(var l=arguments.length-1;l>=1;l--)arguments[l]=arguments[l]*b;else"undefined"==typeof j&&(arguments[1]*=b,arguments[2]*=b,arguments[3]*=b,arguments[4]*=b);c.apply(this,arguments)}}var e=function(a,b){this._bIsPainted=!1,this._android=n(),this._htOption=b,this._elCanvas=document.createElement("canvas"),this._elCanvas.width=b.width,this._elCanvas.height=b.height,a.appendChild(this._elCanvas),this._el=a,this._oContext=this._elCanvas.getContext("2d"),this._bIsPainted=!1,this._elImage=document.createElement("img"),this._elImage.style.display="none",this._el.appendChild(this._elImage),this._bSupportDataURI=null};return e.prototype.draw=function(a){var b=this._elImage,c=this._oContext,d=this._htOption,e=a.getModuleCount(),f=d.width/e,g=d.height/e,h=Math.round(f),i=Math.round(g);b.style.display="none",this.clear();for(var j=0;e>j;j++)for(var k=0;e>k;k++){var l=a.isDark(j,k),m=k*f,n=j*g;c.strokeStyle=l?d.colorDark:d.colorLight,c.lineWidth=1,c.fillStyle=l?d.colorDark:d.colorLight,c.fillRect(m,n,f,g),c.strokeRect(Math.floor(m)+.5,Math.floor(n)+.5,h,i),c.strokeRect(Math.ceil(m)-.5,Math.ceil(n)-.5,h,i)}this._bIsPainted=!0},e.prototype.makeImage=function(){this._bIsPainted&&d.call(this,a)},e.prototype.isPainted=function(){return this._bIsPainted},e.prototype.clear=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1},e.prototype.round=function(a){return a?Math.floor(1e3*a)/1e3:a},e}():function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){for(var b=this._htOption,c=this._el,d=a.getModuleCount(),e=Math.floor(b.width/d),f=Math.floor(b.height/d),g=['<table style="border:0;border-collapse:collapse;">'],h=0;d>h;h++){g.push("<tr>");for(var i=0;d>i;i++)g.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+"px;background-color:"+(a.isDark(h,i)?b.colorDark:b.colorLight)+';"></td>');g.push("</tr>")}g.push("</table>"),c.innerHTML=g.join("");var j=c.childNodes[0],k=(b.width-j.offsetWidth)/2,l=(b.height-j.offsetHeight)/2;k>0&&l>0&&(j.style.margin=l+"px "+k+"px")},a.prototype.clear=function(){this._el.innerHTML=""},a}();QRCode=function(a,b){if(this._htOption={width:256,height:256,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:d.H},"string"==typeof b&&(b={text:b}),b)for(var c in b)this._htOption[c]=b[c];"string"==typeof a&&(a=document.getElementById(a)),this._android=n(),this._el=a,this._oQRCode=null,this._oDrawing=new q(this._el,this._htOption),this._htOption.text&&this.makeCode(this._htOption.text)},QRCode.prototype.makeCode=function(a){this._oQRCode=new b(r(a,this._htOption.correctLevel),this._htOption.correctLevel),this._oQRCode.addData(a),this._oQRCode.make(),this._el.title=a,this._oDrawing.draw(this._oQRCode),this.makeImage()},QRCode.prototype.makeImage=function(){"function"==typeof this._oDrawing.makeImage&&(!this._android||this._android>=3)&&this._oDrawing.makeImage()},QRCode.prototype.clear=function(){this._oDrawing.clear()},QRCode.CorrectLevel=d}();
/*! RESOURCE: ChangeButtonColor */
function changeButtonColor(buttonId, backgroundColor, color, fontWeight, fontStyle)
{
var button = $(buttonId);
if (button) {
button.style.backgroundColor = backgroundColor;
if (color)
button.style.color = color;
if (fontWeight)
button.style.fontWeight = fontWeight;
if (fontStyle)
button.style.fontStyle = fontStyle;
}
}
/*! RESOURCE: HR_Utils_UI */
var HR_Utils_UI = Class.create();
HR_Utils_UI.prototype = {
initialize : function() {
},
validatePhoneNumberForField : function(number, isLoading, phoneField) {
if (isLoading || !number) {
g_form.hideFieldMsg(phoneField, true);
return;
}
var ajax = new GlideAjax('hr_CaseAjax');
ajax.addParam('sysparm_name', 'isPhoneNumberValid');
ajax.addParam('sysparm_phoneNumber', number);
ajax.setWantSessionMessages(false);
ajax.getXMLAnswer(function(answer) {
var result = answer.evalJSON();
if (result.valid) {
if (number != result.number) {
g_form.setValue(phoneField, result.number);
}
} else {
g_form.hideFieldMsg(phoneField, true);
g_form.showErrorBox(phoneField, getMessage('Invalid phone number'));
return;
}
g_form.hideFieldMsg(phoneField, true);
});
},
validatePhoneNumberForFieldSynchronously : function(number, phoneField) {
if (!number) {
g_form.hideFieldMsg(phoneField, true);
return;
}
var isValid = false;
var ajax = new GlideAjax('hr_CaseAjax');
ajax.addParam('sysparm_name', 'isPhoneNumberValid');
ajax.addParam('sysparm_phoneNumber', number);
ajax.setWantSessionMessages(false);
ajax.getXMLWait();
var answer = ajax.getAnswer();
var result = answer.evalJSON();
if (result.valid) {
if (number != result.number) {
g_form.setValue(phoneField, result.number);
}
g_form.hideFieldMsg(phoneField, true);
isValid = true;
} else {
g_form.hideFieldMsg(phoneField, true);
g_form.showErrorBox(phoneField, getMessage('Invalid phone number'));
isValid = false;
}
return isValid;
},
populateContextualSearch : function(searchField) {
function triggerKnowledgeSearch() {
if (!window.NOW || !window.NOW.cxs_searchService) {
window.setTimeout(triggerKnowledgeSearch, 500);
return;
}
var key = document.createEvent('Events');
key.initEvent('keyup', true, true);
key.keyCode = 13;
g_form.getElement(searchField).dispatchEvent(key);
g_form.setDisplay(searchField, false);
}
var gr = new GlideAjax('hr_CaseAjax');
gr.addParam('sysparm_name', 'getCatalogProperties');
gr.addParam('sysparm_catalogId', g_form.getParameter('id'));
gr.getXMLAnswer(function(answer) {
var result = answer.evalJSON();
if (result && result[searchField]) {
g_form.setValue(searchField, result[searchField]);
window.setTimeout(triggerKnowledgeSearch, 100);
}
});
},
catalogAdjustPriorityClientScript : function(control, oldValue, newValue, isLoading) {
if (!newValue)
return;
var userInfo = g_form.getReference('opened_for');
var gr;
if (userInfo.hasOwnProperty('vip') && userInfo.vip == 'true') {
gr = new GlideAjax('hr_CaseAjax');
gr.addParam('sysparm_name', 'getDefaultVIPPriority');
gr.getXMLAnswer(function(answer) {
if (answer)
g_form.setValue('priority', answer);
else
g_form.setValue('priority', '2');
});
} else {
gr = new GlideAjax('hr_CaseAjax');
gr.addParam('sysparm_name', 'getCatalogProperties');
gr.addParam('sysparm_catalogId', g_form.getParameter('id'));
gr.getXMLAnswer(function(answer) {
var result = answer.evalJSON();
if (result && result.priority)
g_form.setValue('priority', result.priority);
else
g_form.setValue('priority', '4');
});
}
},
catalogOpenedForClientScript : function() {
if (g_user.hasRole('hr_case_writer'))
g_form.setReadonly('opened_for', false);
else
g_form.setReadonly('opened_for', true);
},
type : 'HR_Utils_UI'
};
/*! RESOURCE: ProjectDeleteValidator */
var ProjectDeleteValidator = Class.create();
ProjectDeleteValidator.prototype = {
initialize: function(projectIds) {
this._projectIds = projectIds;
this._hasValidationErrors = false;
this._validationMessages = [];
},
validate: function(callback) {
var ajaxHelper = new GlideAjax('AjaxProjectUtil');
ajaxHelper.addParam('sysparm_name', 'canDeleteProjects');
ajaxHelper.addParam('sysparm_sys_ids', this._projectIds);
ajaxHelper.setWantSessionMessages(false);
var that = this;
ajaxHelper.getXMLAnswer(function(answer) {
var results = JSON.parse(answer);
var hasErrors = false;
if (results && results.length > 0) {
for (var i = 0; i < results.length; i++) {
if (results[i].status === "false") {
that._hasValidationErrors = true;
that._validationMessages.push(results[i].statusMessage);
}
}
}
callback.call(that, that);
});
},
hasValidationErrors: function() {
return this._hasValidationErrors === true;
},
getValidationMessages: function(){
return this._validationMessages;
},
type: "ProjectDeleteValidator"
};
/*! RESOURCE: HR_AutoParcoPeople_CHGColorButtons */
setTimeout(changeColor,3000);
function changeColor(){
try{
document.getElementById("autopeo_createrecord").className = "btn btn-success";
document.getElementById("autopeo_setmassivetorenew").className = "btn btn-destructive";
} catch(e){
}
}
/*! RESOURCE: DemandTaskUtil */
var DemandTaskUtil = Class.create();
DemandTaskUtil.prototype = {
initialize: function() {
},
onCompletionCallback : function() {
var category = g_form.getValue('category');
var categoryMsg = 'NA';
if(category == 'resource_estimate')
categoryMsg = getMessage('Resource Plan created for demand successfully');
else if(category == 'cost_estimate')
categoryMsg = getMessage('Cost Plan created for demand successfully');
else if(category == 'benefit_estimate')
categoryMsg = getMessage('Benefit Plan created for demand successfully');
else if(category == 'risk_assessment')
categoryMsg = getMessage('Risk created for demand successfully');
if(categoryMsg != 'NA')
g_form.addInfoMessage(categoryMsg);
},
openDemandTaskCategoryModal: function(title, tableName) {
try {
var demand = g_form.getValue('parent');
if (!demand || demand == null) {
var gr = new GlideRecord("dmn_demand_task");
if (gr.get(g_form.getUniqueValue())) {
demand = gr.getValue('parent');
}
}
if (demand != '') {
var ctm = new GlideModalForm(title, tableName, this.onCompletionCallback);
ctm.setPreference('sysparm_view', 'new');
ctm.setPreference('sysparm_query', 'task=' + demand);
ctm.setSysID(-1);
ctm.setPreference('sysparm_form_only', 'true');
ctm.setPreference('focusTrap', true);
ctm.render();
}
} catch (error) {
jslog('Error while creating record for ' + tableName + '. Error occured : ' + error);
}
},
type: 'DemandTaskUtil',
};
/*! RESOURCE: opEmployeeCitizen.directive.js */
(function(angular){
var app = angular.module('opApp');
app.directive("opEmployeeCitizen", function($timeout){
return {
restrict: 'A',
scope: {
data: '='
},
link: function(scope, element){
var barData = {
labels:scope.data.lable,
datasets: [{
data: scope.data.values
}]
};
var barOptions = {
legend: {
display: false
},
scales: {
xAxes: [{
ticks: {
fontSize: 10,
maxRotation: 90,
minRotation: 80
},
gridLines: {
display:false,
color: "#39b8e8",
lineWidth: 3
},
barPercentage: 0.3
}],
yAxes: [{
ticks: {
beginAtZero: true
},
gridLines: {
display:false
},
display:false
}]
},
responsive: false
};
var config = {
type: 'bar',
data: barData,
options: barOptions
};
$timeout(function(){
var genderChart = new Chart(element[0].getContext("2d"), config);
},1000);
}
};
});
})(window.angular);
/*! RESOURCE: timeline.js */
function initTimeline(timelines,eventsMinDistance) {
timelines.each(function(){
var timeline = $(this),
timelineComponents = {};
timelineComponents['timelineWrapper'] = timeline.find('.events-wrapper');
timelineComponents['eventsWrapper'] = timelineComponents['timelineWrapper'].children('.events');
timelineComponents['fillingLine'] = timelineComponents['eventsWrapper'].children('.filling-line');
timelineComponents['timelineEvents'] = timelineComponents['eventsWrapper'].find('a');
timelineComponents['timelineDates'] = parseDate(timelineComponents['timelineEvents']);
timelineComponents['eventsMinLapse'] = minLapse(timelineComponents['timelineDates']);
timelineComponents['timelineNavigation'] = timeline.find('.cd-timeline-navigation');
timelineComponents['eventsContent'] = timeline.children('.events-content');
setDatePosition(timelineComponents, eventsMinDistance);
var timelineTotWidth = setTimelineWidth(timelineComponents, eventsMinDistance);
timeline.addClass('loaded');
timelineComponents['timelineNavigation'].on('click', '.next', function(event){
event.preventDefault();
updateSlide(timelineComponents, timelineTotWidth, 'next',eventsMinDistance);
});
timelineComponents['timelineNavigation'].on('click', '.prev', function(event){
event.preventDefault();
updateSlide(timelineComponents, timelineTotWidth, 'prev',eventsMinDistance);
});
});
}
function updateSlide(timelineComponents, timelineTotWidth, string, eventsMinDistance) {
var translateValue = getTranslateValue(timelineComponents['eventsWrapper']),
wrapperWidth = Number(timelineComponents['timelineWrapper'].css('width').replace('px', ''));
(string == 'next')
? translateTimeline(timelineComponents, translateValue - wrapperWidth + eventsMinDistance, wrapperWidth - timelineTotWidth)
: translateTimeline(timelineComponents, translateValue + wrapperWidth - eventsMinDistance);
}
function showNewContent(timelineComponents, timelineTotWidth, string) {
var visibleContent =  timelineComponents['eventsContent'].find('.selected');
var newContent = ( string == 'next' ) ? visibleContent.next() : visibleContent.prev();
if ( newContent.length > 0 ) {
var selectedDate = timelineComponents['eventsWrapper'].find('.selected'),
newEvent = ( string == 'next' ) ? selectedDate.parent('li').next('li').children('a') : selectedDate.parent('li').prev('li').children('a');
updateFilling(newEvent, timelineComponents['fillingLine'], timelineTotWidth);
newEvent.addClass('selected');
selectedDate.removeClass('selected');
updateOlderEvents(newEvent);
updateTimelinePosition(string, newEvent, timelineComponents);
}
}
function updateTimelinePosition(string, event, timelineComponents) {
var eventStyle = window.getComputedStyle(event.get(0), null),
eventLeft = Number(eventStyle.getPropertyValue("left").replace('px', '')),
timelineWidth = Number(timelineComponents['timelineWrapper'].css('width').replace('px', '')),
timelineTotWidth = Number(timelineComponents['eventsWrapper'].css('width').replace('px', ''));
var timelineTranslate = getTranslateValue(timelineComponents['eventsWrapper']);
if( (string == 'next' && eventLeft > timelineWidth - timelineTranslate) || (string == 'prev' && eventLeft < - timelineTranslate) ) {
translateTimeline(timelineComponents, - eventLeft + timelineWidth/2, timelineWidth - timelineTotWidth);
}
}
function translateTimeline(timelineComponents, value, totWidth) {
var eventsWrapper = timelineComponents['eventsWrapper'].get(0);
value = (value > 0) ? 0 : value;
value = ( !(typeof totWidth === 'undefined') &&  value < totWidth ) ? totWidth : value;
setTransformValue(eventsWrapper, 'translateX', value+'px');
(value == 0 ) ? timelineComponents['timelineNavigation'].find('.prev').addClass('inactive') : timelineComponents['timelineNavigation'].find('.prev').removeClass('inactive');
(value == totWidth ) ? timelineComponents['timelineNavigation'].find('.next').addClass('inactive') : timelineComponents['timelineNavigation'].find('.next').removeClass('inactive');
}
function updateFilling(selectedEvent, filling, totWidth) {
var eventStyle = window.getComputedStyle(selectedEvent.get(0), null),
eventLeft = eventStyle.getPropertyValue("left"),
eventWidth = eventStyle.getPropertyValue("width");
eventLeft = Number(eventLeft.replace('px', '')) + Number(eventWidth.replace('px', ''))/2;
var scaleValue = eventLeft/totWidth;
setTransformValue(filling.get(0), 'scaleX', scaleValue);
}
function setDatePosition(timelineComponents, min) {
for (i = 0; i < timelineComponents['timelineDates'].length; i++) {
var distance = daydiff(timelineComponents['timelineDates'][0], timelineComponents['timelineDates'][i]),
distanceNorm = Math.round(distance/timelineComponents['eventsMinLapse']) + 2;
timelineComponents['timelineEvents'].eq(i).css('left', distanceNorm*min+'px');
}
}
function setTimelineWidth(timelineComponents, width) {
var timeSpan = daydiff(timelineComponents['timelineDates'][0], timelineComponents['timelineDates'][timelineComponents['timelineDates'].length-1]),
timeSpanNorm = timeSpan/timelineComponents['eventsMinLapse'],
timeSpanNorm = Math.round(timeSpanNorm) + 4,
totalWidth = timeSpanNorm*width;
timelineComponents['eventsWrapper'].css('width', totalWidth+'px');
console.log("TM-EV:"+JSON.stringify(timelineComponents['eventsWrapper'].find('a.selected')));
updateFilling(timelineComponents['eventsWrapper'].find('a.selected'), timelineComponents['fillingLine'], totalWidth);
updateTimelinePosition('next', timelineComponents['eventsWrapper'].find('a.selected'), timelineComponents);
return totalWidth;
}
function updateOlderEvents(event) {
event.parent('li').prevAll('li').children('a').addClass('older-event').end().end().nextAll('li').children('a').removeClass('older-event');
}
function getTranslateValue(timeline) {
var timelineStyle = window.getComputedStyle(timeline.get(0), null),
timelineTranslate = timelineStyle.getPropertyValue("-webkit-transform") ||
timelineStyle.getPropertyValue("-moz-transform") ||
timelineStyle.getPropertyValue("-ms-transform") ||
timelineStyle.getPropertyValue("-o-transform") ||
timelineStyle.getPropertyValue("transform");
if( timelineTranslate.indexOf('(') >=0 ) {
var timelineTranslate = timelineTranslate.split('(')[1];
timelineTranslate = timelineTranslate.split(')')[0];
timelineTranslate = timelineTranslate.split(',');
var translateValue = timelineTranslate[4];
} else {
var translateValue = 0;
}
return Number(translateValue);
}
function setTransformValue(element, property, value) {
element.style["-webkit-transform"] = property+"("+value+")";
element.style["-moz-transform"] = property+"("+value+")";
element.style["-ms-transform"] = property+"("+value+")";
element.style["-o-transform"] = property+"("+value+")";
element.style["transform"] = property+"("+value+")";
}
function parseDate(events) {
var dateArrays = [];
events.each(function(){
var singleDate = $(this),
dateComp = singleDate.data('date').split('T');
if( dateComp.length > 1 ) {
var dayComp = dateComp[0].split('/'),
timeComp = dateComp[1].split(':');
} else if( dateComp[0].indexOf(':') >=0 ) {
var dayComp = ["2000", "0", "0"],
timeComp = dateComp[0].split(':');
} else {
var dayComp = dateComp[0].split('/'),
timeComp = ["0", "0"];
}
var	newDate = new Date(dayComp[2], dayComp[1]-1, dayComp[0], timeComp[0], timeComp[1]);
dateArrays.push(newDate);
});
return dateArrays;
}
function daydiff(first, second) {
return Math.round((second-first));
}
function minLapse(dates) {
var dateDistances = [];
for (i = 1; i < dates.length; i++) {
var distance = daydiff(dates[i-1], dates[i]);
dateDistances.push(distance);
}
return Math.min.apply(null, dateDistances);
}
function elementInViewport(el) {
var top = el.offsetTop;
var left = el.offsetLeft;
var width = el.offsetWidth;
var height = el.offsetHeight;
while(el.offsetParent) {
el = el.offsetParent;
top += el.offsetTop;
left += el.offsetLeft;
}
return (
top < (window.pageYOffset + window.innerHeight) &&
left < (window.pageXOffset + window.innerWidth) &&
(top + height) > window.pageYOffset &&
(left + width) > window.pageXOffset
);
}
function checkMQ() {
return window.getComputedStyle(document.querySelector('.cd-horizontal-timeline'), '::before').getPropertyValue('content').replace(/'/g, "").replace(/"/g, "");
}
/*! RESOURCE: tm_AddToTestPlanHandler */
var tm_AddToTestPlanHandler = Class.create({
initialize: function(gr) {
this._gr=gr;
this._isList = (gr.type+""=="GlideList2");
this._tableName         = this._gr.getTableName();
this._prmErr = [];
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
this._mstrDlg = new dialogClass("tm_ref_choose_dialog");
var titleMsg = '';
if(this._gr.getTableName() == 'tm_test_case') {
titleMsg = getMessage("Add Case(s) to Test Plan");
} else if (this._gr.getTableName() == 'tm_test_suite') {
titleMsg = getMessage("Add Suite(s) to Test Plan");
}
this._mstrDlg.setTitle(titleMsg);
this._mstrDlg.setPreference("sysparam_field_label", getMessage("Test Plan"));
this._mstrDlg.setPreference("sysparam_reference_table","tm_test_plan");
this._mstrDlg.setPreference("sysparam_query","active=true");
this._mstrDlg.setPreference("handler",this);
},
showDialog: function() {
this._mstrDlg.render();
},
onSubmit: function() {
var testPlanId = this._getValue('tm_test_plan_ref');
if (!this._validate()) {
return false;
}
this._mstrDlg.destroy();
if(testPlanId) {
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
this._plsWtDlg = new dialogClass("tm_wait_dialog");
this._plsWtDlg.setTitle(getMessage("Working.  Please wait."));
this._plsWtDlg.render();
var ga = new GlideAjax("tm_AjaxProcessor");
ga.addParam('sysparm_name','addToTestPlan');
ga.addParam('sysparm_sys_id', this._isList ? this._gr.getChecked() : this._gr.getUniqueValue());
ga.addParam('sysparm_tm_test_plan', testPlanId);
ga.addParam('sysparm_tn', this._tableName);
ga.getXML(this.callback.bind(this));
}
return false;
},
callback: function(response) {
this._plsWtDlg.destroy();
var resp = response.responseXML.getElementsByTagName("result");
if (resp[0] && resp[0].getAttribute("status") == "success") {
return false;
} else {
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
this._createError = new dialogClass("tm_error_dialog");
this._createError.setTitle(getMessage("Error while adding Test Cases from selected Test Suite."));
this._createError.render();
}
},
_refreshRelatedList: function() {
this._gForm.setFilterAndRefresh('');
},
_validate: function() {
var valid = true;
this._prmErr = [];
if(!this._isList)
this._removeAllError('tm_ref_choose_dialog');
if (this._getValue('tm_test_plan_ref') == 'undefined' || this._getValue('tm_test_plan_ref').trim() == "") {
this._prmErr.push(getMessage("Select Test Plan"));
if(!this._isList)
this._showFieldError('ref_test_suite_field',this._prmErr[0]);
valid = false;
}
return valid;
},
_removeAllError: function(dialogName) {
$$('#'+dialogName+' .form-group.has-error').each(function(item){
$(item).removeClassName('has-error');
$(item).down('.help-block').setStyle({'display':'none'});
});
},
_showFieldError: function(groupId,message) {
var $group = $(groupId);
var $helpBlock = $group.down('.help-block');
if(!$group.hasClassName('has-error'))
$group.addClassName('has-error');
if($helpBlock.getStyle('display')!='inline-block'){
$helpBlock.update(message);
$helpBlock.setStyle({'display':'inline-block'});
}
},
_getValue: function(inptNm) {
return gel(inptNm).value;
},
type: "tm_AddToTestPlanHandler"
});
/*! RESOURCE: GwtDateTimePickerFix */
addLoadEvent(function() {
if (typeof window.GwtDateTimePicker != 'undefined') {
window.GwtDateTimePicker.prototype.initialize = function(dateFieldId, dateTimeFormat, includeTime, positionElement, defaultValue) {
this.dayCells = [];
this.cleanup = [];
this._getMessages();
this.includeTime = includeTime;
this.firstDay = Math.min(Math.max(g_date_picker_first_day_of_week - 1, 0), 6);
if(isDoctype()) {
this.modalParent = $j(positionElement || gel(dateFieldId)).parents('.modal');
this.isInModal = !!this.modalParent.length;
if(this.isInModal) {
this.isInModalForm = !!$j(positionElement || gel(dateFieldId))
.parents('[id*=".form_scroll"]')
.parents('.modal').length;
}
}
GlideWindow.prototype.initialize.call(this, "GwtDateTimePicker", true);
this.dateFieldId = dateFieldId;
var dateField = $(dateFieldId);
if (!defaultValue)
defaultValue = dateField.value;
this.selectedDate = getUserDateTime();
if (defaultValue) {
var ms = getDateFromFormat(defaultValue, dateTimeFormat);
if (ms > 0)
this.selectedDate = new Date(ms);
}
this.date = new Date(this.selectedDate);
this.setFormat(dateTimeFormat);
this.removeBody();
this.clearSpacing();
this.canFocus = false;
this._createControls();
if (positionElement)
this._moveToPosition(positionElement);
else if (dateField.next() && dateField.next().type && dateField.next().type != 'hidden')
this._moveToPosition(dateField.next());
else
this._moveToPosition(dateField);
this.setZIndex(10000);
this.setShim(true);
this._shimResize();
this.keyUpFunc = this.onKeyUp.bind(this);
Event.observe(this.window, "keypress",  this.keyUpFunc);
Event.observe(document, "keypress",  this.keyUpFunc);
Event.observe(window.self, 'beforeunload', this.preventPageLeaveConfirmDialog);
this.mouseUpFunc = this.onMouseUp.bindAsEventListener(this);
Event.observe(document, "mouseup", this.mouseUpFunc);
this.canFocus = true;
this.focusEditor();
};
}
});
/*! RESOURCE: GlideRecordAdvanced */
function GlideRecordAdvanced( table_name, encoded_query , field_list , other_param_obj) {
var log = 'SCA API: GlideRecordAdvanced';
if (!table_name)
{
alert("The GlideRecordAdvanced() function requires a Table Name to be passed.");
return;
}
if (!encoded_query)
{
alert("The GlideRecordAdvanced() function requires an Encoded Query to be passed.");
return;
}
if(!field_list)
{
alert("The GlideRecordAdvanced() function requires a Fields List to be passed.");
return;
}
field_list = field_list.replace(/;/g , ",");
var orderByType = 'null';
if( other_param_obj)
orderByType = other_param_obj.orderByType;
var orderByField = 'null';
if( other_param_obj)
orderByField = other_param_obj.orderByField;
log+= '\n table_name: '+table_name;
log+= '\n encoded_query: '+encoded_query;
log+= '\n orderByField: '+orderByField;
log+= '\n orderByType: '+orderByType;
var response_parsed = '';
var max_offset = 100;
for(var index_offset=0; index_offset < max_offset; index_offset++)
{
var response_text = '';
try
{
var restEndPoint = "api/eneld/gliderecordadvanced/";
restEndPoint = restEndPoint + table_name + "/" + encoded_query + "/" + index_offset + "/" + field_list + "/" + orderByType + "/" + orderByField;
var serverRequest = new XMLHttpRequest();
serverRequest.open("get", restEndPoint, false);
serverRequest.setRequestHeader("X-UserToken", g_ck);
serverRequest.setRequestHeader("Accept", "application/json");
serverRequest.setRequestHeader("Content-Type", "application/json");
serverRequest.send();
if (serverRequest.status === 200)
{
response_text = serverRequest.responseText;
var serverResponse = JSON.parse(serverRequest.response);
if (serverResponse.result == "error")
{
alert("The GlideRecordAdvanced encountered an error retrieving the data. Missing API input paramters");
return;
}
else
{
var response_string = serverResponse.result;
if(response_string == '[]' || response_string == '')
break;
if(response_parsed == '')
response_parsed = JSON.parse(response_string);
else
{
var response_parsed_2 = JSON.parse(response_string);
response_parsed = response_parsed.concat(response_parsed_2);
}
}
}
}
catch(e)
{
alert("The GlideRecordAdvanced encountered an error retrieving the data: "+ e + "\nResponse:"+response_text);
response_parsed = '';
}
}
log+= '\n index_offset: '+index_offset;
console.log(log);
return response_parsed;
}
/*! RESOURCE: upfVirtualRoomCart.js */
(function(angular) {
var app = angular.module('upfApp');
var TEMPLATE=
'<div class="virtual-room">' +
'<div>' +
'<a href="">' + '<span class="fa fa-pencil-square-o fa-2x pull-right" aria-hidden="true" name="edit" size="2">' + '</a>' +
'</div>' +
'<div class="room-name">' +
'<h4>' + '{{c.roomName}}' + '</h4>' +
'</div>' +
'<div class="info-item">' +
'<div class="info-label">' +
'Internal VRM address'+
'</div>' +
'<div class="info-value">' +
'{{c.inVrmAddress}}'+
'</div>' +
'</div>' +
'<div class="info-item">' +
'<div class="info-label">' +
'External VRM adress'+
'</div>' +
'<div class="info-value">' +
'{{c.exVrmAddress}}' +
'</div>' +
'</div>' +
'<div class="info-item">' +
'<div class="info-label">' +
'Chaiperson code'+
'</div>' +
'<div class="info-value">' +
'{{c.chaipCode1}}'+
'</div>' +
'</div>' +
'<div class="info-item">' +
'<div class="info-label">' +
'Chaiperson code'+
'</div>' +
'<div class="info-value">' +
'{{c.chaipCode2}}'+
'</div>' +
'</div>' +
'</div>'
;
app.component("upfVirtualCard", {
template: TEMPLATE,
bindings: {
"roomName": "@",
"inVrmAddress": "@",
"exVrmAddress": "@",
"chaipCode1": "@",
"chaipCode2": "@",
},
controller: upfVirtualCardFn,
controllerAs : 'c'
});
function upfVirtualCardFn() {
var c = this;
}
})(window.angular);
/*! RESOURCE: AddScrumTask */
var AddScrumTask = Class.create();
AddScrumTask.prototype = {
initialize: function () {
this.list = (typeof g_list != "undefined") ? g_list : null;
this.storyID = (typeof rowSysId == 'undefined' || rowSysId == null) ? (gel('sys_uniqueValue') ? gel('sys_uniqueValue').value : "") : rowSysId;
this.setUpFacade();
this.setUpEvents();
this.display(true);
this.checkOKButton();
this.focusFirstSelectElement();
},
toggleOKButton: function(visible) {
$("ok").style.display = (visible?"inline":"none");
},
setUpFacade: function () {
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
this.dialog = new dialogClass("task_window");
this.dialog.setTitle(getMessage("Add Scrum Tasks"));
var mapCount = this.getTypeCounts();
this.dialog.setBody(this.getMarkUp(mapCount), false, false);
},
checkOKButton: function() {
var visible = false;
var self = this;
$('task_window').select("select").each(function(elem) {
if (elem.value + "" != "0") visible = true;
if (!elem.onChangeAdded) {
elem.onChangeAdded = true;
elem.on("change", function() {
self.checkOKButton();
});
}
});
this.toggleOKButton(visible);
},
focusFirstSelectElement: function() {
$('task_window').select("select")[0].focus();
},
getTypeCounts: function() {
var mapLabel = this.getLabels("rm_scrum_task", "type");
var mapCount = {};
for (var strKey in mapLabel) {
mapCount[strKey] = getPreference("com.snc.sdlc.scrum.pp.tasks." + strKey, 0);
}
return mapCount;
},
setUpEvents: function () {
var self = this, dialog = this.dialog;
$("ok").on("click", function () {
var mapTaskData = {};
if (self.fillDataMap(mapTaskData)) {
var taskProducer = new GlideAjax("ScrumAjaxTaskProducer");
for (var strKey in mapTaskData) {
taskProducer.addParam("sysparm_" + encodeURIComponent(strKey), mapTaskData[strKey]);
}
self.showStatus("Adding tasks...");
taskProducer.getXML(function () {
self.refresh();
dialog.destroy();
});
} else {
dialog.destroy();
}
});
$("cancel").on("click", function () {
dialog.destroy();
});
},
refresh: function() {
if (this.list) this.list.refresh();
else {
var tableName = 'rm_story';
if(g_form)
tableName = g_form.tableName;
this.reloadList(tableName + ".rm_scrum_task.story");
}
},
getSysID: function() {
return this.storyID;
},
fillDataMap: function (mapTaskData) {
var bTasksRequired = false;
mapTaskData.name = "createTasks";
mapTaskData.sys_id = this.getSysID();
var mapDetails = this.getLabels("rm_scrum_task", "type");
var arrTaskTypes = [];
for (var key in mapDetails) {
arrTaskTypes.push(key);
}
for (var nSlot = 0; nSlot < arrTaskTypes.length; ++nSlot) {
var strTaskType = arrTaskTypes[nSlot];
var strTaskData = $(strTaskType).getValue();
mapTaskData[strTaskType] = strTaskData;
setPreference("com.snc.sdlc.scrum.pp.tasks." + strTaskType, strTaskData);
if (strTaskData != "0") {
bTasksRequired = true;
}
}
return bTasksRequired;
},
getMarkUp: function (mapCounts) {
function getSelectMarkUp(strFieldId, nValue) {
var strMarkUp = '<select class="form-control select2" id="' + strFieldId + '" name="' + strFieldId + '">';
for (var nSlot = 0; nSlot <= 10; nSlot++) {
if (nValue != 0 && nValue == nSlot) {
strMarkUp += '<option value="'+nSlot+'" selected="selected">'+nSlot+'</option>';
} else {
strMarkUp += '<option value="'+nSlot+'">'+nSlot+'</option>';
}
}
strMarkUp += "</select>";
return strMarkUp;
}
function buildRow(strMessage, nValue) {
var row = '';
row += '<div class="row" style="padding-top:10px;">';
row +=     '<div class="form-group">';
row +=         '<label class="control-label col-sm-3" for="'+strMessage+'" style="white-space:nowrap;">';
row +=             strMessage;
row +=         '</label>';
row +=         '<span class="col-sm-9">';
row +=             getSelectMarkUp(strMessage, nValue);
row +=         '</span>';
row +=     '</div>';
row += '</div>';
return row;
}
function buildTable(mapDetails, mapCounts) {
var arrDetails = [];
for (var strKey in mapDetails) {
arrDetails.push(strKey + "");
}
arrDetails.sort();
var strBuf = '';
for (var index = 0; index < arrDetails.length; ++index) {
var nCount = mapCounts[arrDetails[index]];
strBuf += buildRow(arrDetails[index], nCount);
}
strBuf += '';
return strBuf;
}
var mapLabels = this.getLabels("rm_scrum_task", "type");
return buildTable(mapLabels, mapCounts) + "<div id='task_controls' style='text-align:right;padding-top:20px;'>" +
"<button id='cancel' type='button' class='btn btn-default'>" + getMessage('Cancel') + "</button>" +
"&nbsp;&nbsp;<button id='ok' type='button' class='btn btn-primary'>" + getMessage('OK') + "</button></div>";
},
reloadForm: function () {
document.location.href = document.location.href;
},
reloadList: function (strListName) {
if(typeof GlideList2 === 'undefined')
return;
var list = GlideList2.get(strListName);
if(list)
list.refresh();
},
showStatus: function (strMessage) {
$("task_controls").update("Loading...");
},
display: function(bIsVisible) {
$("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
},
getLabels: function(strTable, strAttribute) {
var taskProducer = new GlideAjax("ScrumAjaxTaskProducer");
taskProducer.addParam("sysparm_name" ,"getLabels");
taskProducer.addParam("sysparm_table", strTable);
taskProducer.addParam("sysparm_attribute", strAttribute);
var result = taskProducer.getXMLWait();
return this._parseResponse(result);
},
_parseResponse: function(resultXML) {
var jsonStr = resultXML.documentElement.getAttribute("answer");
var map = JSON.parse(jsonStr);
return map;
}
};
/*! RESOURCE: prototype-barcode */
var Barcode = {
settings:{
barWidth: 1,
barHeight: 50,
moduleSize: 5,
showHRI: true,
addQuietZone: true,
marginHRI: 5,
bgColor: "#FFFFFF",
color: "#000000",
fontSize: 10,
output: "css",
posX: 0,
posY: 0
},
intval: function(val){
var type = typeof( val );
if (type == 'string'){
val = val.replace(/[^0-9-.]/g, "");
val = parseInt(val * 1, 10);
return isNaN(val) || !isFinite(val) ? 0 : val;
}
return type == 'number' && isFinite(val) ? Math.floor(val) : 0;
},
i25: {
encoding: ["NNWWN", "WNNNW", "NWNNW", "WWNNN", "NNWNW", "WNWNN", "NWWNN", "NNNWW", "WNNWN","NWNWN"],
compute: function(code, crc, type){
if (! crc) {
if (code.length % 2 != 0) code = '0' + code;
} else {
if ( (type == "int25") && (code.length % 2 == 0) ) code = '0' + code;
var odd = true, v, sum = 0;
for(var i=code.length-1; i>-1; i--){
v = Barcode.intval(code.charAt(i));
if (isNaN(v)) return("");
sum += odd ? 3 * v : v;
odd = ! odd;
}
code += ((10 - sum % 10) % 10).toString();
}
return(code);
},
getDigit: function(code, crc, type){
code = this.compute(code, crc, type);
if (code == "") return("");
result = "";
var i, j;
if (type == "int25") {
result += "1010";
var c1, c2;
for(i=0; i<code.length / 2; i++){
c1 = code.charAt(2*i);
c2 = code.charAt(2*i+1);
for(j=0; j<5; j++){
result += '1';
if (this.encoding[c1].charAt(j) == 'W') result += '1';
result += '0';
if (this.encoding[c2].charAt(j) == 'W') result += '0';
}
}
result += "1101";
} else if (type == "std25") {
result += "11011010";
var c;
for(i=0; i<code.length; i++){
c = code.charAt(i);
for(j=0; j<5; j++){
result += '1';
if (this.encoding[c].charAt(j) == 'W') result += "11";
result += '0';
}
}
result += "11010110";
}
return(result);
}
},
ean: {
encoding: [ ["0001101", "0100111", "1110010"],
["0011001", "0110011", "1100110"],
["0010011", "0011011", "1101100"],
["0111101", "0100001", "1000010"],
["0100011", "0011101", "1011100"],
["0110001", "0111001", "1001110"],
["0101111", "0000101", "1010000"],
["0111011", "0010001", "1000100"],
["0110111", "0001001", "1001000"],
["0001011", "0010111", "1110100"] ],
first:  ["000000","001011","001101","001110","010011","011001","011100","010101","010110","011010"],
getDigit: function(code, type){
var len = type == "ean8" ? 7 : 12;
code = code.substring(0, len);
if (code.length != len) return("");
var c;
for(var i=0; i<code.length; i++){
c = code.charAt(i);
if ( (c < '0') || (c > '9') ) return("");
}
code = this.compute(code, type);
var result = "101";
if (type == "ean8"){
for(var i=0; i<4; i++){
result += this.encoding[Barcode.intval(code.charAt(i))][0];
}
result += "01010";
for(var i=4; i<8; i++){
result += this.encoding[Barcode.intval(code.charAt(i))][2];
}
} else {
var seq = this.first[ Barcode.intval(code.charAt(0)) ];
for(var i=1; i<7; i++){
result += this.encoding[Barcode.intval(code.charAt(i))][ Barcode.intval(seq.charAt(i-1)) ];
}
result += "01010";
for(var i=7; i<13; i++){
result += this.encoding[Barcode.intval(code.charAt(i))][ 2 ];
}
}
result += "101";
return(result);
},
compute: function (code, type){
var len = type == "ean13" ? 12 : 7;
code = code.substring(0, len);
var sum = 0, odd = true;
for(i=code.length-1; i>-1; i--){
sum += (odd ? 3 : 1) * Barcode.intval(code.charAt(i));
odd = ! odd;
}
return(code + ((10 - sum % 10) % 10).toString());
}
},
upc: {
getDigit: function(code){
if (code.length < 12) {
code = '0' + code;
}
return Barcode.ean.getDigit(code, 'ean13');
},
compute: function (code){
if (code.length < 12) {
code = '0' + code;
}
return Barcode.ean.compute(code, 'ean13').substr(1);
}
},
msi: {
encoding:["100100100100", "100100100110", "100100110100", "100100110110",
"100110100100", "100110100110", "100110110100", "100110110110",
"110100100100", "110100100110"],
compute: function(code, crc){
if (typeof(crc) == "object"){
if (crc.crc1 == "mod10"){
code = this.computeMod10(code);
} else if (crc.crc1 == "mod11"){
code = this.computeMod11(code);
}
if (crc.crc2 == "mod10"){
code = this.computeMod10(code);
} else if (crc.crc2 == "mod11"){
code = this.computeMod11(code);
}
} else if (typeof(crc) == "boolean"){
if (crc) code = this.computeMod10(code);
}
return(code);
},
computeMod10:function(code){
var i,
toPart1 = code.length % 2;
var n1 = 0, sum = 0;
for(i=0; i<code.length; i++){
if (toPart1) {
n1 = 10 * n1 + Barcode.intval(code.charAt(i));
} else {
sum += Barcode.intval(code.charAt(i));
}
toPart1 = ! toPart1;
}
var s1 = (2 * n1).toString();
for(i=0; i<s1.length; i++){
sum += Barcode.intval(s1.charAt(i));
}
return(code + ((10 - sum % 10) % 10).toString());
},
computeMod11:function(code){
var sum = 0, weight = 2;
for(var i=code.length-1; i>=0; i--){
sum += weight * Barcode.intval(code.charAt(i));
weight = weight == 7 ? 2 : weight + 1;
}
return(code + ((11 - sum % 11) % 11).toString());
},
getDigit: function(code, crc){
var table = "0123456789";
var index = 0;
var result = "";
code = this.compute(code, false);
result = "110";
for(i=0; i<code.length; i++){
index = table.indexOf( code.charAt(i) );
if (index < 0) return("");
result += this.encoding[ index ];
}
result += "1001";
return(result);
}
},
code11: {
encoding:[  "101011", "1101011", "1001011", "1100101",
"1011011", "1101101", "1001101", "1010011",
"1101001", "110101", "101101"],
getDigit: function(code){
var table = "0123456789-";
var i, index, result = "", intercharacter = '0'
result = "1011001" + intercharacter;
for(i=0; i<code.length; i++){
index = table.indexOf( code.charAt(i) );
if (index < 0) return("");
result += this.encoding[ index ] + intercharacter;
}
var weightC    = 0,
weightSumC = 0,
weightK    = 1,
weightSumK   = 0;
for(i=code.length-1; i>=0; i--){
weightC = weightC == 10 ? 1 : weightC + 1;
weightK = weightK == 10 ? 1 : weightK + 1;
index = table.indexOf( code.charAt(i) );
weightSumC += weightC * index;
weightSumK += weightK * index;
}
var c = weightSumC % 11;
weightSumK += c;
var k = weightSumK % 11;
result += this.encoding[c] + intercharacter;
if (code.length >= 10){
result += this.encoding[k] + intercharacter;
}
result  += "1011001";
return(result);
}
},
code39: {
encoding:["101001101101", "110100101011", "101100101011", "110110010101",
"101001101011", "110100110101", "101100110101", "101001011011",
"110100101101", "101100101101", "110101001011", "101101001011",
"110110100101", "101011001011", "110101100101", "101101100101",
"101010011011", "110101001101", "101101001101", "101011001101",
"110101010011", "101101010011", "110110101001", "101011010011",
"110101101001", "101101101001", "101010110011", "110101011001",
"101101011001", "101011011001", "110010101011", "100110101011",
"110011010101", "100101101011", "110010110101", "100110110101",
"100101011011", "110010101101", "100110101101", "100100100101",
"100100101001", "100101001001", "101001001001", "100101101101"],
getDigit: function(code){
var table = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%*";
var i, index, result="", intercharacter='0';
if (code.indexOf('*') >= 0) return("");
code = ("*" + code + "*").toUpperCase();
for(i=0; i<code.length; i++){
index = table.indexOf( code.charAt(i) );
if (index < 0) return("");
if (i > 0) result += intercharacter;
result += this.encoding[ index ];
}
return(result);
}
},
code93:{
encoding:["100010100", "101001000", "101000100", "101000010",
"100101000", "100100100", "100100010", "101010000",
"100010010", "100001010", "110101000", "110100100",
"110100010", "110010100", "110010010", "110001010",
"101101000", "101100100", "101100010", "100110100",
"100011010", "101011000", "101001100", "101000110",
"100101100", "100010110", "110110100", "110110010",
"110101100", "110100110", "110010110", "110011010",
"101101100", "101100110", "100110110", "100111010",
"100101110", "111010100", "111010010", "111001010",
"101101110", "101110110", "110101110", "100100110",
"111011010", "111010110", "100110010", "101011110"],
getDigit: function(code, crc){
var table = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%____*",
c, result = "";
if (code.indexOf('*') >= 0) return("");
code = code.toUpperCase();
result  += this.encoding[47];
for(i=0; i<code.length; i++){
c = code.charAt(i);
index = table.indexOf( c );
if ( (c == '_') || (index < 0) ) return("");
result += this.encoding[ index ];
}
if (crc){
var weightC    = 0,
weightSumC = 0,
weightK    = 1,
weightSumK   = 0;
for(i=code.length-1; i>=0; i--){
weightC = weightC == 20 ? 1 : weightC + 1;
weightK = weightK == 15 ? 1 : weightK + 1;
index = table.indexOf( code.charAt(i) );
weightSumC += weightC * index;
weightSumK += weightK * index;
}
var c = weightSumC % 47;
weightSumK += c;
var k = weightSumK % 47;
result += this.encoding[c];
result += this.encoding[k];
}
result  += this.encoding[47];
result  += '1';
return(result);
}
},
code128: {
encoding:["11011001100", "11001101100", "11001100110", "10010011000",
"10010001100", "10001001100", "10011001000", "10011000100",
"10001100100", "11001001000", "11001000100", "11000100100",
"10110011100", "10011011100", "10011001110", "10111001100",
"10011101100", "10011100110", "11001110010", "11001011100",
"11001001110", "11011100100", "11001110100", "11101101110",
"11101001100", "11100101100", "11100100110", "11101100100",
"11100110100", "11100110010", "11011011000", "11011000110",
"11000110110", "10100011000", "10001011000", "10001000110",
"10110001000", "10001101000", "10001100010", "11010001000",
"11000101000", "11000100010", "10110111000", "10110001110",
"10001101110", "10111011000", "10111000110", "10001110110",
"11101110110", "11010001110", "11000101110", "11011101000",
"11011100010", "11011101110", "11101011000", "11101000110",
"11100010110", "11101101000", "11101100010", "11100011010",
"11101111010", "11001000010", "11110001010", "10100110000",
"10100001100", "10010110000", "10010000110", "10000101100",
"10000100110", "10110010000", "10110000100", "10011010000",
"10011000010", "10000110100", "10000110010", "11000010010",
"11001010000", "11110111010", "11000010100", "10001111010",
"10100111100", "10010111100", "10010011110", "10111100100",
"10011110100", "10011110010", "11110100100", "11110010100",
"11110010010", "11011011110", "11011110110", "11110110110",
"10101111000", "10100011110", "10001011110", "10111101000",
"10111100010", "11110101000", "11110100010", "10111011110",
"10111101110", "11101011110", "11110101110", "11010000100",
"11010010000", "11010011100", "11000111010"],
getDigit: function(code){
var tableB = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
var result = "";
var sum = 0;
var isum = 0;
var i = 0;
var j = 0;
var value = 0;
for(i=0; i<code.length; i++){
if (tableB.indexOf(code.charAt(i)) == -1) return("");
}
var tableCActivated = code.length > 1;
var c = '';
for(i=0; i<3 && i<code.length; i++){
c = code.charAt(i);
tableCActivated &= c >= '0' && c <= '9';
}
sum = tableCActivated ? 105 : 104;
result = this.encoding[ sum ];
i = 0;
while( i < code.length ){
if (! tableCActivated){
j = 0;
while ( (i + j < code.length) && (code.charAt(i+j) >= '0') && (code.charAt(i+j) <= '9') ) j++;
tableCActivated = (j > 5) || ((i + j - 1 == code.length) && (j > 3));
if ( tableCActivated ){
result += this.encoding[ 99 ];
sum += ++isum * 99;
}
} else if ( (i == code.length) || (code.charAt(i) < '0') || (code.charAt(i) > '9') || (code.charAt(i+1) < '0') || (code.charAt(i+1) > '9') ) {
tableCActivated = false;
result += this.encoding[ 100 ];
sum += ++isum * 100;
}
if ( tableCActivated ) {
value = Barcode.intval(code.charAt(i) + code.charAt(i+1));
i += 2;
} else {
value = tableB.indexOf( code.charAt(i) );
i += 1;
}
result  += this.encoding[ value ];
sum += ++isum * value;
}
result  += this.encoding[ sum % 103 ];
result += this.encoding[106];
result += "11";
return(result);
}
},
codabar: {
encoding:["101010011", "101011001", "101001011", "110010101",
"101101001", "110101001", "100101011", "100101101",
"100110101", "110100101", "101001101", "101100101",
"1101011011", "1101101011", "1101101101", "1011011011",
"1011001001", "1010010011", "1001001011", "1010011001"],
getDigit: function(code){
var table = "0123456789-$:/.+";
var i, index, result="", intercharacter = '0';
result += this.encoding[16] + intercharacter;
for(i=0; i<code.length; i++){
index = table.indexOf( code.charAt(i) );
if (index < 0) return("");
result += this.encoding[ index ] + intercharacter;
}
result += this.encoding[16];
return(result);
}
},
datamatrix: {
lengthRows:       [ 10, 12, 14, 16, 18, 20, 22, 24, 26,
32, 36, 40, 44, 48, 52, 64, 72, 80,  88, 96, 104, 120, 132, 144,
8, 8, 12, 12, 16, 16],
lengthCols:       [ 10, 12, 14, 16, 18, 20, 22, 24, 26,
32, 36, 40, 44, 48, 52, 64, 72, 80, 88, 96, 104, 120, 132, 144,
18, 32, 26, 36, 36, 48],
dataCWCount:      [ 3, 5, 8, 12,  18,  22,  30,  36,
44, 62, 86, 114, 144, 174, 204, 280, 368, 456, 576, 696, 816, 1050,
1304, 1558, 5, 10, 16, 22, 32, 49],
solomonCWCount:   [ 5, 7, 10, 12, 14, 18, 20, 24, 28,
36, 42, 48, 56, 68, 84, 112, 144, 192, 224, 272, 336, 408, 496, 620,
7, 11, 14, 18, 24, 28],
dataRegionRows:   [ 8, 10, 12, 14, 16, 18, 20, 22,
24, 14, 16, 18, 20, 22, 24, 14, 16, 18, 20, 22, 24, 18, 20, 22,
6,  6, 10, 10, 14, 14],
dataRegionCols:   [ 8, 10, 12, 14, 16, 18, 20, 22,
24, 14, 16, 18, 20, 22, 24, 14, 16, 18, 20, 22, 24, 18, 20, 22,
16, 14, 24, 16, 16, 22],
regionRows:       [ 1, 1, 1, 1, 1, 1, 1, 1,
1, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 6, 6, 6,
1, 1, 1, 1, 1, 1],
regionCols:       [ 1, 1, 1, 1, 1, 1, 1, 1,
1, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 6, 6, 6,
1, 2, 1, 2, 2, 2],
interleavedBlocks:[ 1, 1, 1, 1, 1, 1, 1, 1,
1, 1, 1, 1, 1, 1, 2, 2, 4, 4, 4, 4, 6, 6, 8, 8,
1, 1, 1, 1, 1, 1],
logTab:           [ -255, 255, 1, 240, 2, 225, 241, 53, 3,
38, 226, 133, 242, 43, 54, 210, 4, 195, 39, 114, 227, 106, 134, 28,
243, 140, 44, 23, 55, 118, 211, 234, 5, 219, 196, 96, 40, 222, 115,
103, 228, 78, 107, 125, 135, 8, 29, 162, 244, 186, 141, 180, 45, 99,
24, 49, 56, 13, 119, 153, 212, 199, 235, 91, 6, 76, 220, 217, 197,
11, 97, 184, 41, 36, 223, 253, 116, 138, 104, 193, 229, 86, 79, 171,
108, 165, 126, 145, 136, 34, 9, 74, 30, 32, 163, 84, 245, 173, 187,
204, 142, 81, 181, 190, 46, 88, 100, 159, 25, 231, 50, 207, 57, 147,
14, 67, 120, 128, 154, 248, 213, 167, 200, 63, 236, 110, 92, 176, 7,
161, 77, 124, 221, 102, 218, 95, 198, 90, 12, 152, 98, 48, 185, 179,
42, 209, 37, 132, 224, 52, 254, 239, 117, 233, 139, 22, 105, 27, 194,
113, 230, 206, 87, 158, 80, 189, 172, 203, 109, 175, 166, 62, 127,
247, 146, 66, 137, 192, 35, 252, 10, 183, 75, 216, 31, 83, 33, 73,
164, 144, 85, 170, 246, 65, 174, 61, 188, 202, 205, 157, 143, 169, 82,
72, 182, 215, 191, 251, 47, 178, 89, 151, 101, 94, 160, 123, 26, 112,
232, 21, 51, 238, 208, 131, 58, 69, 148, 18, 15, 16, 68, 17, 121, 149,
129, 19, 155, 59, 249, 70, 214, 250, 168, 71, 201, 156, 64, 60, 237,
130, 111, 20, 93, 122, 177, 150],
aLogTab:          [ 1, 2, 4, 8, 16, 32, 64, 128, 45, 90,
180, 69, 138, 57, 114, 228, 229, 231, 227, 235, 251, 219, 155, 27, 54,
108, 216, 157, 23, 46, 92, 184, 93, 186, 89, 178, 73, 146, 9, 18, 36,
72, 144, 13, 26, 52, 104, 208, 141, 55, 110, 220, 149, 7, 14, 28, 56,
112, 224, 237, 247, 195, 171, 123, 246, 193, 175, 115, 230, 225, 239,
243, 203, 187, 91, 182, 65, 130, 41, 82, 164, 101, 202, 185, 95, 190,
81, 162, 105, 210, 137, 63, 126, 252, 213, 135, 35, 70, 140, 53, 106,
212, 133, 39, 78, 156, 21, 42, 84, 168, 125, 250, 217, 159, 19, 38, 76,
152, 29, 58, 116, 232, 253, 215, 131, 43, 86, 172, 117, 234, 249, 223,
147, 11, 22, 44, 88, 176, 77, 154, 25, 50, 100, 200, 189, 87, 174, 113,
226, 233, 255, 211, 139, 59, 118, 236, 245, 199, 163, 107, 214, 129,
47, 94, 188, 85, 170, 121, 242, 201, 191, 83, 166, 97, 194, 169, 127,
254, 209, 143, 51, 102, 204, 181, 71, 142, 49, 98, 196, 165, 103, 206,
177, 79, 158, 17, 34, 68, 136, 61, 122, 244, 197, 167, 99, 198, 161,
111, 222, 145, 15, 30, 60, 120, 240, 205, 183, 67, 134, 33, 66, 132,
37, 74, 148, 5, 10, 20, 40, 80, 160, 109, 218, 153, 31, 62, 124, 248,
221, 151, 3, 6, 12, 24, 48, 96, 192, 173, 119, 238, 241, 207, 179, 75,
150, 1],
champGaloisMult: function(a, b){
if(!a || !b) return 0;
return this.aLogTab[(this.logTab[a] + this.logTab[b]) % 255];
},
champGaloisDoub: function(a, b){
if (!a) return 0;
if (!b) return a;
return this.aLogTab[(this.logTab[a] + b) % 255];
},
champGaloisSum: function(a, b){
return a ^ b;
},
selectIndex: function(dataCodeWordsCount, rectangular){
if ((dataCodeWordsCount<1 || dataCodeWordsCount>1558) && !rectangular) return -1;
if ((dataCodeWordsCount<1 || dataCodeWordsCount>49) && rectangular)  return -1;
var n = 0;
if ( rectangular ) n = 24;
while (this.dataCWCount[n] < dataCodeWordsCount) n++;
return n;
},
encodeDataCodeWordsASCII: function(text) {
var dataCodeWords = new Array();
var n = 0, i, c;
for (i=0; i<text.length; i++){
c = text.charCodeAt(i);
if (c > 127) {
dataCodeWords[n] = 235;
c = c - 127;
n++;
} else if ((c>=48 && c<=57) && (i+1<text.length) && (text.charCodeAt(i+1)>=48 && text.charCodeAt(i+1)<=57)) {
c = ((c - 48) * 10) + ((text.charCodeAt(i+1))-48);
c += 130;
i++;
} else c++;
dataCodeWords[n] = c;
n++;
}
return dataCodeWords;
},
addPadCW: function(tab, from, to){
if (from >= to) return ;
tab[from] = 129;
var r, i;
for (i=from+1; i<to; i++){
r = ((149 * (i+1)) % 253) + 1;
tab[i] = (129 + r) % 254;
}
},
calculSolFactorTable: function(solomonCWCount){
var g = new Array();
var i, j;
for (i=0; i<=solomonCWCount; i++) g[i] = 1;
for(i = 1; i <= solomonCWCount; i++) {
for(j = i - 1; j >= 0; j--) {
g[j] = this.champGaloisDoub(g[j], i);
if(j > 0) g[j] = this.champGaloisSum(g[j], g[j-1]);
}
}
return g;
},
addReedSolomonCW: function(nSolomonCW, coeffTab, nDataCW, dataTab, blocks){
var temp = 0;
var errorBlocks = nSolomonCW / blocks;
var correctionCW = new Array();
var i,j,k;
for(k = 0; k < blocks; k++) {
for (i=0; i<errorBlocks; i++) correctionCW[i] = 0;
for (i=k; i<nDataCW; i=i+blocks){
temp = this.champGaloisSum(dataTab[i], correctionCW[errorBlocks-1]);
for (j=errorBlocks-1; j>=0; j--){
if ( !temp ) {
correctionCW[j] = 0;
} else {
correctionCW[j] = this.champGaloisMult(temp, coeffTab[j]);
}
if (j>0) correctionCW[j] = this.champGaloisSum(correctionCW[j-1], correctionCW[j]);
}
}
j = nDataCW + k;
for (i=errorBlocks-1; i>=0; i--){
dataTab[j] = correctionCW[i];
j=j+blocks;
}
}
return dataTab;
},
getBits: function(entier){
var bits = new Array();
for (var i=0; i<8; i++){
bits[i] = entier & (128 >> i) ? 1 : 0;
}
return bits;
},
next: function(etape, totalRows, totalCols, codeWordsBits, datamatrix, assigned){
var chr = 0;
var row = 4;
var col = 0;
do {
if((row == totalRows) && (col == 0)){
this.patternShapeSpecial1(datamatrix, assigned, codeWordsBits[chr], totalRows, totalCols);
chr++;
} else if((etape<3) && (row == totalRows-2) && (col == 0) && (totalCols%4 != 0)){
this.patternShapeSpecial2(datamatrix, assigned, codeWordsBits[chr], totalRows, totalCols);
chr++;
} else if((row == totalRows-2) && (col == 0) && (totalCols%8 == 4)){
this.patternShapeSpecial3(datamatrix, assigned, codeWordsBits[chr], totalRows, totalCols);
chr++;
}
else if((row == totalRows+4) && (col == 2) && (totalCols%8 == 0)){
this.patternShapeSpecial4(datamatrix, assigned, codeWordsBits[chr], totalRows, totalCols);
chr++;
}
do {
if((row < totalRows) && (col >= 0) && (assigned[row][col]!=1)) {
this.patternShapeStandard(datamatrix, assigned, codeWordsBits[chr], row, col, totalRows, totalCols);
chr++;
}
row -= 2;
col += 2;
} while ((row >= 0) && (col < totalCols));
row += 1;
col += 3;
do {
if((row >= 0) && (col < totalCols) && (assigned[row][col]!=1)){
this.patternShapeStandard(datamatrix, assigned, codeWordsBits[chr], row, col, totalRows, totalCols);
chr++;
}
row += 2;
col -= 2;
} while ((row < totalRows) && (col >=0));
row += 3;
col += 1;
} while ((row < totalRows) || (col < totalCols));
},
patternShapeStandard: function(datamatrix, assigned, bits, row, col, totalRows, totalCols){
this.placeBitInDatamatrix(datamatrix, assigned, bits[0], row-2, col-2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[1], row-2, col-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[2], row-1, col-2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[3], row-1, col-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[4], row-1, col, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[5], row, col-2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[6], row, col-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[7], row,  col, totalRows, totalCols);
},
patternShapeSpecial1: function(datamatrix, assigned, bits, totalRows, totalCols ){
this.placeBitInDatamatrix(datamatrix, assigned, bits[0], totalRows-1,  0, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[1], totalRows-1,  1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[2], totalRows-1,  2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[3], 0, totalCols-2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[4], 0, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[5], 1, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[6], 2, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[7], 3, totalCols-1, totalRows, totalCols);
},
patternShapeSpecial2: function(datamatrix, assigned, bits, totalRows, totalCols ){
this.placeBitInDatamatrix(datamatrix, assigned, bits[0], totalRows-3,  0, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[1], totalRows-2,  0, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[2], totalRows-1,  0, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[3], 0, totalCols-4, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[4], 0, totalCols-3, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[5], 0, totalCols-2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[6], 0, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[7], 1, totalCols-1, totalRows, totalCols);
},
patternShapeSpecial3: function(datamatrix, assigned, bits, totalRows, totalCols ){
this.placeBitInDatamatrix(datamatrix, assigned, bits[0], totalRows-3,  0, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[1], totalRows-2,  0, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[2], totalRows-1,  0, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[3], 0, totalCols-2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[4], 0, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[5], 1, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[6], 2, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[7], 3, totalCols-1, totalRows, totalCols);
},
patternShapeSpecial4: function(datamatrix, assigned, bits, totalRows, totalCols ){
this.placeBitInDatamatrix(datamatrix, assigned, bits[0], totalRows-1,  0, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[1], totalRows-1, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[2], 0, totalCols-3, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[3], 0, totalCols-2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[4], 0, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[5], 1, totalCols-3, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[6], 1, totalCols-2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[7], 1, totalCols-1, totalRows, totalCols);
},
placeBitInDatamatrix: function(datamatrix, assigned, bit, row, col, totalRows, totalCols){
if (row < 0) {
row += totalRows;
col += 4 - ((totalRows+4)%8);
}
if (col < 0) {
col += totalCols;
row += 4 - ((totalCols+4)%8);
}
if (assigned[row][col] != 1) {
datamatrix[row][col] = bit;
assigned[row][col] = 1;
}
},
addFinderPattern: function(datamatrix, rowsRegion, colsRegion, rowsRegionCW, colsRegionCW){
var totalRowsCW = (rowsRegionCW+2) * rowsRegion;
var totalColsCW = (colsRegionCW+2) * colsRegion;
var datamatrixTemp = new Array();
datamatrixTemp[0] = new Array();
for (var j=0; j<totalColsCW+2; j++){
datamatrixTemp[0][j] = 0;
}
for (var i=0; i<totalRowsCW; i++){
datamatrixTemp[i+1] = new Array();
datamatrixTemp[i+1][0] = 0;
datamatrixTemp[i+1][totalColsCW+1] = 0;
for (var j=0; j<totalColsCW; j++){
if (i%(rowsRegionCW+2) == 0){
if (j%2 == 0){
datamatrixTemp[i+1][j+1] = 1;
} else {
datamatrixTemp[i+1][j+1] = 0;
}
} else if (i%(rowsRegionCW+2) == rowsRegionCW+1){
datamatrixTemp[i+1][j+1] = 1;
} else if (j%(colsRegionCW+2) == colsRegionCW+1){
if (i%2 == 0){
datamatrixTemp[i+1][j+1] = 0;
} else {
datamatrixTemp[i+1][j+1] = 1;
}
} else if (j%(colsRegionCW+2) == 0){
datamatrixTemp[i+1][j+1] = 1;
} else{
datamatrixTemp[i+1][j+1] = 0;
datamatrixTemp[i+1][j+1] = datamatrix[i-1-(2*(parseInt(i/(rowsRegionCW+2))))][j-1-(2*(parseInt(j/(colsRegionCW+2))))];
}
}
}
datamatrixTemp[totalRowsCW+1] = new Array();
for (var j=0; j<totalColsCW+2; j++){
datamatrixTemp[totalRowsCW+1][j] = 0;
}
return datamatrixTemp;
},
getDigit: function(text, rectangular){
var dataCodeWords = this.encodeDataCodeWordsASCII(text);
var dataCWCount = dataCodeWords.length;
var index = this.selectIndex(dataCWCount, rectangular);
var totalDataCWCount = this.dataCWCount[index];
var solomonCWCount = this.solomonCWCount[index];
var totalCWCount = totalDataCWCount + solomonCWCount;
var rowsTotal = this.lengthRows[index];
var colsTotal = this.lengthCols[index];
var rowsRegion = this.regionRows[index];
var colsRegion = this.regionCols[index];
var rowsRegionCW = this.dataRegionRows[index];
var colsRegionCW = this.dataRegionCols[index];
var rowsLengthMatrice = rowsTotal-2*rowsRegion;
var colsLengthMatrice = colsTotal-2*colsRegion;
var blocks = this.interleavedBlocks[index];
var errorBlocks = (solomonCWCount / blocks);
this.addPadCW(dataCodeWords, dataCWCount, totalDataCWCount);
var g = this.calculSolFactorTable(errorBlocks);
this.addReedSolomonCW(solomonCWCount, g, totalDataCWCount, dataCodeWords, blocks);
var codeWordsBits = new Array();
for (var i=0; i<totalCWCount; i++){
codeWordsBits[i] = this.getBits(dataCodeWords[i]);
}
var datamatrix = new Array();
var assigned = new Array();
for (var i=0; i<colsLengthMatrice; i++){
datamatrix[i] = new Array();
assigned[i] = new Array();
}
if ( ((rowsLengthMatrice * colsLengthMatrice) % 8) == 4) {
datamatrix[rowsLengthMatrice-2][colsLengthMatrice-2] = 1;
datamatrix[rowsLengthMatrice-1][colsLengthMatrice-1] = 1;
datamatrix[rowsLengthMatrice-1][colsLengthMatrice-2] = 0;
datamatrix[rowsLengthMatrice-2][colsLengthMatrice-1] = 0;
assigned[rowsLengthMatrice-2][colsLengthMatrice-2] = 1;
assigned[rowsLengthMatrice-1][colsLengthMatrice-1] = 1;
assigned[rowsLengthMatrice-1][colsLengthMatrice-2] = 1;
assigned[rowsLengthMatrice-2][colsLengthMatrice-1] = 1;
}
this.next(0,rowsLengthMatrice,colsLengthMatrice, codeWordsBits, datamatrix, assigned);
datamatrix = this.addFinderPattern(datamatrix, rowsRegion, colsRegion, rowsRegionCW, colsRegionCW);
return datamatrix;
}
},
lec:{
cInt: function(value, byteCount){
var le = '';
for(var i=0; i<byteCount; i++){
le += String.fromCharCode(value & 0xFF);
value = value >> 8;
}
return le;
},
cRgb: function(r,g,b){
return String.fromCharCode(b) + String.fromCharCode(g) + String.fromCharCode(r);
},
cHexColor: function(hex){
var v = parseInt('0x' + hex.substr(1));
var b = v & 0xFF;
v = v >> 8;
var g = v & 0xFF;
var r = v >> 8;
return(this.cRgb(r,g,b));
}
},
hexToRGB: function(hex){
var v = parseInt('0x' + hex.substr(1));
var b = v & 0xFF;
v = v >> 8;
var g = v & 0xFF;
var r = v >> 8;
return({r:r,g:g,b:b});
},
isHexColor: function (value){
var r = new RegExp("#[0-91-F]", "gi");
return  value.match(r);
},
base64Encode: function(value) {
var r = '', c1, c2, c3, b1, b2, b3, b4;
var k = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var i = 0;
while (i < value.length) {
c1 = value.charCodeAt(i++);
c2 = value.charCodeAt(i++);
c3 = value.charCodeAt(i++);
b1 = c1 >> 2;
b2 = ((c1 & 3) << 4) | (c2 >> 4);
b3 = ((c2 & 15) << 2) | (c3 >> 6);
b4 = c3 & 63;
if (isNaN(c2)) b3 = b4 = 64;
else if (isNaN(c3)) b4 = 64;
r += k.charAt(b1) + k.charAt(b2) + k.charAt(b3) + k.charAt(b4);
}
return r;
},
bitStringTo2DArray: function( digit ){
var d = []; d[0] = [];
for(var i=0; i<digit.length; i++) d[0][i] = digit.charAt(i);
return(d);
},
resize: function($container, w){
$container.style.cssText += 'padding: 0px; overflow: auto; width: ' +  w + 'px';
$container.update('');
return $container;
},
digitToBmpRenderer: function($container, settings, digit, hri, mw, mh){
var lines = digit.length;
var columns = digit[0].length;
var i = 0;
var c0 = this.isHexColor(settings.bgColor) ? this.lec.cHexColor(settings.bgColor) : this.lec.cRgb(255,255,255);
var c1 = this.isHexColor(settings.color) ? this.lec.cHexColor(settings.color) : this.lec.cRgb(0,0,0);
var bar0 = '';
var bar1 = '';
for(i=0; i<mw; i++){
bar0 += c0;
bar1 += c1;
}
var bars = '';
var padding = (4 - ((mw * columns * 3) % 4)) % 4;
var dataLen = (mw * columns + padding) * mh * lines;
var pad = '';
for(i=0; i<padding; i++) pad += '\0';
var bmp = 'BM' +
this.lec.cInt(54 + dataLen, 4) +
'\0\0\0\0' +
this.lec.cInt(54, 4) +
this.lec.cInt(40, 4) +
this.lec.cInt(mw * columns, 4) +
this.lec.cInt(mh * lines, 4) +
this.lec.cInt(1, 2) +
this.lec.cInt(24, 2) +
'\0\0\0\0' +
this.lec.cInt(dataLen, 4) +
this.lec.cInt(2835, 4) +
this.lec.cInt(2835, 4) +
this.lec.cInt(0, 4) +
this.lec.cInt(0, 4);
for(var y=lines-1; y>=0; y--){
var line = '';
for (var x=0; x<columns; x++){
line += digit[y][x] == '0' ? bar0 : bar1;
}
line += pad;
for(var k=0; k<mh; k++){
bmp += line;
}
}
var object = document.createElement('object');
object.setAttribute('type', 'image/bmp');
object.setAttribute('data', 'data:image/bmp;base64,'+ this.base64Encode(bmp));
this.resize($container, mw * columns + padding).update(object);
},
digitToBmp: function($container, settings, digit, hri){
var w = Barcode.intval(settings.barWidth);
var h = Barcode.intval(settings.barHeight);
this.digitToBmpRenderer($container, settings, this.bitStringTo2DArray(digit), hri, w, h);
},
digitToBmp2D: function($container, settings, digit, hri){
var s = Barcode.intval(settings.moduleSize);
this.digitToBmpRenderer($container, settings, digit, hri, s, s);
},
digitToCssRenderer : function($container, settings, digit, hri, mw, mh){
var lines = digit.length;
var columns = digit[0].length;
var content = "";
var bar0 = "<div style=\"float: left; font-size: 0px; background-color: " + settings.bgColor + "; height: " + mh + "px; width: &Wpx\"></div>";
var bar1 = "<div style=\"float: left; font-size: 0px; width:0; border-left: &Wpx solid " + settings.color + "; height: " + mh + "px;\"></div>";
var len, current;
for(var y=0; y<lines; y++){
len = 0;
current = digit[y][0];
for (var x=0; x<columns; x++){
if ( current == digit[y][x] ) {
len++;
} else {
content += (current == '0' ? bar0 : bar1).replace("&W", len * mw);
current = digit[y][x];
len=1;
}
}
if (len > 0){
content += (current == '0' ? bar0 : bar1).replace("&W", len * mw);
}
}
if (settings.showHRI){
content += "<div style=\"clear:both; width: 100%; background-color: " + settings.bgColor + "; color: " + settings.color + "; text-align: center; font-size: " + settings.fontSize + "px; margin-top: " + settings.marginHRI + "px;\">"+hri+"</div>";
}
this.resize($container, mw * columns).update(content);
},
digitToCss: function($container, settings, digit, hri){
var w = Barcode.intval(settings.barWidth);
var h = Barcode.intval(settings.barHeight);
this.digitToCssRenderer($container, settings, this.bitStringTo2DArray(digit), hri, w, h);
},
digitToCss2D: function($container, settings, digit, hri){
var s = Barcode.intval(settings.moduleSize);
this.digitToCssRenderer($container, settings, digit, hri, s, s);
},
digitToSvgRenderer: function($container, settings, digit, hri, mw, mh){
var lines = digit.length;
var columns = digit[0].length;
var width = mw * columns;
var height = mh * lines;
if (settings.showHRI){
var fontSize = Barcode.intval(settings.fontSize);
height += Barcode.intval(settings.marginHRI) + fontSize;
}
var svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '">';
svg += '<rect width="' +  width + '" height="' + height + '" x="0" y="0" fill="' + settings.bgColor + '" />';
var bar1 = '<rect width="&W" height="' + mh + '" x="&X" y="&Y" fill="' + settings.color + '" />';
var len, current;
for(var y=0; y<lines; y++){
len = 0;
current = digit[y][0];
for (var x=0; x<columns; x++){
if ( current == digit[y][x] ) {
len++;
} else {
if (current == '1') {
svg += bar1.replace("&W", len * mw).replace("&X", (x - len) * mw).replace("&Y", y * mh);
}
current = digit[y][x];
len=1;
}
}
if ( (len > 0) && (current == '1') ){
svg += bar1.replace("&W", len * mw).replace("&X", (columns - len) * mw).replace("&Y", y * mh);
}
}
if (settings.showHRI){
svg += '<g transform="translate(' + Math.floor(width/2) + ' 0)">';
svg += '<text y="' + (height - Math.floor(fontSize/2)) + '" text-anchor="middle" style="font-family: Arial; font-size: ' + fontSize + 'px;" fill="' + settings.color + '">' + hri + '</text>';
svg += '</g>';
}
svg += '</svg>';
var object = document.createElement('object');
object.setAttribute('type', 'image/svg+xml');
object.setAttribute('data', 'data:image/svg+xml,'+ svg);
this.resize($container, width).update(object);
},
digitToSvg: function($container, settings, digit, hri){
var w = Barcode.intval(settings.barWidth);
var h = Barcode.intval(settings.barHeight);
this.digitToSvgRenderer($container, settings, this.bitStringTo2DArray(digit), hri, w, h);
},
digitToSvg2D: function($container, settings, digit, hri){
var s = Barcode.intval(settings.moduleSize);
this.digitToSvgRenderer($container, settings, digit, hri, s, s);
},
digitToCanvasRenderer : function($container, settings, digit, hri, xi, yi, mw, mh){
var canvas = $container;
if ( !canvas || !canvas.getContext ) return;
var lines = digit.length;
var columns = digit[0].length;
var ctx = canvas.getContext('2d');
ctx.lineWidth = 1;
ctx.lineCap = 'butt';
ctx.fillStyle = settings.bgColor;
ctx.fillRect (xi, yi, columns * mw, lines * mh);
ctx.fillStyle = settings.color;
for(var y=0; y<lines; y++){
var len = 0;
var current = digit[y][0];
for(var x=0; x<columns; x++){
if (current == digit[y][x]) {
len++;
} else {
if (current == '1'){
ctx.fillRect (xi + (x - len) * mw, yi + y * mh, mw * len, mh);
}
current = digit[y][x];
len=1;
}
}
if ( (len > 0) && (current == '1') ){
ctx.fillRect (xi + (columns - len) * mw, yi + y * mh, mw * len, mh);
}
}
if (settings.showHRI){
var dim = ctx.measureText(hri);
ctx.fillText(hri, xi + Math.floor((columns * mw - dim.width)/2), yi + lines * mh + settings.fontSize + settings.marginHRI);
}
},
digitToCanvas: function($container, settings, digit, hri){
var w  = Barcode.intval(settings.barWidth);
var h = Barcode.intval(settings.barHeight);
var x = Barcode.intval(settings.posX);
var y = Barcode.intval(settings.posY);
this.digitToCanvasRenderer($container, settings, this.bitStringTo2DArray(digit), hri, x, y, w, h);
},
digitToCanvas2D: function($container, settings, digit, hri){
var s = Barcode.intval(settings.moduleSize);
var x = Barcode.intval(settings.posX);
var y = Barcode.intval(settings.posY);
this.digitToCanvasRenderer($container, settings, digit, hri, x, y, s, s);
}
};
var barcodeMethod = {
barcode: function(element, datas, type, settings) {
var $this = $(element);
var digit = "",
hri   = "",
code  = "",
crc   = true,
rect  = false,
b2d   = false;
if (typeof(datas) == "string"){
code = datas;
} else if (typeof(datas) == "object"){
code = typeof(datas.code) == "string" ? datas.code : "";
crc = typeof(datas.crc) != "undefined" ? datas.crc : true;
rect = typeof(datas.rect) != "undefined" ? datas.rect : false;
}
if (code == "") return(false);
if (typeof(settings) == "undefined") settings = [];
for(var name in Barcode.settings){
if (settings[name] == undefined) settings[name] = Barcode.settings[name];
}
switch(type){
case "std25":
case "int25":
digit = Barcode.i25.getDigit(code, crc, type);
hri = Barcode.i25.compute(code, crc, type);
break;
case "ean8":
case "ean13":
digit = Barcode.ean.getDigit(code, type);
hri = Barcode.ean.compute(code, type);
break;
case "upc":
digit = Barcode.upc.getDigit(code);
hri = Barcode.upc.compute(code);
break;
case "code11":
digit = Barcode.code11.getDigit(code);
hri = code;
break;
case "code39":
digit = Barcode.code39.getDigit(code);
hri = code;
break;
case "code93":
digit = Barcode.code93.getDigit(code, crc);
hri = code;
break;
case "code128":
digit = Barcode.code128.getDigit(code);
hri = code;
break;
case "codabar":
digit = Barcode.codabar.getDigit(code);
hri = code;
break;
case "msi":
digit = Barcode.msi.getDigit(code, crc);
hri = Barcode.msi.compute(code, crc);
break;
case "datamatrix":
digit = Barcode.datamatrix.getDigit(code, rect);
hri = code;
b2d = true;
break;
}
if (digit.length == 0) return($this);
if ( !b2d && settings.addQuietZone) digit = "0000000000" + digit + "0000000000";
var fname = 'digitTo' + settings.output.charAt(0).toUpperCase() + settings.output.substr(1) + (b2d ? '2D' : '');
if (typeof(Barcode[fname]) == 'function') {
Barcode[fname]($this, settings, digit, hri);
}
return($this);
}
};
Element.addMethods('DIV', barcodeMethod);
Element.addMethods('CANVAS', barcodeMethod);
/*! RESOURCE: populate_scope_editor_slushbucket */
function populateLeftAndRightScopeEditor(dataLeft, dataRight) {
slushbucketPopulateHelper(gel('scope_slush_left'), dataLeft);
slushbucketPopulateHelper(gel('scope_slush_right'), dataRight);
}
function slushbucketPopulateHelper(select, data) {
select.options.length = 0;
if(data) {
var list = data.split('^');
for (var i = 0; i != list.length; i++) {
var t = list[i].split(':');
var label = atob(t[0]);
var value = atob(t[1]);
var o = new Option(label, value);
select.options[select.options.length] = o;
}
}
}
function cancel() {
g_form.fieldChanged('scope_slush', false);
setTimeout(function() {reloadWindow(self);}, 1);
}
function editScopes() {
g_form.fieldChanged('scope_slush', false);
var jsonScopes = {
"additionalScopes": scope_slush.getValues(scope_slush.getRightSelect()) || [],
"removedScopes": scope_slush.getValues(scope_slush.getLeftSelect()) || []
};
var stringScopes = JSON.stringify(jsonScopes);
var ga = new GlideAjax('AJAXAddScopes');
ga.addParam('sysparm_name', 'updateScopes');
ga.addParam('sysparm_scopes', stringScopes);
ga.addParam('sysparm_oauthEntityId', g_form.getUniqueValue());
ga.getXML(function(result) {
g_navigation.reloadWindow();
});
}
/*! RESOURCE: eus_prototype-barcode */
var Barcode = {
settings:{
barWidth: 1,
barHeight: 50,
moduleSize: 5,
showHRI: false,
addQuietZone: true,
marginHRI: 5,
bgColor: "#FFFFFF",
color: "#000000",
fontSize: 10,
output: "css",
posX: 0,
posY: 0
},
intval: function(val){
var type = typeof( val );
if (type == 'string'){
val = val.replace(/[^0-9-.]/g, "");
val = parseInt(val * 1, 10);
return isNaN(val) || !isFinite(val) ? 0 : val;
}
return type == 'number' && isFinite(val) ? Math.floor(val) : 0;
},
i25: {
encoding: ["NNWWN", "WNNNW", "NWNNW", "WWNNN", "NNWNW", "WNWNN", "NWWNN", "NNNWW", "WNNWN","NWNWN"],
compute: function(code, crc, type){
if (! crc) {
if (code.length % 2 != 0) code = '0' + code;
} else {
if ( (type == "int25") && (code.length % 2 == 0) ) code = '0' + code;
var odd = true, v, sum = 0;
for(var i=code.length-1; i>-1; i--){
v = Barcode.intval(code.charAt(i));
if (isNaN(v)) return("");
sum += odd ? 3 * v : v;
odd = ! odd;
}
code += ((10 - sum % 10) % 10).toString();
}
return(code);
},
getDigit: function(code, crc, type){
code = this.compute(code, crc, type);
if (code == "") return("");
result = "";
var i, j;
if (type == "int25") {
result += "1010";
var c1, c2;
for(i=0; i<code.length / 2; i++){
c1 = code.charAt(2*i);
c2 = code.charAt(2*i+1);
for(j=0; j<5; j++){
result += '1';
if (this.encoding[c1].charAt(j) == 'W') result += '1';
result += '0';
if (this.encoding[c2].charAt(j) == 'W') result += '0';
}
}
result += "1101";
} else if (type == "std25") {
result += "11011010";
var c;
for(i=0; i<code.length; i++){
c = code.charAt(i);
for(j=0; j<5; j++){
result += '1';
if (this.encoding[c].charAt(j) == 'W') result += "11";
result += '0';
}
}
result += "11010110";
}
return(result);
}
},
ean: {
encoding: [ ["0001101", "0100111", "1110010"],
["0011001", "0110011", "1100110"],
["0010011", "0011011", "1101100"],
["0111101", "0100001", "1000010"],
["0100011", "0011101", "1011100"],
["0110001", "0111001", "1001110"],
["0101111", "0000101", "1010000"],
["0111011", "0010001", "1000100"],
["0110111", "0001001", "1001000"],
["0001011", "0010111", "1110100"] ],
first:  ["000000","001011","001101","001110","010011","011001","011100","010101","010110","011010"],
getDigit: function(code, type){
var len = type == "ean8" ? 7 : 12;
code = code.substring(0, len);
if (code.length != len) return("");
var c;
for(var i=0; i<code.length; i++){
c = code.charAt(i);
if ( (c < '0') || (c > '9') ) return("");
}
code = this.compute(code, type);
var result = "101";
if (type == "ean8"){
for(var i=0; i<4; i++){
result += this.encoding[Barcode.intval(code.charAt(i))][0];
}
result += "01010";
for(var i=4; i<8; i++){
result += this.encoding[Barcode.intval(code.charAt(i))][2];
}
} else {
var seq = this.first[ Barcode.intval(code.charAt(0)) ];
for(var i=1; i<7; i++){
result += this.encoding[Barcode.intval(code.charAt(i))][ Barcode.intval(seq.charAt(i-1)) ];
}
result += "01010";
for(var i=7; i<13; i++){
result += this.encoding[Barcode.intval(code.charAt(i))][ 2 ];
}
}
result += "101";
return(result);
},
compute: function (code, type){
var len = type == "ean13" ? 12 : 7;
code = code.substring(0, len);
var sum = 0, odd = true;
for(i=code.length-1; i>-1; i--){
sum += (odd ? 3 : 1) * Barcode.intval(code.charAt(i));
odd = ! odd;
}
return(code + ((10 - sum % 10) % 10).toString());
}
},
upc: {
getDigit: function(code){
if (code.length < 12) {
code = '0' + code;
}
return Barcode.ean.getDigit(code, 'ean13');
},
compute: function (code){
if (code.length < 12) {
code = '0' + code;
}
return Barcode.ean.compute(code, 'ean13').substr(1);
}
},
msi: {
encoding:["100100100100", "100100100110", "100100110100", "100100110110",
"100110100100", "100110100110", "100110110100", "100110110110",
"110100100100", "110100100110"],
compute: function(code, crc){
if (typeof(crc) == "object"){
if (crc.crc1 == "mod10"){
code = this.computeMod10(code);
} else if (crc.crc1 == "mod11"){
code = this.computeMod11(code);
}
if (crc.crc2 == "mod10"){
code = this.computeMod10(code);
} else if (crc.crc2 == "mod11"){
code = this.computeMod11(code);
}
} else if (typeof(crc) == "boolean"){
if (crc) code = this.computeMod10(code);
}
return(code);
},
computeMod10:function(code){
var i,
toPart1 = code.length % 2;
var n1 = 0, sum = 0;
for(i=0; i<code.length; i++){
if (toPart1) {
n1 = 10 * n1 + Barcode.intval(code.charAt(i));
} else {
sum += Barcode.intval(code.charAt(i));
}
toPart1 = ! toPart1;
}
var s1 = (2 * n1).toString();
for(i=0; i<s1.length; i++){
sum += Barcode.intval(s1.charAt(i));
}
return(code + ((10 - sum % 10) % 10).toString());
},
computeMod11:function(code){
var sum = 0, weight = 2;
for(var i=code.length-1; i>=0; i--){
sum += weight * Barcode.intval(code.charAt(i));
weight = weight == 7 ? 2 : weight + 1;
}
return(code + ((11 - sum % 11) % 11).toString());
},
getDigit: function(code, crc){
var table = "0123456789";
var index = 0;
var result = "";
code = this.compute(code, false);
result = "110";
for(i=0; i<code.length; i++){
index = table.indexOf( code.charAt(i) );
if (index < 0) return("");
result += this.encoding[ index ];
}
result += "1001";
return(result);
}
},
code11: {
encoding:[  "101011", "1101011", "1001011", "1100101",
"1011011", "1101101", "1001101", "1010011",
"1101001", "110101", "101101"],
getDigit: function(code){
var table = "0123456789-";
var i, index, result = "", intercharacter = '0'
result = "1011001" + intercharacter;
for(i=0; i<code.length; i++){
index = table.indexOf( code.charAt(i) );
if (index < 0) return("");
result += this.encoding[ index ] + intercharacter;
}
var weightC    = 0,
weightSumC = 0,
weightK    = 1,
weightSumK   = 0;
for(i=code.length-1; i>=0; i--){
weightC = weightC == 10 ? 1 : weightC + 1;
weightK = weightK == 10 ? 1 : weightK + 1;
index = table.indexOf( code.charAt(i) );
weightSumC += weightC * index;
weightSumK += weightK * index;
}
var c = weightSumC % 11;
weightSumK += c;
var k = weightSumK % 11;
result += this.encoding[c] + intercharacter;
if (code.length >= 10){
result += this.encoding[k] + intercharacter;
}
result  += "1011001";
return(result);
}
},
code39: {
encoding:["101001101101", "110100101011", "101100101011", "110110010101",
"101001101011", "110100110101", "101100110101", "101001011011",
"110100101101", "101100101101", "110101001011", "101101001011",
"110110100101", "101011001011", "110101100101", "101101100101",
"101010011011", "110101001101", "101101001101", "101011001101",
"110101010011", "101101010011", "110110101001", "101011010011",
"110101101001", "101101101001", "101010110011", "110101011001",
"101101011001", "101011011001", "110010101011", "100110101011",
"110011010101", "100101101011", "110010110101", "100110110101",
"100101011011", "110010101101", "100110101101", "100100100101",
"100100101001", "100101001001", "101001001001", "100101101101"],
getDigit: function(code){
var table = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%*";
var i, index, result="", intercharacter='0';
if (code.indexOf('*') >= 0) return("");
code = ("*" + code + "*").toUpperCase();
for(i=0; i<code.length; i++){
index = table.indexOf( code.charAt(i) );
if (index < 0) return("");
if (i > 0) result += intercharacter;
result += this.encoding[ index ];
}
return(result);
}
},
code93:{
encoding:["100010100", "101001000", "101000100", "101000010",
"100101000", "100100100", "100100010", "101010000",
"100010010", "100001010", "110101000", "110100100",
"110100010", "110010100", "110010010", "110001010",
"101101000", "101100100", "101100010", "100110100",
"100011010", "101011000", "101001100", "101000110",
"100101100", "100010110", "110110100", "110110010",
"110101100", "110100110", "110010110", "110011010",
"101101100", "101100110", "100110110", "100111010",
"100101110", "111010100", "111010010", "111001010",
"101101110", "101110110", "110101110", "100100110",
"111011010", "111010110", "100110010", "101011110"],
getDigit: function(code, crc){
var table = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%____*",
c, result = "";
if (code.indexOf('*') >= 0) return("");
code = code.toUpperCase();
result  += this.encoding[47];
for(i=0; i<code.length; i++){
c = code.charAt(i);
index = table.indexOf( c );
if ( (c == '_') || (index < 0) ) return("");
result += this.encoding[ index ];
}
if (crc){
var weightC    = 0,
weightSumC = 0,
weightK    = 1,
weightSumK   = 0;
for(i=code.length-1; i>=0; i--){
weightC = weightC == 20 ? 1 : weightC + 1;
weightK = weightK == 15 ? 1 : weightK + 1;
index = table.indexOf( code.charAt(i) );
weightSumC += weightC * index;
weightSumK += weightK * index;
}
var c = weightSumC % 47;
weightSumK += c;
var k = weightSumK % 47;
result += this.encoding[c];
result += this.encoding[k];
}
result  += this.encoding[47];
result  += '1';
return(result);
}
},
code128: {
encoding:["11011001100", "11001101100", "11001100110", "10010011000",
"10010001100", "10001001100", "10011001000", "10011000100",
"10001100100", "11001001000", "11001000100", "11000100100",
"10110011100", "10011011100", "10011001110", "10111001100",
"10011101100", "10011100110", "11001110010", "11001011100",
"11001001110", "11011100100", "11001110100", "11101101110",
"11101001100", "11100101100", "11100100110", "11101100100",
"11100110100", "11100110010", "11011011000", "11011000110",
"11000110110", "10100011000", "10001011000", "10001000110",
"10110001000", "10001101000", "10001100010", "11010001000",
"11000101000", "11000100010", "10110111000", "10110001110",
"10001101110", "10111011000", "10111000110", "10001110110",
"11101110110", "11010001110", "11000101110", "11011101000",
"11011100010", "11011101110", "11101011000", "11101000110",
"11100010110", "11101101000", "11101100010", "11100011010",
"11101111010", "11001000010", "11110001010", "10100110000",
"10100001100", "10010110000", "10010000110", "10000101100",
"10000100110", "10110010000", "10110000100", "10011010000",
"10011000010", "10000110100", "10000110010", "11000010010",
"11001010000", "11110111010", "11000010100", "10001111010",
"10100111100", "10010111100", "10010011110", "10111100100",
"10011110100", "10011110010", "11110100100", "11110010100",
"11110010010", "11011011110", "11011110110", "11110110110",
"10101111000", "10100011110", "10001011110", "10111101000",
"10111100010", "11110101000", "11110100010", "10111011110",
"10111101110", "11101011110", "11110101110", "11010000100",
"11010010000", "11010011100", "11000111010"],
getDigit: function(code){
var tableB = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
var result = "";
var sum = 0;
var isum = 0;
var i = 0;
var j = 0;
var value = 0;
for(i=0; i<code.length; i++){
if (tableB.indexOf(code.charAt(i)) == -1) return("");
}
var tableCActivated = code.length > 1;
var c = '';
for(i=0; i<3 && i<code.length; i++){
c = code.charAt(i);
tableCActivated &= c >= '0' && c <= '9';
}
sum = tableCActivated ? 105 : 104;
result = this.encoding[ sum ];
i = 0;
while( i < code.length ){
if (! tableCActivated){
j = 0;
while ( (i + j < code.length) && (code.charAt(i+j) >= '0') && (code.charAt(i+j) <= '9') ) j++;
tableCActivated = (j > 5) || ((i + j - 1 == code.length) && (j > 3));
if ( tableCActivated ){
result += this.encoding[ 99 ];
sum += ++isum * 99;
}
} else if ( (i == code.length) || (code.charAt(i) < '0') || (code.charAt(i) > '9') || (code.charAt(i+1) < '0') || (code.charAt(i+1) > '9') ) {
tableCActivated = false;
result += this.encoding[ 100 ];
sum += ++isum * 100;
}
if ( tableCActivated ) {
value = Barcode.intval(code.charAt(i) + code.charAt(i+1));
i += 2;
} else {
value = tableB.indexOf( code.charAt(i) );
i += 1;
}
result  += this.encoding[ value ];
sum += ++isum * value;
}
result  += this.encoding[ sum % 103 ];
result += this.encoding[106];
result += "11";
return(result);
}
},
codabar: {
encoding:["101010011", "101011001", "101001011", "110010101",
"101101001", "110101001", "100101011", "100101101",
"100110101", "110100101", "101001101", "101100101",
"1101011011", "1101101011", "1101101101", "1011011011",
"1011001001", "1010010011", "1001001011", "1010011001"],
getDigit: function(code){
var table = "0123456789-$:/.+";
var i, index, result="", intercharacter = '0';
result += this.encoding[16] + intercharacter;
for(i=0; i<code.length; i++){
index = table.indexOf( code.charAt(i) );
if (index < 0) return("");
result += this.encoding[ index ] + intercharacter;
}
result += this.encoding[16];
return(result);
}
},
datamatrix: {
lengthRows:       [ 10, 12, 14, 16, 18, 20, 22, 24, 26,
32, 36, 40, 44, 48, 52, 64, 72, 80,  88, 96, 104, 120, 132, 144,
8, 8, 12, 12, 16, 16],
lengthCols:       [ 10, 12, 14, 16, 18, 20, 22, 24, 26,
32, 36, 40, 44, 48, 52, 64, 72, 80, 88, 96, 104, 120, 132, 144,
18, 32, 26, 36, 36, 48],
dataCWCount:      [ 3, 5, 8, 12,  18,  22,  30,  36,
44, 62, 86, 114, 144, 174, 204, 280, 368, 456, 576, 696, 816, 1050,
1304, 1558, 5, 10, 16, 22, 32, 49],
solomonCWCount:   [ 5, 7, 10, 12, 14, 18, 20, 24, 28,
36, 42, 48, 56, 68, 84, 112, 144, 192, 224, 272, 336, 408, 496, 620,
7, 11, 14, 18, 24, 28],
dataRegionRows:   [ 8, 10, 12, 14, 16, 18, 20, 22,
24, 14, 16, 18, 20, 22, 24, 14, 16, 18, 20, 22, 24, 18, 20, 22,
6,  6, 10, 10, 14, 14],
dataRegionCols:   [ 8, 10, 12, 14, 16, 18, 20, 22,
24, 14, 16, 18, 20, 22, 24, 14, 16, 18, 20, 22, 24, 18, 20, 22,
16, 14, 24, 16, 16, 22],
regionRows:       [ 1, 1, 1, 1, 1, 1, 1, 1,
1, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 6, 6, 6,
1, 1, 1, 1, 1, 1],
regionCols:       [ 1, 1, 1, 1, 1, 1, 1, 1,
1, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 6, 6, 6,
1, 2, 1, 2, 2, 2],
interleavedBlocks:[ 1, 1, 1, 1, 1, 1, 1, 1,
1, 1, 1, 1, 1, 1, 2, 2, 4, 4, 4, 4, 6, 6, 8, 8,
1, 1, 1, 1, 1, 1],
logTab:           [ -255, 255, 1, 240, 2, 225, 241, 53, 3,
38, 226, 133, 242, 43, 54, 210, 4, 195, 39, 114, 227, 106, 134, 28,
243, 140, 44, 23, 55, 118, 211, 234, 5, 219, 196, 96, 40, 222, 115,
103, 228, 78, 107, 125, 135, 8, 29, 162, 244, 186, 141, 180, 45, 99,
24, 49, 56, 13, 119, 153, 212, 199, 235, 91, 6, 76, 220, 217, 197,
11, 97, 184, 41, 36, 223, 253, 116, 138, 104, 193, 229, 86, 79, 171,
108, 165, 126, 145, 136, 34, 9, 74, 30, 32, 163, 84, 245, 173, 187,
204, 142, 81, 181, 190, 46, 88, 100, 159, 25, 231, 50, 207, 57, 147,
14, 67, 120, 128, 154, 248, 213, 167, 200, 63, 236, 110, 92, 176, 7,
161, 77, 124, 221, 102, 218, 95, 198, 90, 12, 152, 98, 48, 185, 179,
42, 209, 37, 132, 224, 52, 254, 239, 117, 233, 139, 22, 105, 27, 194,
113, 230, 206, 87, 158, 80, 189, 172, 203, 109, 175, 166, 62, 127,
247, 146, 66, 137, 192, 35, 252, 10, 183, 75, 216, 31, 83, 33, 73,
164, 144, 85, 170, 246, 65, 174, 61, 188, 202, 205, 157, 143, 169, 82,
72, 182, 215, 191, 251, 47, 178, 89, 151, 101, 94, 160, 123, 26, 112,
232, 21, 51, 238, 208, 131, 58, 69, 148, 18, 15, 16, 68, 17, 121, 149,
129, 19, 155, 59, 249, 70, 214, 250, 168, 71, 201, 156, 64, 60, 237,
130, 111, 20, 93, 122, 177, 150],
aLogTab:          [ 1, 2, 4, 8, 16, 32, 64, 128, 45, 90,
180, 69, 138, 57, 114, 228, 229, 231, 227, 235, 251, 219, 155, 27, 54,
108, 216, 157, 23, 46, 92, 184, 93, 186, 89, 178, 73, 146, 9, 18, 36,
72, 144, 13, 26, 52, 104, 208, 141, 55, 110, 220, 149, 7, 14, 28, 56,
112, 224, 237, 247, 195, 171, 123, 246, 193, 175, 115, 230, 225, 239,
243, 203, 187, 91, 182, 65, 130, 41, 82, 164, 101, 202, 185, 95, 190,
81, 162, 105, 210, 137, 63, 126, 252, 213, 135, 35, 70, 140, 53, 106,
212, 133, 39, 78, 156, 21, 42, 84, 168, 125, 250, 217, 159, 19, 38, 76,
152, 29, 58, 116, 232, 253, 215, 131, 43, 86, 172, 117, 234, 249, 223,
147, 11, 22, 44, 88, 176, 77, 154, 25, 50, 100, 200, 189, 87, 174, 113,
226, 233, 255, 211, 139, 59, 118, 236, 245, 199, 163, 107, 214, 129,
47, 94, 188, 85, 170, 121, 242, 201, 191, 83, 166, 97, 194, 169, 127,
254, 209, 143, 51, 102, 204, 181, 71, 142, 49, 98, 196, 165, 103, 206,
177, 79, 158, 17, 34, 68, 136, 61, 122, 244, 197, 167, 99, 198, 161,
111, 222, 145, 15, 30, 60, 120, 240, 205, 183, 67, 134, 33, 66, 132,
37, 74, 148, 5, 10, 20, 40, 80, 160, 109, 218, 153, 31, 62, 124, 248,
221, 151, 3, 6, 12, 24, 48, 96, 192, 173, 119, 238, 241, 207, 179, 75,
150, 1],
champGaloisMult: function(a, b){
if(!a || !b) return 0;
return this.aLogTab[(this.logTab[a] + this.logTab[b]) % 255];
},
champGaloisDoub: function(a, b){
if (!a) return 0;
if (!b) return a;
return this.aLogTab[(this.logTab[a] + b) % 255];
},
champGaloisSum: function(a, b){
return a ^ b;
},
selectIndex: function(dataCodeWordsCount, rectangular){
if ((dataCodeWordsCount<1 || dataCodeWordsCount>1558) && !rectangular) return -1;
if ((dataCodeWordsCount<1 || dataCodeWordsCount>49) && rectangular)  return -1;
var n = 0;
if ( rectangular ) n = 24;
while (this.dataCWCount[n] < dataCodeWordsCount) n++;
return n;
},
encodeDataCodeWordsASCII: function(text) {
var dataCodeWords = new Array();
var n = 0, i, c;
for (i=0; i<text.length; i++){
c = text.charCodeAt(i);
if (c > 127) {
dataCodeWords[n] = 235;
c = c - 127;
n++;
} else if ((c>=48 && c<=57) && (i+1<text.length) && (text.charCodeAt(i+1)>=48 && text.charCodeAt(i+1)<=57)) {
c = ((c - 48) * 10) + ((text.charCodeAt(i+1))-48);
c += 130;
i++;
} else c++;
dataCodeWords[n] = c;
n++;
}
return dataCodeWords;
},
addPadCW: function(tab, from, to){
if (from >= to) return ;
tab[from] = 129;
var r, i;
for (i=from+1; i<to; i++){
r = ((149 * (i+1)) % 253) + 1;
tab[i] = (129 + r) % 254;
}
},
calculSolFactorTable: function(solomonCWCount){
var g = new Array();
var i, j;
for (i=0; i<=solomonCWCount; i++) g[i] = 1;
for(i = 1; i <= solomonCWCount; i++) {
for(j = i - 1; j >= 0; j--) {
g[j] = this.champGaloisDoub(g[j], i);
if(j > 0) g[j] = this.champGaloisSum(g[j], g[j-1]);
}
}
return g;
},
addReedSolomonCW: function(nSolomonCW, coeffTab, nDataCW, dataTab, blocks){
var temp = 0;
var errorBlocks = nSolomonCW / blocks;
var correctionCW = new Array();
var i,j,k;
for(k = 0; k < blocks; k++) {
for (i=0; i<errorBlocks; i++) correctionCW[i] = 0;
for (i=k; i<nDataCW; i=i+blocks){
temp = this.champGaloisSum(dataTab[i], correctionCW[errorBlocks-1]);
for (j=errorBlocks-1; j>=0; j--){
if ( !temp ) {
correctionCW[j] = 0;
} else {
correctionCW[j] = this.champGaloisMult(temp, coeffTab[j]);
}
if (j>0) correctionCW[j] = this.champGaloisSum(correctionCW[j-1], correctionCW[j]);
}
}
j = nDataCW + k;
for (i=errorBlocks-1; i>=0; i--){
dataTab[j] = correctionCW[i];
j=j+blocks;
}
}
return dataTab;
},
getBits: function(entier){
var bits = new Array();
for (var i=0; i<8; i++){
bits[i] = entier & (128 >> i) ? 1 : 0;
}
return bits;
},
next: function(etape, totalRows, totalCols, codeWordsBits, datamatrix, assigned){
var chr = 0;
var row = 4;
var col = 0;
do {
if((row == totalRows) && (col == 0)){
this.patternShapeSpecial1(datamatrix, assigned, codeWordsBits[chr], totalRows, totalCols);
chr++;
} else if((etape<3) && (row == totalRows-2) && (col == 0) && (totalCols%4 != 0)){
this.patternShapeSpecial2(datamatrix, assigned, codeWordsBits[chr], totalRows, totalCols);
chr++;
} else if((row == totalRows-2) && (col == 0) && (totalCols%8 == 4)){
this.patternShapeSpecial3(datamatrix, assigned, codeWordsBits[chr], totalRows, totalCols);
chr++;
}
else if((row == totalRows+4) && (col == 2) && (totalCols%8 == 0)){
this.patternShapeSpecial4(datamatrix, assigned, codeWordsBits[chr], totalRows, totalCols);
chr++;
}
do {
if((row < totalRows) && (col >= 0) && (assigned[row][col]!=1)) {
this.patternShapeStandard(datamatrix, assigned, codeWordsBits[chr], row, col, totalRows, totalCols);
chr++;
}
row -= 2;
col += 2;
} while ((row >= 0) && (col < totalCols));
row += 1;
col += 3;
do {
if((row >= 0) && (col < totalCols) && (assigned[row][col]!=1)){
this.patternShapeStandard(datamatrix, assigned, codeWordsBits[chr], row, col, totalRows, totalCols);
chr++;
}
row += 2;
col -= 2;
} while ((row < totalRows) && (col >=0));
row += 3;
col += 1;
} while ((row < totalRows) || (col < totalCols));
},
patternShapeStandard: function(datamatrix, assigned, bits, row, col, totalRows, totalCols){
this.placeBitInDatamatrix(datamatrix, assigned, bits[0], row-2, col-2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[1], row-2, col-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[2], row-1, col-2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[3], row-1, col-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[4], row-1, col, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[5], row, col-2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[6], row, col-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[7], row,  col, totalRows, totalCols);
},
patternShapeSpecial1: function(datamatrix, assigned, bits, totalRows, totalCols ){
this.placeBitInDatamatrix(datamatrix, assigned, bits[0], totalRows-1,  0, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[1], totalRows-1,  1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[2], totalRows-1,  2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[3], 0, totalCols-2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[4], 0, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[5], 1, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[6], 2, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[7], 3, totalCols-1, totalRows, totalCols);
},
patternShapeSpecial2: function(datamatrix, assigned, bits, totalRows, totalCols ){
this.placeBitInDatamatrix(datamatrix, assigned, bits[0], totalRows-3,  0, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[1], totalRows-2,  0, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[2], totalRows-1,  0, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[3], 0, totalCols-4, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[4], 0, totalCols-3, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[5], 0, totalCols-2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[6], 0, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[7], 1, totalCols-1, totalRows, totalCols);
},
patternShapeSpecial3: function(datamatrix, assigned, bits, totalRows, totalCols ){
this.placeBitInDatamatrix(datamatrix, assigned, bits[0], totalRows-3,  0, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[1], totalRows-2,  0, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[2], totalRows-1,  0, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[3], 0, totalCols-2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[4], 0, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[5], 1, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[6], 2, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[7], 3, totalCols-1, totalRows, totalCols);
},
patternShapeSpecial4: function(datamatrix, assigned, bits, totalRows, totalCols ){
this.placeBitInDatamatrix(datamatrix, assigned, bits[0], totalRows-1,  0, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[1], totalRows-1, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[2], 0, totalCols-3, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[3], 0, totalCols-2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[4], 0, totalCols-1, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[5], 1, totalCols-3, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[6], 1, totalCols-2, totalRows, totalCols);
this.placeBitInDatamatrix(datamatrix, assigned, bits[7], 1, totalCols-1, totalRows, totalCols);
},
placeBitInDatamatrix: function(datamatrix, assigned, bit, row, col, totalRows, totalCols){
if (row < 0) {
row += totalRows;
col += 4 - ((totalRows+4)%8);
}
if (col < 0) {
col += totalCols;
row += 4 - ((totalCols+4)%8);
}
if (assigned[row][col] != 1) {
datamatrix[row][col] = bit;
assigned[row][col] = 1;
}
},
addFinderPattern: function(datamatrix, rowsRegion, colsRegion, rowsRegionCW, colsRegionCW){
var totalRowsCW = (rowsRegionCW+2) * rowsRegion;
var totalColsCW = (colsRegionCW+2) * colsRegion;
var datamatrixTemp = new Array();
datamatrixTemp[0] = new Array();
for (var j=0; j<totalColsCW+2; j++){
datamatrixTemp[0][j] = 0;
}
for (var i=0; i<totalRowsCW; i++){
datamatrixTemp[i+1] = new Array();
datamatrixTemp[i+1][0] = 0;
datamatrixTemp[i+1][totalColsCW+1] = 0;
for (var j=0; j<totalColsCW; j++){
if (i%(rowsRegionCW+2) == 0){
if (j%2 == 0){
datamatrixTemp[i+1][j+1] = 1;
} else {
datamatrixTemp[i+1][j+1] = 0;
}
} else if (i%(rowsRegionCW+2) == rowsRegionCW+1){
datamatrixTemp[i+1][j+1] = 1;
} else if (j%(colsRegionCW+2) == colsRegionCW+1){
if (i%2 == 0){
datamatrixTemp[i+1][j+1] = 0;
} else {
datamatrixTemp[i+1][j+1] = 1;
}
} else if (j%(colsRegionCW+2) == 0){
datamatrixTemp[i+1][j+1] = 1;
} else{
datamatrixTemp[i+1][j+1] = 0;
datamatrixTemp[i+1][j+1] = datamatrix[i-1-(2*(parseInt(i/(rowsRegionCW+2))))][j-1-(2*(parseInt(j/(colsRegionCW+2))))];
}
}
}
datamatrixTemp[totalRowsCW+1] = new Array();
for (var j=0; j<totalColsCW+2; j++){
datamatrixTemp[totalRowsCW+1][j] = 0;
}
return datamatrixTemp;
},
getDigit: function(text, rectangular){
var dataCodeWords = this.encodeDataCodeWordsASCII(text);
var dataCWCount = dataCodeWords.length;
var index = this.selectIndex(dataCWCount, rectangular);
var totalDataCWCount = this.dataCWCount[index];
var solomonCWCount = this.solomonCWCount[index];
var totalCWCount = totalDataCWCount + solomonCWCount;
var rowsTotal = this.lengthRows[index];
var colsTotal = this.lengthCols[index];
var rowsRegion = this.regionRows[index];
var colsRegion = this.regionCols[index];
var rowsRegionCW = this.dataRegionRows[index];
var colsRegionCW = this.dataRegionCols[index];
var rowsLengthMatrice = rowsTotal-2*rowsRegion;
var colsLengthMatrice = colsTotal-2*colsRegion;
var blocks = this.interleavedBlocks[index];
var errorBlocks = (solomonCWCount / blocks);
this.addPadCW(dataCodeWords, dataCWCount, totalDataCWCount);
var g = this.calculSolFactorTable(errorBlocks);
this.addReedSolomonCW(solomonCWCount, g, totalDataCWCount, dataCodeWords, blocks);
var codeWordsBits = new Array();
for (var i=0; i<totalCWCount; i++){
codeWordsBits[i] = this.getBits(dataCodeWords[i]);
}
var datamatrix = new Array();
var assigned = new Array();
for (var i=0; i<colsLengthMatrice; i++){
datamatrix[i] = new Array();
assigned[i] = new Array();
}
if ( ((rowsLengthMatrice * colsLengthMatrice) % 8) == 4) {
datamatrix[rowsLengthMatrice-2][colsLengthMatrice-2] = 1;
datamatrix[rowsLengthMatrice-1][colsLengthMatrice-1] = 1;
datamatrix[rowsLengthMatrice-1][colsLengthMatrice-2] = 0;
datamatrix[rowsLengthMatrice-2][colsLengthMatrice-1] = 0;
assigned[rowsLengthMatrice-2][colsLengthMatrice-2] = 1;
assigned[rowsLengthMatrice-1][colsLengthMatrice-1] = 1;
assigned[rowsLengthMatrice-1][colsLengthMatrice-2] = 1;
assigned[rowsLengthMatrice-2][colsLengthMatrice-1] = 1;
}
this.next(0,rowsLengthMatrice,colsLengthMatrice, codeWordsBits, datamatrix, assigned);
datamatrix = this.addFinderPattern(datamatrix, rowsRegion, colsRegion, rowsRegionCW, colsRegionCW);
return datamatrix;
}
},
lec:{
cInt: function(value, byteCount){
var le = '';
for(var i=0; i<byteCount; i++){
le += String.fromCharCode(value & 0xFF);
value = value >> 8;
}
return le;
},
cRgb: function(r,g,b){
return String.fromCharCode(b) + String.fromCharCode(g) + String.fromCharCode(r);
},
cHexColor: function(hex){
var v = parseInt('0x' + hex.substr(1));
var b = v & 0xFF;
v = v >> 8;
var g = v & 0xFF;
var r = v >> 8;
return(this.cRgb(r,g,b));
}
},
hexToRGB: function(hex){
var v = parseInt('0x' + hex.substr(1));
var b = v & 0xFF;
v = v >> 8;
var g = v & 0xFF;
var r = v >> 8;
return({r:r,g:g,b:b});
},
isHexColor: function (value){
var r = new RegExp("#[0-91-F]", "gi");
return  value.match(r);
},
base64Encode: function(value) {
var r = '', c1, c2, c3, b1, b2, b3, b4;
var k = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var i = 0;
while (i < value.length) {
c1 = value.charCodeAt(i++);
c2 = value.charCodeAt(i++);
c3 = value.charCodeAt(i++);
b1 = c1 >> 2;
b2 = ((c1 & 3) << 4) | (c2 >> 4);
b3 = ((c2 & 15) << 2) | (c3 >> 6);
b4 = c3 & 63;
if (isNaN(c2)) b3 = b4 = 64;
else if (isNaN(c3)) b4 = 64;
r += k.charAt(b1) + k.charAt(b2) + k.charAt(b3) + k.charAt(b4);
}
return r;
},
bitStringTo2DArray: function( digit ){
var d = []; d[0] = [];
for(var i=0; i<digit.length; i++) d[0][i] = digit.charAt(i);
return(d);
},
resize: function($container, w){
$container.style.cssText += 'padding: 0px; overflow: auto; width: ' +  w + 'px';
$container.update('');
return $container;
},
digitToBmpRenderer: function($container, settings, digit, hri, mw, mh){
var lines = digit.length;
var columns = digit[0].length;
var i = 0;
var c0 = this.isHexColor(settings.bgColor) ? this.lec.cHexColor(settings.bgColor) : this.lec.cRgb(255,255,255);
var c1 = this.isHexColor(settings.color) ? this.lec.cHexColor(settings.color) : this.lec.cRgb(0,0,0);
var bar0 = '';
var bar1 = '';
for(i=0; i<mw; i++){
bar0 += c0;
bar1 += c1;
}
var bars = '';
var padding = (4 - ((mw * columns * 3) % 4)) % 4;
var dataLen = (mw * columns + padding) * mh * lines;
var pad = '';
for(i=0; i<padding; i++) pad += '\0';
var bmp = 'BM' +
this.lec.cInt(54 + dataLen, 4) +
'\0\0\0\0' +
this.lec.cInt(54, 4) +
this.lec.cInt(40, 4) +
this.lec.cInt(mw * columns, 4) +
this.lec.cInt(mh * lines, 4) +
this.lec.cInt(1, 2) +
this.lec.cInt(24, 2) +
'\0\0\0\0' +
this.lec.cInt(dataLen, 4) +
this.lec.cInt(2835, 4) +
this.lec.cInt(2835, 4) +
this.lec.cInt(0, 4) +
this.lec.cInt(0, 4);
for(var y=lines-1; y>=0; y--){
var line = '';
for (var x=0; x<columns; x++){
line += digit[y][x] == '0' ? bar0 : bar1;
}
line += pad;
for(var k=0; k<mh; k++){
bmp += line;
}
}
var object = document.createElement('object');
object.setAttribute('type', 'image/bmp');
object.setAttribute('data', 'data:image/bmp;base64,'+ this.base64Encode(bmp));
this.resize($container, mw * columns + padding).update(object);
},
digitToBmp: function($container, settings, digit, hri){
var w = Barcode.intval(settings.barWidth);
var h = Barcode.intval(settings.barHeight);
this.digitToBmpRenderer($container, settings, this.bitStringTo2DArray(digit), hri, w, h);
},
digitToBmp2D: function($container, settings, digit, hri){
var s = Barcode.intval(settings.moduleSize);
this.digitToBmpRenderer($container, settings, digit, hri, s, s);
},
digitToCssRenderer : function($container, settings, digit, hri, mw, mh){
var lines = digit.length;
var columns = digit[0].length;
var content = "";
var bar0 = "<div style=\"float: left; font-size: 0px; background-color: " + settings.bgColor + "; height: " + mh + "px; width: &Wpx\"></div>";
var bar1 = "<div style=\"float: left; font-size: 0px; width:0; border-left: &Wpx solid " + settings.color + "; height: " + mh + "px;\"></div>";
var len, current;
for(var y=0; y<lines; y++){
len = 0;
current = digit[y][0];
for (var x=0; x<columns; x++){
if ( current == digit[y][x] ) {
len++;
} else {
content += (current == '0' ? bar0 : bar1).replace("&W", len * mw);
current = digit[y][x];
len=1;
}
}
if (len > 0){
content += (current == '0' ? bar0 : bar1).replace("&W", len * mw);
}
}
if (settings.showHRI){
content += "<div style=\"clear:both; width: 100%; background-color: " + settings.bgColor + "; color: " + settings.color + "; text-align: center; font-size: " + settings.fontSize + "px; margin-top: " + settings.marginHRI + "px;\">"+hri+"</div>";
}
this.resize($container, mw * columns).update(content);
},
digitToCss: function($container, settings, digit, hri){
var w = Barcode.intval(settings.barWidth);
var h = Barcode.intval(settings.barHeight);
this.digitToCssRenderer($container, settings, this.bitStringTo2DArray(digit), hri, w, h);
},
digitToCss2D: function($container, settings, digit, hri){
var s = Barcode.intval(settings.moduleSize);
this.digitToCssRenderer($container, settings, digit, hri, s, s);
},
digitToSvgRenderer: function($container, settings, digit, hri, mw, mh){
var lines = digit.length;
var columns = digit[0].length;
var width = mw * columns;
var height = mh * lines;
if (settings.showHRI){
var fontSize = Barcode.intval(settings.fontSize);
height += Barcode.intval(settings.marginHRI) + fontSize;
}
var svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '">';
svg += '<rect width="' +  width + '" height="' + height + '" x="0" y="0" fill="' + settings.bgColor + '" />';
var bar1 = '<rect width="&W" height="' + mh + '" x="&X" y="&Y" fill="' + settings.color + '" />';
var len, current;
for(var y=0; y<lines; y++){
len = 0;
current = digit[y][0];
for (var x=0; x<columns; x++){
if ( current == digit[y][x] ) {
len++;
} else {
if (current == '1') {
svg += bar1.replace("&W", len * mw).replace("&X", (x - len) * mw).replace("&Y", y * mh);
}
current = digit[y][x];
len=1;
}
}
if ( (len > 0) && (current == '1') ){
svg += bar1.replace("&W", len * mw).replace("&X", (columns - len) * mw).replace("&Y", y * mh);
}
}
if (settings.showHRI){
svg += '<g transform="translate(' + Math.floor(width/2) + ' 0)">';
svg += '<text y="' + (height - Math.floor(fontSize/2)) + '" text-anchor="middle" style="font-family: Arial; font-size: ' + fontSize + 'px;" fill="' + settings.color + '">' + hri + '</text>';
svg += '</g>';
}
svg += '</svg>';
var object = document.createElement('object');
object.setAttribute('type', 'image/svg+xml');
object.setAttribute('data', 'data:image/svg+xml,'+ svg);
this.resize($container, width).update(object);
},
digitToSvg: function($container, settings, digit, hri){
var w = Barcode.intval(settings.barWidth);
var h = Barcode.intval(settings.barHeight);
this.digitToSvgRenderer($container, settings, this.bitStringTo2DArray(digit), hri, w, h);
},
digitToSvg2D: function($container, settings, digit, hri){
var s = Barcode.intval(settings.moduleSize);
this.digitToSvgRenderer($container, settings, digit, hri, s, s);
},
digitToCanvasRenderer : function($container, settings, digit, hri, xi, yi, mw, mh){
var canvas = $container;
if ( !canvas || !canvas.getContext ) return;
var lines = digit.length;
var columns = digit[0].length;
var ctx = canvas.getContext('2d');
ctx.lineWidth = 1;
ctx.lineCap = 'butt';
ctx.fillStyle = settings.bgColor;
ctx.fillRect (xi, yi, columns * mw, lines * mh);
ctx.fillStyle = settings.color;
for(var y=0; y<lines; y++){
var len = 0;
var current = digit[y][0];
for(var x=0; x<columns; x++){
if (current == digit[y][x]) {
len++;
} else {
if (current == '1'){
ctx.fillRect (xi + (x - len) * mw, yi + y * mh, mw * len, mh);
}
current = digit[y][x];
len=1;
}
}
if ( (len > 0) && (current == '1') ){
ctx.fillRect (xi + (columns - len) * mw, yi + y * mh, mw * len, mh);
}
}
if (settings.showHRI){
var dim = ctx.measureText(hri);
ctx.fillText(hri, xi + Math.floor((columns * mw - dim.width)/2), yi + lines * mh + settings.fontSize + settings.marginHRI);
}
},
digitToCanvas: function($container, settings, digit, hri){
var w  = Barcode.intval(settings.barWidth);
var h = Barcode.intval(settings.barHeight);
var x = Barcode.intval(settings.posX);
var y = Barcode.intval(settings.posY);
this.digitToCanvasRenderer($container, settings, this.bitStringTo2DArray(digit), hri, x, y, w, h);
},
digitToCanvas2D: function($container, settings, digit, hri){
var s = Barcode.intval(settings.moduleSize);
var x = Barcode.intval(settings.posX);
var y = Barcode.intval(settings.posY);
this.digitToCanvasRenderer($container, settings, digit, hri, x, y, s, s);
}
};
var barcodeMethod = {
barcode: function(element, datas, type, settings) {
var $this = $(element);
var digit = "",
hri   = "",
code  = "",
crc   = true,
rect  = false,
b2d   = false;
if (typeof(datas) == "string"){
code = datas;
} else if (typeof(datas) == "object"){
code = typeof(datas.code) == "string" ? datas.code : "";
crc = typeof(datas.crc) != "undefined" ? datas.crc : true;
rect = typeof(datas.rect) != "undefined" ? datas.rect : false;
}
if (code == "") return(false);
if (typeof(settings) == "undefined") settings = [];
for(var name in Barcode.settings){
if (settings[name] == undefined) settings[name] = Barcode.settings[name];
}
switch(type){
case "std25":
case "int25":
digit = Barcode.i25.getDigit(code, crc, type);
hri = Barcode.i25.compute(code, crc, type);
break;
case "ean8":
case "ean13":
digit = Barcode.ean.getDigit(code, type);
hri = Barcode.ean.compute(code, type);
break;
case "upc":
digit = Barcode.upc.getDigit(code);
hri = Barcode.upc.compute(code);
break;
case "code11":
digit = Barcode.code11.getDigit(code);
hri = code;
break;
case "code39":
digit = Barcode.code39.getDigit(code);
hri = code;
break;
case "code93":
digit = Barcode.code93.getDigit(code, crc);
hri = code;
break;
case "code128":
digit = Barcode.code128.getDigit(code);
hri = code;
break;
case "codabar":
digit = Barcode.codabar.getDigit(code);
hri = code;
break;
case "msi":
digit = Barcode.msi.getDigit(code, crc);
hri = Barcode.msi.compute(code, crc);
break;
case "datamatrix":
digit = Barcode.datamatrix.getDigit(code, rect);
hri = code;
b2d = true;
break;
}
if (digit.length == 0) return($this);
if ( !b2d && settings.addQuietZone) digit = "0000000000" + digit + "0000000000";
var fname = 'digitTo' + settings.output.charAt(0).toUpperCase() + settings.output.substr(1) + (b2d ? '2D' : '');
if (typeof(Barcode[fname]) == 'function') {
Barcode[fname]($this, settings, digit, hri);
}
return($this);
}
};
Element.addMethods('DIV', barcodeMethod);
Element.addMethods('CANVAS', barcodeMethod);
/*! RESOURCE: UI Action Context Menu */
function showUIActionContext(event) {
if (!g_user.hasRole("ui_action_admin"))
return;
var element = Event.element(event);
if (element.tagName.toLowerCase() == "span")
element = element.parentNode;
var id = element.getAttribute("gsft_id");
var mcm = new GwtContextMenu('context_menu_action_' + id);
mcm.clear();
mcm.addURL(getMessage('Edit UI Action'), "sys_ui_action.do?sys_id=" + id, "gsft_main");
contextShow(event, mcm.getID(), 500, 0, 0);
Event.stop(event);
}
addLoadEvent(function() {
document.on('contextmenu', '.action_context', function (evt, element) {
showUIActionContext(evt);
});
});
/*! RESOURCE: opGenderCircle.directive.js */
(function(angular){
var app = angular.module('opApp');
app.directive("opGenderCircle", function($timeout){
return {
restrict: 'A',
scope: {
data: '='
},
link: function(scope, element){
var circleData = {
datasets: [{
data: scope.data.values,
backgroundColor: scope.data.colors
}]
};
var circleOptions = {
elements: {
arc: {
borderWidth: scope.data.borderWidth
}
},
tooltips: {
enabled: false
},
cutoutPercentage: scope.data.innerCutout,
hover: {
mode: ''
},
responsive: false
};
var config = {
type: 'doughnut',
data: circleData,
options: circleOptions,
plugins: [{
beforeDraw: function(chart, options){
if(scope.data.showDescription) drawText(chart);
}
}]
};
$timeout(function(){
var genderChart = new Chart(element[0].getContext("2d"), config);
},1000);
function drawText(chart){
var width = chart.chart.width;
var height = chart.chart.height;
var ctxInfo = chart.chart.ctx;
var ctxTitle = chart.chart.ctx;
var info = scope.data.info;
var title = scope.data.title;
ctxInfo.restore();
ctxInfo.font = scope.data.infoFont;
ctxInfo.fillStyle = scope.data.infoColor || '#000';
ctxInfo.textBaseline = "middle";
var infoX = Math.round((width - ctxInfo.measureText(info).width) / 2);
var infoY = height / 2 + (scope.data.offsetY ? scope.data.offsetY : 0);
ctxInfo.fillText(info, infoX, infoY);
ctxInfo.save();
ctxTitle.restore();
ctxTitle.font = scope.data.titleFont;
ctxTitle.fillStyle = scope.data.titleColor || '#000';
ctxTitle.textBaseline = "middle";
var titleX = Math.round((width - ctxTitle.measureText(title).width) / 2);
var titleY = infoY + (scope.data.distance ? scope.data.distance : 10);
ctxTitle.fillText(title, titleX, titleY);
ctxTitle.save();
}
}
};
});
})(window.angular);
/*! RESOURCE: AddMembersFromGroup */
var AddMembersFromGroup = Class.create(GlideDialogWindow, {
initialize: function () {
this.setUpFacade();
},
setUpFacade: function () {
GlideDialogWindow.prototype.initialize.call(this, "task_window", false);
this.setTitle(getMessage("Add Members From Group"));
this.setBody(this.getMarkUp(), false, false);
},
setUpEvents: function () {
var dialog = this;
var okButton = $("ok");
if (okButton) {
okButton.on("click", function () {
var mapData = {};
if (dialog.fillDataMap (mapData)) {
var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembersProcessor");
for (var strKey in mapData) {
processor.addParam(strKey, mapData[strKey]);
}
dialog.showStatus(getMessage("Adding group users..."));
processor.getXML(function () {
dialog.refresh();
dialog._onCloseClicked();
});
} else {
dialog._onCloseClicked();
}
});
}
var cancelButton = $("cancel");
if (cancelButton) {
cancelButton.on("click", function () {
dialog._onCloseClicked();
});
}
var okNGButton = $("okNG");
if (okNGButton) {
okNGButton.on("click", function () {
dialog._onCloseClicked();
});
}
var cancelNGButton = $("cancelNG");
if (cancelNGButton) {
cancelNGButton.on("click", function () {
dialog._onCloseClicked();
});
}
},
refresh: function(){
GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
},
getScrumReleaseTeamSysId: function () {
return g_form.getUniqueValue() + "";
},
getUserChosenGroupSysIds: function () {
return $F('groupId') + "";
},
showStatus: function (strMessage) {
$("task_controls").update(strMessage);
},
display: function(bIsVisible) {
$("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
},
getRoleIds: function () {
var arrRoleNames = ["scrum_user", "scrum_admin", "scrum_release_planner", "scrum_sprint_planner", "scrum_story_creator"];
var arrRoleIds = [];
var record = new GlideRecord ("sys_user_role");
record.addQuery ("name", "IN", arrRoleNames.join (","));
record.query ();
while (record.next ())
arrRoleIds.push (record.sys_id + "");
return arrRoleIds;
},
hasScrumRole: function (roleSysId, arrScrumRoleSysIds) {
for (var index = 0; index < arrScrumRoleSysIds.length; ++index)
if (arrScrumRoleSysIds[index] == "" + roleSysId)
return true;
var record = new GlideRecord ("sys_user_role_contains");
record.addQuery("role", roleSysId);
record.query ();
while (record.next())
if (this.hasScrumRole (record.contains, arrScrumRoleSysIds))
return true;
return false;
},
getGroupIds: function () {
var arrScrumRoleIds = this.getRoleIds ();
var arrGroupIds = [];
var record = new GlideRecord ("sys_group_has_role");
record.query ();
while (record.next ())
if (this.hasScrumRole (record.role, arrScrumRoleIds))
arrGroupIds.push (record.group + "");
return arrGroupIds;
},
getGroupInfo: function () {
var mapGroupInfo = {};
var arrRoleIds = this.getRoleIds ();
var arrGroupIds = this.getGroupIds (arrRoleIds);
var record = new GlideRecord ("sys_user_group");
record.addQuery("sys_id", "IN", arrGroupIds.join (","));
record.query ();
while (record.next ()) {
var strName = record.name + "";
var strSysId = record.sys_id + "";
mapGroupInfo [strName] = {name: strName, sysid: strSysId};
}
return mapGroupInfo;
},
getMarkUp: function () {
var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
groupAjax.addParam('sysparm_name', 'getGroupInfo');
groupAjax.getXML(this.generateMarkUp.bind(this));
},
generateMarkUp: function(response) {
var mapGroupInfo = {};
var groupData = response.responseXML.getElementsByTagName("group");
var strName, strSysId;
for (var i = 0; i < groupData.length; i++) {
strName = groupData[i].getAttribute("name");
strSysId = groupData[i].getAttribute("sysid");
mapGroupInfo[strName] = {
name: strName,
sysid: strSysId
};
}
var arrGroupNames = [];
for (var strGroupName in mapGroupInfo) {
arrGroupNames.push (strGroupName + "");
}
arrGroupNames.sort ();
var strMarkUp = "";
if (arrGroupNames.length > 0) {
var strTable = "<table><tr><td><label for='groupId'><select id='groupId'>";
for (var nSlot = 0; nSlot < arrGroupNames.length; ++nSlot) {
strName = arrGroupNames[nSlot];
strSysId = mapGroupInfo [strName].sysid;
strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
}
strTable += "</select></label></td></tr></table>";
strMarkUp = "<div id='task_controls'>" + strTable +
"<div style='text-align: right;'>" +
"<button id='ok' type='button'>" + getMessage("OK") + "</button>" +
"<button id='cancel' type='button'>" + getMessage("Cancel") + "</button></div></div>";
} else {
strMarkUp = "<div id='task_controls'><p>No groups with scrum_user role found</p>" +
"<div style='text-align: right;'>" +
"<button id='okNG' type='button'>" + getMessage("OK") + "</button>" +
"<button id='cancelNG' type='button'>" + getMessage("Cancel") +
"</button></div></div>";
}
this.setBody(strMarkUp, false, false);
this.setUpEvents();
this.display(true);
this.setWidth(180);
},
fillDataMap: function (mapData) {
var strChosenGroupSysId = this.getUserChosenGroupSysIds ();
if (strChosenGroupSysId) {
mapData.sysparm_name = "createReleaseTeamMembers";
mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId ();
mapData.sysparm_groups = strChosenGroupSysId;
return true;
} else {
return false;
}
}
});
/*! RESOURCE: vcard */
(function(context) {
var version = {
"TWO": "2.1",
"THREE": "3.0",
"FOUR": "4.0"
}
var vCard = {
Version: version,
Entry: {
"ADDRESS": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "ADR",
"format": ";;{0};{2};{4};{1};{3}",
"@comment": "usage: addAdr(street, code, city, country, state)"
},
"AGENT": {
"version": [version.TWO, version.THREE],
"key": "AGENT"
},
"ANNIVERSARY": {
"version": [version.FOUR],
"key": "ANNIVERSARY"
},
"BIRTHDAY": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "BDAY"
},
"CALENDARADDURI": {
"version": [version.FOUR],
"key": "CALADRURI"
},
"CALENDARURI": {
"version": [version.FOUR],
"key": "CALURI"
},
"CATEGORIES": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "CATEGORIES"
},
"CLASS": {
"version": [version.THREE],
"key": "CLASS"
},
"CLIENTPIDMAP": {
"version": [version.FOUR],
"key": "CLIENTPIDMAP"
},
"EMAIL": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "EMAIL"
},
"FBURL": {
"version": [version.FOUR],
"key": "FBURL"
},
"FORMATTEDNAME": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "FN"
},
"GENDER": {
"version": [version.FOUR],
"key": "GENDER"
},
"GEO": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "GEO"
},
"IMPP": {
"version": [version.THREE, version.FOUR],
"key": "IMPP"
},
"KIND": {
"version": [version.FOUR],
"key": "KIND"
},
"LABEL": {
"version": [version.TWO, version.THREE],
"key": "LABEL"
},
"MAILER": {
"version": [version.TWO, version.THREE],
"key": "MAILER"
},
"MEMBER": {
"version": [version.FOUR],
"key": "MEMBER"
},
"NAME": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "N",
"format": "{1};{0};;{2}",
"@comment": "usage: addName(firstname, lastname, title)"
},
"NICKNAME": {
"version": [version.THREE, version.FOUR],
"key": "NICKNAME"
},
"NOTE": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "NOTE"
},
"ORGANIZATION": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "ORG"
},
"PRODID": {
"version": [version.THREE, version.FOUR],
"key": "PRODID"
},
"PROFILE": {
"version": [version.TWO, version.THREE],
"key": "PROFILE"
},
"RELATED": {
"version": [version.FOUR],
"key": "RELATED"
},
"REVISION": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "REV"
},
"ROLE": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "ROLE"
},
"SORTSTRING": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "SORT-STRING"
},
"SOURCE": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "SOURCE"
},
"PHONE": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "TEL"
},
"TITLE": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "TITLE"
},
"TIMEZONE": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "TZ"
},
"UID": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "UID"
},
"URL": {
"version": [version.TWO, version.THREE, version.FOUR],
"key": "URL"
},
"XML": {
"version": [version.FOUR],
"key": "XML"
}
},
Type: {
"HOME": "HOME",
"WORK": "WORK",
"CELL": "CELL",
"MAIN": "MAIN",
"OTHER": "OTHER"
},
create: function(version) {
for (var key in this.Version) {
if (this.Version[key] === version)
return new Card(version)
}
throw new Error("Unknown vCard version")
},
dump: function(card) {
var str = "BEGIN:VCARD\n"
for (var key in card) {
var entry = card[key]
if (typeof entry === "function")
continue
if (Object.prototype.toString.call(entry) === "[object Array]") {
for (var i = 0, l = entry.length; i < l; i++) {
var e = entry[i]
str += key.toUpperCase() + (e.type ? ";TYPE=" + e.type.toUpperCase() + ":" : ":") + e.value + "\n"
}
} else if (typeof entry === "object") {
str += key.toUpperCase() + (entry.type ? ";TYPE=" + entry.type.toUpperCase() + ":" : ":") + entry.value + "\n"
} else {
str += key.toUpperCase() + ":" + entry + "\n"
}
}
str += "END:VCARD"
return str
},
getvcard: function(card, name, force) {
var a = document.createElement('a')
a.download = name + ".vcf"
a.textContent = name
if (Blob) {
var blob = new Blob([this.dump(card)], {
"type": "text/vcard"
})
a.href = URL.createObjectURL(blob)
} else {
a.href = "data:text/vcard;base64," + this.btoa(this.dump(card))
}
force && a.click()
return a
},
getBase64card: function(card, name, force) {
var a = document.createElement('a');
a.download = name + ".vcf";
a.textContent = name;
a.href = "data:text/vcard;base64," + this.btoa(this.dump(card));
force && a.click();
return a;
},
btoa: function(str) {
str = unescape(encodeURIComponent(str))
if (!btoa) {
var b64c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var i, res = "",
length = str.length;
for (i = 0; i < length - 2; i += 3) {
res += b64c[str.charCodeAt(i) >>> 2];
res += b64c[((str.charCodeAt(i) & 3) << 4) | (str.charCodeAt(i + 1) >>> 4)];
res += b64c[((str.charCodeAt(i + 1) & 15) << 2) | (str.charCodeAt(i + 2) >>> 6)];
res += b64c[str.charCodeAt(i + 2) & 63];
}
if (length % 3 === 2) {
res += b64c[str.charCodeAt(i) >>> 2];
res += b64c[((str.charCodeAt(i) & 3) << 4) | (str.charCodeAt(i + 1) >>> 4)];
res += b64c[((str.charCodeAt(i + 1) & 15) << 2)];
res += "=";
} else if (length % 3 === 1) {
res += b64c[str.charCodeAt(i) >>> 2];
res += b64c[((str.charCodeAt(i) & 3) << 4)];
res += "==";
}
return res;
} else {
return btoa(str)
}
}
}
var Card = function(version) {
this.version = version
for (var key in vCard.Entry) {
var property = vCard.Entry[key]
if (!property.version || property.version.indexOf(version) < 0)
continue
var fn = "add" + key[0].toUpperCase() + key.slice(1).toLowerCase()
Card.prototype[fn] = (function(key, format) {
return (function() {
var args = Array.prototype.slice.call(arguments)
var lastArg = args.length > 0 ? args[args.length - 1] : undefined
var model = vCard.Type.hasOwnProperty(lastArg) ? args.slice(0, args.length - 1) : args
var value = format && format.replace(/\{([0-9]*)\}/g, function(match, parameter) {
return model[parseInt(parameter)] || ''
}) || model[0]
this.add(key, value, vCard.Type.hasOwnProperty(lastArg) && lastArg)
})
})(property.key, property.format)
}
this.add = function(entry, value, type) {
var key = (typeof entry === "object" && entry.key) ? entry.key : entry
!this[key] && (this[key] = [])
var e = {
"value": value
}
type && (e.type = type)
this[key].push(e)
}
}
context.vCard = vCard
})(this)
/*! RESOURCE: htmldocxjs.js */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.htmlDocx=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var base64 = _dereq_('base64-js')
var ieee754 = _dereq_('ieee754')
var isArray = _dereq_('is-array')
exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192
var kMaxLength = 0x3fffffff
Buffer.TYPED_ARRAY_SUPPORT = (function () {
try {
var buf = new ArrayBuffer(0)
var arr = new Uint8Array(buf)
arr.foo = function () { return 42 }
return 42 === arr.foo() &&
typeof arr.subarray === 'function' &&
new Uint8Array(1).subarray(1, 1).byteLength === 0
} catch (e) {
return false
}
})()
function Buffer (subject, encoding, noZero) {
if (!(this instanceof Buffer))
return new Buffer(subject, encoding, noZero)
var type = typeof subject
var length
if (type === 'number')
length = subject > 0 ? subject >>> 0 : 0
else if (type === 'string') {
if (encoding === 'base64')
subject = base64clean(subject)
length = Buffer.byteLength(subject, encoding)
} else if (type === 'object' && subject !== null) {
if (subject.type === 'Buffer' && isArray(subject.data))
subject = subject.data
length = +subject.length > 0 ? Math.floor(+subject.length) : 0
} else
throw new TypeError('must start with number, buffer, array or string')
if (this.length > kMaxLength)
throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
'size: 0x' + kMaxLength.toString(16) + ' bytes')
var buf
if (Buffer.TYPED_ARRAY_SUPPORT) {
buf = Buffer._augment(new Uint8Array(length))
} else {
buf = this
buf.length = length
buf._isBuffer = true
}
var i
if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
buf._set(subject)
} else if (isArrayish(subject)) {
if (Buffer.isBuffer(subject)) {
for (i = 0; i < length; i++)
buf[i] = subject.readUInt8(i)
} else {
for (i = 0; i < length; i++)
buf[i] = ((subject[i] % 256) + 256) % 256
}
} else if (type === 'string') {
buf.write(subject, 0, encoding)
} else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
for (i = 0; i < length; i++) {
buf[i] = 0
}
}
return buf
}
Buffer.isBuffer = function (b) {
return !!(b != null && b._isBuffer)
}
Buffer.compare = function (a, b) {
if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
throw new TypeError('Arguments must be Buffers')
var x = a.length
var y = b.length
for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
if (i !== len) {
x = a[i]
y = b[i]
}
if (x < y) return -1
if (y < x) return 1
return 0
}
Buffer.isEncoding = function (encoding) {
switch (String(encoding).toLowerCase()) {
case 'hex':
case 'utf8':
case 'utf-8':
case 'ascii':
case 'binary':
case 'base64':
case 'raw':
case 'ucs2':
case 'ucs-2':
case 'utf16le':
case 'utf-16le':
return true
default:
return false
}
}
Buffer.concat = function (list, totalLength) {
if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')
if (list.length === 0) {
return new Buffer(0)
} else if (list.length === 1) {
return list[0]
}
var i
if (totalLength === undefined) {
totalLength = 0
for (i = 0; i < list.length; i++) {
totalLength += list[i].length
}
}
var buf = new Buffer(totalLength)
var pos = 0
for (i = 0; i < list.length; i++) {
var item = list[i]
item.copy(buf, pos)
pos += item.length
}
return buf
}
Buffer.byteLength = function (str, encoding) {
var ret
str = str + ''
switch (encoding || 'utf8') {
case 'ascii':
case 'binary':
case 'raw':
ret = str.length
break
case 'ucs2':
case 'ucs-2':
case 'utf16le':
case 'utf-16le':
ret = str.length * 2
break
case 'hex':
ret = str.length >>> 1
break
case 'utf8':
case 'utf-8':
ret = utf8ToBytes(str).length
break
case 'base64':
ret = base64ToBytes(str).length
break
default:
ret = str.length
}
return ret
}
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined
Buffer.prototype.toString = function (encoding, start, end) {
var loweredCase = false
start = start >>> 0
end = end === undefined || end === Infinity ? this.length : end >>> 0
if (!encoding) encoding = 'utf8'
if (start < 0) start = 0
if (end > this.length) end = this.length
if (end <= start) return ''
while (true) {
switch (encoding) {
case 'hex':
return hexSlice(this, start, end)
case 'utf8':
case 'utf-8':
return utf8Slice(this, start, end)
case 'ascii':
return asciiSlice(this, start, end)
case 'binary':
return binarySlice(this, start, end)
case 'base64':
return base64Slice(this, start, end)
case 'ucs2':
case 'ucs-2':
case 'utf16le':
case 'utf-16le':
return utf16leSlice(this, start, end)
default:
if (loweredCase)
throw new TypeError('Unknown encoding: ' + encoding)
encoding = (encoding + '').toLowerCase()
loweredCase = true
}
}
}
Buffer.prototype.equals = function (b) {
if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
return Buffer.compare(this, b) === 0
}
Buffer.prototype.inspect = function () {
var str = ''
var max = exports.INSPECT_MAX_BYTES
if (this.length > 0) {
str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
if (this.length > max)
str += ' ... '
}
return '<Buffer ' + str + '>'
}
Buffer.prototype.compare = function (b) {
if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
return Buffer.compare(this, b)
}
Buffer.prototype.get = function (offset) {
console.log('.get() is deprecated. Access using array indexes instead.')
return this.readUInt8(offset)
}
Buffer.prototype.set = function (v, offset) {
console.log('.set() is deprecated. Access using array indexes instead.')
return this.writeUInt8(v, offset)
}
function hexWrite (buf, string, offset, length) {
offset = Number(offset) || 0
var remaining = buf.length - offset
if (!length) {
length = remaining
} else {
length = Number(length)
if (length > remaining) {
length = remaining
}
}
var strLen = string.length
if (strLen % 2 !== 0) throw new Error('Invalid hex string')
if (length > strLen / 2) {
length = strLen / 2
}
for (var i = 0; i < length; i++) {
var byte = parseInt(string.substr(i * 2, 2), 16)
if (isNaN(byte)) throw new Error('Invalid hex string')
buf[offset + i] = byte
}
return i
}
function utf8Write (buf, string, offset, length) {
var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
return charsWritten
}
function asciiWrite (buf, string, offset, length) {
var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
return charsWritten
}
function binaryWrite (buf, string, offset, length) {
return asciiWrite(buf, string, offset, length)
}
function base64Write (buf, string, offset, length) {
var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
return charsWritten
}
function utf16leWrite (buf, string, offset, length) {
var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length, 2)
return charsWritten
}
Buffer.prototype.write = function (string, offset, length, encoding) {
if (isFinite(offset)) {
if (!isFinite(length)) {
encoding = length
length = undefined
}
} else {
var swap = encoding
encoding = offset
offset = length
length = swap
}
offset = Number(offset) || 0
var remaining = this.length - offset
if (!length) {
length = remaining
} else {
length = Number(length)
if (length > remaining) {
length = remaining
}
}
encoding = String(encoding || 'utf8').toLowerCase()
var ret
switch (encoding) {
case 'hex':
ret = hexWrite(this, string, offset, length)
break
case 'utf8':
case 'utf-8':
ret = utf8Write(this, string, offset, length)
break
case 'ascii':
ret = asciiWrite(this, string, offset, length)
break
case 'binary':
ret = binaryWrite(this, string, offset, length)
break
case 'base64':
ret = base64Write(this, string, offset, length)
break
case 'ucs2':
case 'ucs-2':
case 'utf16le':
case 'utf-16le':
ret = utf16leWrite(this, string, offset, length)
break
default:
throw new TypeError('Unknown encoding: ' + encoding)
}
return ret
}
Buffer.prototype.toJSON = function () {
return {
type: 'Buffer',
data: Array.prototype.slice.call(this._arr || this, 0)
}
}
function base64Slice (buf, start, end) {
if (start === 0 && end === buf.length) {
return base64.fromByteArray(buf)
} else {
return base64.fromByteArray(buf.slice(start, end))
}
}
function utf8Slice (buf, start, end) {
var res = ''
var tmp = ''
end = Math.min(buf.length, end)
for (var i = start; i < end; i++) {
if (buf[i] <= 0x7F) {
res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
tmp = ''
} else {
tmp += '%' + buf[i].toString(16)
}
}
return res + decodeUtf8Char(tmp)
}
function asciiSlice (buf, start, end) {
var ret = ''
end = Math.min(buf.length, end)
for (var i = start; i < end; i++) {
ret += String.fromCharCode(buf[i])
}
return ret
}
function binarySlice (buf, start, end) {
return asciiSlice(buf, start, end)
}
function hexSlice (buf, start, end) {
var len = buf.length
if (!start || start < 0) start = 0
if (!end || end < 0 || end > len) end = len
var out = ''
for (var i = start; i < end; i++) {
out += toHex(buf[i])
}
return out
}
function utf16leSlice (buf, start, end) {
var bytes = buf.slice(start, end)
var res = ''
for (var i = 0; i < bytes.length; i += 2) {
res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
}
return res
}
Buffer.prototype.slice = function (start, end) {
var len = this.length
start = ~~start
end = end === undefined ? len : ~~end
if (start < 0) {
start += len;
if (start < 0)
start = 0
} else if (start > len) {
start = len
}
if (end < 0) {
end += len
if (end < 0)
end = 0
} else if (end > len) {
end = len
}
if (end < start)
end = start
if (Buffer.TYPED_ARRAY_SUPPORT) {
return Buffer._augment(this.subarray(start, end))
} else {
var sliceLen = end - start
var newBuf = new Buffer(sliceLen, undefined, true)
for (var i = 0; i < sliceLen; i++) {
newBuf[i] = this[i + start]
}
return newBuf
}
}
function checkOffset (offset, ext, length) {
if ((offset % 1) !== 0 || offset < 0)
throw new RangeError('offset is not uint')
if (offset + ext > length)
throw new RangeError('Trying to access beyond buffer length')
}
Buffer.prototype.readUInt8 = function (offset, noAssert) {
if (!noAssert)
checkOffset(offset, 1, this.length)
return this[offset]
}
Buffer.prototype.readUInt16LE = function (offset, noAssert) {
if (!noAssert)
checkOffset(offset, 2, this.length)
return this[offset] | (this[offset + 1] << 8)
}
Buffer.prototype.readUInt16BE = function (offset, noAssert) {
if (!noAssert)
checkOffset(offset, 2, this.length)
return (this[offset] << 8) | this[offset + 1]
}
Buffer.prototype.readUInt32LE = function (offset, noAssert) {
if (!noAssert)
checkOffset(offset, 4, this.length)
return ((this[offset]) |
(this[offset + 1] << 8) |
(this[offset + 2] << 16)) +
(this[offset + 3] * 0x1000000)
}
Buffer.prototype.readUInt32BE = function (offset, noAssert) {
if (!noAssert)
checkOffset(offset, 4, this.length)
return (this[offset] * 0x1000000) +
((this[offset + 1] << 16) |
(this[offset + 2] << 8) |
this[offset + 3])
}
Buffer.prototype.readInt8 = function (offset, noAssert) {
if (!noAssert)
checkOffset(offset, 1, this.length)
if (!(this[offset] & 0x80))
return (this[offset])
return ((0xff - this[offset] + 1) * -1)
}
Buffer.prototype.readInt16LE = function (offset, noAssert) {
if (!noAssert)
checkOffset(offset, 2, this.length)
var val = this[offset] | (this[offset + 1] << 8)
return (val & 0x8000) ? val | 0xFFFF0000 : val
}
Buffer.prototype.readInt16BE = function (offset, noAssert) {
if (!noAssert)
checkOffset(offset, 2, this.length)
var val = this[offset + 1] | (this[offset] << 8)
return (val & 0x8000) ? val | 0xFFFF0000 : val
}
Buffer.prototype.readInt32LE = function (offset, noAssert) {
if (!noAssert)
checkOffset(offset, 4, this.length)
return (this[offset]) |
(this[offset + 1] << 8) |
(this[offset + 2] << 16) |
(this[offset + 3] << 24)
}
Buffer.prototype.readInt32BE = function (offset, noAssert) {
if (!noAssert)
checkOffset(offset, 4, this.length)
return (this[offset] << 24) |
(this[offset + 1] << 16) |
(this[offset + 2] << 8) |
(this[offset + 3])
}
Buffer.prototype.readFloatLE = function (offset, noAssert) {
if (!noAssert)
checkOffset(offset, 4, this.length)
return ieee754.read(this, offset, true, 23, 4)
}
Buffer.prototype.readFloatBE = function (offset, noAssert) {
if (!noAssert)
checkOffset(offset, 4, this.length)
return ieee754.read(this, offset, false, 23, 4)
}
Buffer.prototype.readDoubleLE = function (offset, noAssert) {
if (!noAssert)
checkOffset(offset, 8, this.length)
return ieee754.read(this, offset, true, 52, 8)
}
Buffer.prototype.readDoubleBE = function (offset, noAssert) {
if (!noAssert)
checkOffset(offset, 8, this.length)
return ieee754.read(this, offset, false, 52, 8)
}
function checkInt (buf, value, offset, ext, max, min) {
if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
if (value > max || value < min) throw new TypeError('value is out of bounds')
if (offset + ext > buf.length) throw new TypeError('index out of range')
}
Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
value = +value
offset = offset >>> 0
if (!noAssert)
checkInt(this, value, offset, 1, 0xff, 0)
if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
this[offset] = value
return offset + 1
}
function objectWriteUInt16 (buf, value, offset, littleEndian) {
if (value < 0) value = 0xffff + value + 1
for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
(littleEndian ? i : 1 - i) * 8
}
}
Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
value = +value
offset = offset >>> 0
if (!noAssert)
checkInt(this, value, offset, 2, 0xffff, 0)
if (Buffer.TYPED_ARRAY_SUPPORT) {
this[offset] = value
this[offset + 1] = (value >>> 8)
} else objectWriteUInt16(this, value, offset, true)
return offset + 2
}
Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
value = +value
offset = offset >>> 0
if (!noAssert)
checkInt(this, value, offset, 2, 0xffff, 0)
if (Buffer.TYPED_ARRAY_SUPPORT) {
this[offset] = (value >>> 8)
this[offset + 1] = value
} else objectWriteUInt16(this, value, offset, false)
return offset + 2
}
function objectWriteUInt32 (buf, value, offset, littleEndian) {
if (value < 0) value = 0xffffffff + value + 1
for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
}
}
Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
value = +value
offset = offset >>> 0
if (!noAssert)
checkInt(this, value, offset, 4, 0xffffffff, 0)
if (Buffer.TYPED_ARRAY_SUPPORT) {
this[offset + 3] = (value >>> 24)
this[offset + 2] = (value >>> 16)
this[offset + 1] = (value >>> 8)
this[offset] = value
} else objectWriteUInt32(this, value, offset, true)
return offset + 4
}
Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
value = +value
offset = offset >>> 0
if (!noAssert)
checkInt(this, value, offset, 4, 0xffffffff, 0)
if (Buffer.TYPED_ARRAY_SUPPORT) {
this[offset] = (value >>> 24)
this[offset + 1] = (value >>> 16)
this[offset + 2] = (value >>> 8)
this[offset + 3] = value
} else objectWriteUInt32(this, value, offset, false)
return offset + 4
}
Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
value = +value
offset = offset >>> 0
if (!noAssert)
checkInt(this, value, offset, 1, 0x7f, -0x80)
if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
if (value < 0) value = 0xff + value + 1
this[offset] = value
return offset + 1
}
Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
value = +value
offset = offset >>> 0
if (!noAssert)
checkInt(this, value, offset, 2, 0x7fff, -0x8000)
if (Buffer.TYPED_ARRAY_SUPPORT) {
this[offset] = value
this[offset + 1] = (value >>> 8)
} else objectWriteUInt16(this, value, offset, true)
return offset + 2
}
Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
value = +value
offset = offset >>> 0
if (!noAssert)
checkInt(this, value, offset, 2, 0x7fff, -0x8000)
if (Buffer.TYPED_ARRAY_SUPPORT) {
this[offset] = (value >>> 8)
this[offset + 1] = value
} else objectWriteUInt16(this, value, offset, false)
return offset + 2
}
Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
value = +value
offset = offset >>> 0
if (!noAssert)
checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
if (Buffer.TYPED_ARRAY_SUPPORT) {
this[offset] = value
this[offset + 1] = (value >>> 8)
this[offset + 2] = (value >>> 16)
this[offset + 3] = (value >>> 24)
} else objectWriteUInt32(this, value, offset, true)
return offset + 4
}
Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
value = +value
offset = offset >>> 0
if (!noAssert)
checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
if (value < 0) value = 0xffffffff + value + 1
if (Buffer.TYPED_ARRAY_SUPPORT) {
this[offset] = (value >>> 24)
this[offset + 1] = (value >>> 16)
this[offset + 2] = (value >>> 8)
this[offset + 3] = value
} else objectWriteUInt32(this, value, offset, false)
return offset + 4
}
function checkIEEE754 (buf, value, offset, ext, max, min) {
if (value > max || value < min) throw new TypeError('value is out of bounds')
if (offset + ext > buf.length) throw new TypeError('index out of range')
}
function writeFloat (buf, value, offset, littleEndian, noAssert) {
if (!noAssert)
checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
ieee754.write(buf, value, offset, littleEndian, 23, 4)
return offset + 4
}
Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
return writeFloat(this, value, offset, true, noAssert)
}
Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
return writeFloat(this, value, offset, false, noAssert)
}
function writeDouble (buf, value, offset, littleEndian, noAssert) {
if (!noAssert)
checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
ieee754.write(buf, value, offset, littleEndian, 52, 8)
return offset + 8
}
Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
return writeDouble(this, value, offset, true, noAssert)
}
Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
return writeDouble(this, value, offset, false, noAssert)
}
Buffer.prototype.copy = function (target, target_start, start, end) {
var source = this
if (!start) start = 0
if (!end && end !== 0) end = this.length
if (!target_start) target_start = 0
if (end === start) return
if (target.length === 0 || source.length === 0) return
if (end < start) throw new TypeError('sourceEnd < sourceStart')
if (target_start < 0 || target_start >= target.length)
throw new TypeError('targetStart out of bounds')
if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')
if (end > this.length)
end = this.length
if (target.length - target_start < end - start)
end = target.length - target_start + start
var len = end - start
if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
for (var i = 0; i < len; i++) {
target[i + target_start] = this[i + start]
}
} else {
target._set(this.subarray(start, start + len), target_start)
}
}
Buffer.prototype.fill = function (value, start, end) {
if (!value) value = 0
if (!start) start = 0
if (!end) end = this.length
if (end < start) throw new TypeError('end < start')
if (end === start) return
if (this.length === 0) return
if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
if (end < 0 || end > this.length) throw new TypeError('end out of bounds')
var i
if (typeof value === 'number') {
for (i = start; i < end; i++) {
this[i] = value
}
} else {
var bytes = utf8ToBytes(value.toString())
var len = bytes.length
for (i = start; i < end; i++) {
this[i] = bytes[i % len]
}
}
return this
}
Buffer.prototype.toArrayBuffer = function () {
if (typeof Uint8Array !== 'undefined') {
if (Buffer.TYPED_ARRAY_SUPPORT) {
return (new Buffer(this)).buffer
} else {
var buf = new Uint8Array(this.length)
for (var i = 0, len = buf.length; i < len; i += 1) {
buf[i] = this[i]
}
return buf.buffer
}
} else {
throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
}
}
var BP = Buffer.prototype
Buffer._augment = function (arr) {
arr.constructor = Buffer
arr._isBuffer = true
arr._get = arr.get
arr._set = arr.set
arr.get = BP.get
arr.set = BP.set
arr.write = BP.write
arr.toString = BP.toString
arr.toLocaleString = BP.toString
arr.toJSON = BP.toJSON
arr.equals = BP.equals
arr.compare = BP.compare
arr.copy = BP.copy
arr.slice = BP.slice
arr.readUInt8 = BP.readUInt8
arr.readUInt16LE = BP.readUInt16LE
arr.readUInt16BE = BP.readUInt16BE
arr.readUInt32LE = BP.readUInt32LE
arr.readUInt32BE = BP.readUInt32BE
arr.readInt8 = BP.readInt8
arr.readInt16LE = BP.readInt16LE
arr.readInt16BE = BP.readInt16BE
arr.readInt32LE = BP.readInt32LE
arr.readInt32BE = BP.readInt32BE
arr.readFloatLE = BP.readFloatLE
arr.readFloatBE = BP.readFloatBE
arr.readDoubleLE = BP.readDoubleLE
arr.readDoubleBE = BP.readDoubleBE
arr.writeUInt8 = BP.writeUInt8
arr.writeUInt16LE = BP.writeUInt16LE
arr.writeUInt16BE = BP.writeUInt16BE
arr.writeUInt32LE = BP.writeUInt32LE
arr.writeUInt32BE = BP.writeUInt32BE
arr.writeInt8 = BP.writeInt8
arr.writeInt16LE = BP.writeInt16LE
arr.writeInt16BE = BP.writeInt16BE
arr.writeInt32LE = BP.writeInt32LE
arr.writeInt32BE = BP.writeInt32BE
arr.writeFloatLE = BP.writeFloatLE
arr.writeFloatBE = BP.writeFloatBE
arr.writeDoubleLE = BP.writeDoubleLE
arr.writeDoubleBE = BP.writeDoubleBE
arr.fill = BP.fill
arr.inspect = BP.inspect
arr.toArrayBuffer = BP.toArrayBuffer
return arr
}
var INVALID_BASE64_RE = /[^+\/0-9A-z]/g
function base64clean (str) {
str = stringtrim(str).replace(INVALID_BASE64_RE, '')
while (str.length % 4 !== 0) {
str = str + '='
}
return str
}
function stringtrim (str) {
if (str.trim) return str.trim()
return str.replace(/^\s+|\s+$/g, '')
}
function isArrayish (subject) {
return isArray(subject) || Buffer.isBuffer(subject) ||
subject && typeof subject === 'object' &&
typeof subject.length === 'number'
}
function toHex (n) {
if (n < 16) return '0' + n.toString(16)
return n.toString(16)
}
function utf8ToBytes (str) {
var byteArray = []
for (var i = 0; i < str.length; i++) {
var b = str.charCodeAt(i)
if (b <= 0x7F) {
byteArray.push(b)
} else {
var start = i
if (b >= 0xD800 && b <= 0xDFFF) i++
var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
for (var j = 0; j < h.length; j++) {
byteArray.push(parseInt(h[j], 16))
}
}
}
return byteArray
}
function asciiToBytes (str) {
var byteArray = []
for (var i = 0; i < str.length; i++) {
byteArray.push(str.charCodeAt(i) & 0xFF)
}
return byteArray
}
function utf16leToBytes (str) {
var c, hi, lo
var byteArray = []
for (var i = 0; i < str.length; i++) {
c = str.charCodeAt(i)
hi = c >> 8
lo = c % 256
byteArray.push(lo)
byteArray.push(hi)
}
return byteArray
}
function base64ToBytes (str) {
return base64.toByteArray(str)
}
function blitBuffer (src, dst, offset, length, unitSize) {
if (unitSize) length -= length % unitSize;
for (var i = 0; i < length; i++) {
if ((i + offset >= dst.length) || (i >= src.length))
break
dst[i + offset] = src[i]
}
return i
}
function decodeUtf8Char (str) {
try {
return decodeURIComponent(str)
} catch (err) {
return String.fromCharCode(0xFFFD)
}
}
},{"base64-js":2,"ieee754":3,"is-array":4}],2:[function(_dereq_,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
;(function (exports) {
'use strict';
var Arr = (typeof Uint8Array !== 'undefined')
? Uint8Array
: Array
var PLUS   = '+'.charCodeAt(0)
var SLASH  = '/'.charCodeAt(0)
var NUMBER = '0'.charCodeAt(0)
var LOWER  = 'a'.charCodeAt(0)
var UPPER  = 'A'.charCodeAt(0)
function decode (elt) {
var code = elt.charCodeAt(0)
if (code === PLUS)
return 62
if (code === SLASH)
return 63
if (code < NUMBER)
return -1
if (code < NUMBER + 10)
return code - NUMBER + 26 + 26
if (code < UPPER + 26)
return code - UPPER
if (code < LOWER + 26)
return code - LOWER + 26
}
function b64ToByteArray (b64) {
var i, j, l, tmp, placeHolders, arr
if (b64.length % 4 > 0) {
throw new Error('Invalid string. Length must be a multiple of 4')
}
var len = b64.length
placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0
arr = new Arr(b64.length * 3 / 4 - placeHolders)
l = placeHolders > 0 ? b64.length - 4 : b64.length
var L = 0
function push (v) {
arr[L++] = v
}
for (i = 0, j = 0; i < l; i += 4, j += 3) {
tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
push((tmp & 0xFF0000) >> 16)
push((tmp & 0xFF00) >> 8)
push(tmp & 0xFF)
}
if (placeHolders === 2) {
tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
push(tmp & 0xFF)
} else if (placeHolders === 1) {
tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
push((tmp >> 8) & 0xFF)
push(tmp & 0xFF)
}
return arr
}
function uint8ToBase64 (uint8) {
var i,
extraBytes = uint8.length % 3,
output = "",
temp, length
function encode (num) {
return lookup.charAt(num)
}
function tripletToBase64 (num) {
return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
}
for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
output += tripletToBase64(temp)
}
switch (extraBytes) {
case 1:
temp = uint8[uint8.length - 1]
output += encode(temp >> 2)
output += encode((temp << 4) & 0x3F)
output += '=='
break
case 2:
temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
output += encode(temp >> 10)
output += encode((temp >> 4) & 0x3F)
output += encode((temp << 2) & 0x3F)
output += '='
break
}
return output
}
exports.toByteArray = b64ToByteArray
exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))
},{}],3:[function(_dereq_,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
var e, m
var eLen = nBytes * 8 - mLen - 1
var eMax = (1 << eLen) - 1
var eBias = eMax >> 1
var nBits = -7
var i = isLE ? (nBytes - 1) : 0
var d = isLE ? -1 : 1
var s = buffer[offset + i]
i += d
e = s & ((1 << (-nBits)) - 1)
s >>= (-nBits)
nBits += eLen
for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
m = e & ((1 << (-nBits)) - 1)
e >>= (-nBits)
nBits += mLen
for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
if (e === 0) {
e = 1 - eBias
} else if (e === eMax) {
return m ? NaN : ((s ? -1 : 1) * Infinity)
} else {
m = m + Math.pow(2, mLen)
e = e - eBias
}
return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}
exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
var e, m, c
var eLen = nBytes * 8 - mLen - 1
var eMax = (1 << eLen) - 1
var eBias = eMax >> 1
var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
var i = isLE ? 0 : (nBytes - 1)
var d = isLE ? 1 : -1
var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
value = Math.abs(value)
if (isNaN(value) || value === Infinity) {
m = isNaN(value) ? 1 : 0
e = eMax
} else {
e = Math.floor(Math.log(value) / Math.LN2)
if (value * (c = Math.pow(2, -e)) < 1) {
e--
c *= 2
}
if (e + eBias >= 1) {
value += rt / c
} else {
value += rt * Math.pow(2, 1 - eBias)
}
if (value * c >= 2) {
e++
c /= 2
}
if (e + eBias >= eMax) {
m = 0
e = eMax
} else if (e + eBias >= 1) {
m = (value * c - 1) * Math.pow(2, mLen)
e = e + eBias
} else {
m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
e = 0
}
}
for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
e = (e << mLen) | m
eLen += mLen
for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
buffer[offset + i - d] |= s * 128
}
},{}],4:[function(_dereq_,module,exports){
var isArray = Array.isArray;
var str = Object.prototype.toString;
module.exports = isArray || function (val) {
return !! val && '[object Array]' == str.call(val);
};
},{}],5:[function(_dereq_,module,exports){
'use strict';
var DataReader = _dereq_('./dataReader');
function ArrayReader(data) {
if (data) {
this.data = data;
this.length = this.data.length;
this.index = 0;
this.zero = 0;
for(var i = 0; i < this.data.length; i++) {
data[i] = data[i] & 0xFF;
}
}
}
ArrayReader.prototype = new DataReader();
ArrayReader.prototype.byteAt = function(i) {
return this.data[this.zero + i];
};
ArrayReader.prototype.lastIndexOfSignature = function(sig) {
var sig0 = sig.charCodeAt(0),
sig1 = sig.charCodeAt(1),
sig2 = sig.charCodeAt(2),
sig3 = sig.charCodeAt(3);
for (var i = this.length - 4; i >= 0; --i) {
if (this.data[i] === sig0 && this.data[i + 1] === sig1 && this.data[i + 2] === sig2 && this.data[i + 3] === sig3) {
return i - this.zero;
}
}
return -1;
};
ArrayReader.prototype.readData = function(size) {
this.checkOffset(size);
if(size === 0) {
return [];
}
var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
this.index += size;
return result;
};
module.exports = ArrayReader;
},{"./dataReader":10}],6:[function(_dereq_,module,exports){
'use strict';
var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
exports.encode = function(input, utf8) {
var output = "";
var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
var i = 0;
while (i < input.length) {
chr1 = input.charCodeAt(i++);
chr2 = input.charCodeAt(i++);
chr3 = input.charCodeAt(i++);
enc1 = chr1 >> 2;
enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
enc4 = chr3 & 63;
if (isNaN(chr2)) {
enc3 = enc4 = 64;
}
else if (isNaN(chr3)) {
enc4 = 64;
}
output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
}
return output;
};
exports.decode = function(input, utf8) {
var output = "";
var chr1, chr2, chr3;
var enc1, enc2, enc3, enc4;
var i = 0;
input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
while (i < input.length) {
enc1 = _keyStr.indexOf(input.charAt(i++));
enc2 = _keyStr.indexOf(input.charAt(i++));
enc3 = _keyStr.indexOf(input.charAt(i++));
enc4 = _keyStr.indexOf(input.charAt(i++));
chr1 = (enc1 << 2) | (enc2 >> 4);
chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
chr3 = ((enc3 & 3) << 6) | enc4;
output = output + String.fromCharCode(chr1);
if (enc3 != 64) {
output = output + String.fromCharCode(chr2);
}
if (enc4 != 64) {
output = output + String.fromCharCode(chr3);
}
}
return output;
};
},{}],7:[function(_dereq_,module,exports){
'use strict';
function CompressedObject() {
this.compressedSize = 0;
this.uncompressedSize = 0;
this.crc32 = 0;
this.compressionMethod = null;
this.compressedContent = null;
}
CompressedObject.prototype = {
getContent: function() {
return null;
},
getCompressedContent: function() {
return null;
}
};
module.exports = CompressedObject;
},{}],8:[function(_dereq_,module,exports){
'use strict';
exports.STORE = {
magic: "\x00\x00",
compress: function(content, compressionOptions) {
return content;
},
uncompress: function(content) {
return content;
},
compressInputType: null,
uncompressInputType: null
};
exports.DEFLATE = _dereq_('./flate');
},{"./flate":13}],9:[function(_dereq_,module,exports){
'use strict';
var utils = _dereq_('./utils');
var table = [
0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA,
0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3,
0x0EDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988,
0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91,
0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE,
0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7,
0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC,
0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5,
0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172,
0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B,
0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940,
0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59,
0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116,
0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F,
0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924,
0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D,
0x76DC4190, 0x01DB7106, 0x98D220BC, 0xEFD5102A,
0x71B18589, 0x06B6B51F, 0x9FBFE4A5, 0xE8B8D433,
0x7807C9A2, 0x0F00F934, 0x9609A88E, 0xE10E9818,
0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01,
0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E,
0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457,
0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C,
0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65,
0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2,
0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB,
0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0,
0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9,
0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086,
0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F,
0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4,
0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD,
0xEDB88320, 0x9ABFB3B6, 0x03B6E20C, 0x74B1D29A,
0xEAD54739, 0x9DD277AF, 0x04DB2615, 0x73DC1683,
0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8,
0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1,
0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE,
0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7,
0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC,
0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5,
0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252,
0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B,
0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60,
0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79,
0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236,
0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F,
0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04,
0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D,
0x9B64C2B0, 0xEC63F226, 0x756AA39C, 0x026D930A,
0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713,
0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38,
0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21,
0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E,
0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777,
0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C,
0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45,
0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2,
0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB,
0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0,
0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9,
0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6,
0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF,
0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94,
0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D
];
module.exports = function crc32(input, crc) {
if (typeof input === "undefined" || !input.length) {
return 0;
}
var isArray = utils.getTypeOf(input) !== "string";
if (typeof(crc) == "undefined") {
crc = 0;
}
var x = 0;
var y = 0;
var b = 0;
crc = crc ^ (-1);
for (var i = 0, iTop = input.length; i < iTop; i++) {
b = isArray ? input[i] : input.charCodeAt(i);
y = (crc ^ b) & 0xFF;
x = table[y];
crc = (crc >>> 8) ^ x;
}
return crc ^ (-1);
};
},{"./utils":26}],10:[function(_dereq_,module,exports){
'use strict';
var utils = _dereq_('./utils');
function DataReader(data) {
this.data = null;
this.length = 0;
this.index = 0;
this.zero = 0;
}
DataReader.prototype = {
checkOffset: function(offset) {
this.checkIndex(this.index + offset);
},
checkIndex: function(newIndex) {
if (this.length < this.zero + newIndex || newIndex < 0) {
throw new Error("End of data reached (data length = " + this.length + ", asked index = " + (newIndex) + "). Corrupted zip ?");
}
},
setIndex: function(newIndex) {
this.checkIndex(newIndex);
this.index = newIndex;
},
skip: function(n) {
this.setIndex(this.index + n);
},
byteAt: function(i) {
},
readInt: function(size) {
var result = 0,
i;
this.checkOffset(size);
for (i = this.index + size - 1; i >= this.index; i--) {
result = (result << 8) + this.byteAt(i);
}
this.index += size;
return result;
},
readString: function(size) {
return utils.transformTo("string", this.readData(size));
},
readData: function(size) {
},
lastIndexOfSignature: function(sig) {
},
readDate: function() {
var dostime = this.readInt(4);
return new Date(
((dostime >> 25) & 0x7f) + 1980,
((dostime >> 21) & 0x0f) - 1,
(dostime >> 16) & 0x1f,
(dostime >> 11) & 0x1f,
(dostime >> 5) & 0x3f,
(dostime & 0x1f) << 1);
}
};
module.exports = DataReader;
},{"./utils":26}],11:[function(_dereq_,module,exports){
'use strict';
exports.base64 = false;
exports.binary = false;
exports.dir = false;
exports.createFolders = false;
exports.date = null;
exports.compression = null;
exports.compressionOptions = null;
exports.comment = null;
exports.unixPermissions = null;
exports.dosPermissions = null;
},{}],12:[function(_dereq_,module,exports){
'use strict';
var utils = _dereq_('./utils');
exports.string2binary = function(str) {
return utils.string2binary(str);
};
exports.string2Uint8Array = function(str) {
return utils.transformTo("uint8array", str);
};
exports.uint8Array2String = function(array) {
return utils.transformTo("string", array);
};
exports.string2Blob = function(str) {
var buffer = utils.transformTo("arraybuffer", str);
return utils.arrayBuffer2Blob(buffer);
};
exports.arrayBuffer2Blob = function(buffer) {
return utils.arrayBuffer2Blob(buffer);
};
exports.transformTo = function(outputType, input) {
return utils.transformTo(outputType, input);
};
exports.getTypeOf = function(input) {
return utils.getTypeOf(input);
};
exports.checkSupport = function(type) {
return utils.checkSupport(type);
};
exports.MAX_VALUE_16BITS = utils.MAX_VALUE_16BITS;
exports.MAX_VALUE_32BITS = utils.MAX_VALUE_32BITS;
exports.pretty = function(str) {
return utils.pretty(str);
};
exports.findCompression = function(compressionMethod) {
return utils.findCompression(compressionMethod);
};
exports.isRegExp = function (object) {
return utils.isRegExp(object);
};
},{"./utils":26}],13:[function(_dereq_,module,exports){
'use strict';
var USE_TYPEDARRAY = (typeof Uint8Array !== 'undefined') && (typeof Uint16Array !== 'undefined') && (typeof Uint32Array !== 'undefined');
var pako = _dereq_("pako");
exports.uncompressInputType = USE_TYPEDARRAY ? "uint8array" : "array";
exports.compressInputType = USE_TYPEDARRAY ? "uint8array" : "array";
exports.magic = "\x08\x00";
exports.compress = function(input, compressionOptions) {
return pako.deflateRaw(input, {
level : compressionOptions.level || -1
});
};
exports.uncompress =  function(input) {
return pako.inflateRaw(input);
};
},{"pako":29}],14:[function(_dereq_,module,exports){
'use strict';
var base64 = _dereq_('./base64');
function JSZip(data, options) {
if(!(this instanceof JSZip)) return new JSZip(data, options);
this.files = {};
this.comment = null;
this.root = "";
if (data) {
this.load(data, options);
}
this.clone = function() {
var newObj = new JSZip();
for (var i in this) {
if (typeof this[i] !== "function") {
newObj[i] = this[i];
}
}
return newObj;
};
}
JSZip.prototype = _dereq_('./object');
JSZip.prototype.load = _dereq_('./load');
JSZip.support = _dereq_('./support');
JSZip.defaults = _dereq_('./defaults');
JSZip.utils = _dereq_('./deprecatedPublicUtils');
JSZip.base64 = {
encode : function(input) {
return base64.encode(input);
},
decode : function(input) {
return base64.decode(input);
}
};
JSZip.compressions = _dereq_('./compressions');
module.exports = JSZip;
},{"./base64":6,"./compressions":8,"./defaults":11,"./deprecatedPublicUtils":12,"./load":15,"./object":18,"./support":22}],15:[function(_dereq_,module,exports){
'use strict';
var base64 = _dereq_('./base64');
var utf8 = _dereq_('./utf8');
var utils = _dereq_('./utils');
var ZipEntries = _dereq_('./zipEntries');
module.exports = function(data, options) {
var files, zipEntries, i, input;
options = utils.extend(options || {}, {
base64: false,
checkCRC32: false,
optimizedBinaryString : false,
createFolders: false,
decodeFileName: utf8.utf8decode
});
if (options.base64) {
data = base64.decode(data);
}
zipEntries = new ZipEntries(data, options);
files = zipEntries.files;
for (i = 0; i < files.length; i++) {
input = files[i];
this.file(input.fileNameStr, input.decompressed, {
binary: true,
optimizedBinaryString: true,
date: input.date,
dir: input.dir,
comment : input.fileCommentStr.length ? input.fileCommentStr : null,
unixPermissions : input.unixPermissions,
dosPermissions : input.dosPermissions,
createFolders: options.createFolders
});
}
if (zipEntries.zipComment.length) {
this.comment = zipEntries.zipComment;
}
return this;
};
},{"./base64":6,"./utf8":25,"./utils":26,"./zipEntries":27}],16:[function(_dereq_,module,exports){
(function (Buffer){
'use strict';
module.exports = function(data, encoding){
return new Buffer(data, encoding);
};
module.exports.test = function(b){
return Buffer.isBuffer(b);
};
}).call(this,_dereq_("buffer").Buffer)
},{"buffer":1}],17:[function(_dereq_,module,exports){
'use strict';
var Uint8ArrayReader = _dereq_('./uint8ArrayReader');
function NodeBufferReader(data) {
this.data = data;
this.length = this.data.length;
this.index = 0;
this.zero = 0;
}
NodeBufferReader.prototype = new Uint8ArrayReader();
NodeBufferReader.prototype.readData = function(size) {
this.checkOffset(size);
var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
this.index += size;
return result;
};
module.exports = NodeBufferReader;
},{"./uint8ArrayReader":23}],18:[function(_dereq_,module,exports){
'use strict';
var support = _dereq_('./support');
var utils = _dereq_('./utils');
var crc32 = _dereq_('./crc32');
var signature = _dereq_('./signature');
var defaults = _dereq_('./defaults');
var base64 = _dereq_('./base64');
var compressions = _dereq_('./compressions');
var CompressedObject = _dereq_('./compressedObject');
var nodeBuffer = _dereq_('./nodeBuffer');
var utf8 = _dereq_('./utf8');
var StringWriter = _dereq_('./stringWriter');
var Uint8ArrayWriter = _dereq_('./uint8ArrayWriter');
var getRawData = function(file) {
if (file._data instanceof CompressedObject) {
file._data = file._data.getContent();
file.options.binary = true;
file.options.base64 = false;
if (utils.getTypeOf(file._data) === "uint8array") {
var copy = file._data;
file._data = new Uint8Array(copy.length);
if (copy.length !== 0) {
file._data.set(copy, 0);
}
}
}
return file._data;
};
var getBinaryData = function(file) {
var result = getRawData(file),
type = utils.getTypeOf(result);
if (type === "string") {
if (!file.options.binary) {
if (support.nodebuffer) {
return nodeBuffer(result, "utf-8");
}
}
return file.asBinary();
}
return result;
};
var dataToString = function(asUTF8) {
var result = getRawData(this);
if (result === null || typeof result === "undefined") {
return "";
}
if (this.options.base64) {
result = base64.decode(result);
}
if (asUTF8 && this.options.binary) {
result = out.utf8decode(result);
}
else {
result = utils.transformTo("string", result);
}
if (!asUTF8 && !this.options.binary) {
result = utils.transformTo("string", out.utf8encode(result));
}
return result;
};
var ZipObject = function(name, data, options) {
this.name = name;
this.dir = options.dir;
this.date = options.date;
this.comment = options.comment;
this.unixPermissions = options.unixPermissions;
this.dosPermissions = options.dosPermissions;
this._data = data;
this.options = options;
this._initialMetadata = {
dir : options.dir,
date : options.date
};
};
ZipObject.prototype = {
asText: function() {
return dataToString.call(this, true);
},
asBinary: function() {
return dataToString.call(this, false);
},
asNodeBuffer: function() {
var result = getBinaryData(this);
return utils.transformTo("nodebuffer", result);
},
asUint8Array: function() {
var result = getBinaryData(this);
return utils.transformTo("uint8array", result);
},
asArrayBuffer: function() {
return this.asUint8Array().buffer;
}
};
var decToHex = function(dec, bytes) {
var hex = "",
i;
for (i = 0; i < bytes; i++) {
hex += String.fromCharCode(dec & 0xff);
dec = dec >>> 8;
}
return hex;
};
var prepareFileAttrs = function(o) {
o = o || {};
if (o.base64 === true && (o.binary === null || o.binary === undefined)) {
o.binary = true;
}
o = utils.extend(o, defaults);
o.date = o.date || new Date();
if (o.compression !== null) o.compression = o.compression.toUpperCase();
return o;
};
var fileAdd = function(name, data, o) {
var dataType = utils.getTypeOf(data),
parent;
o = prepareFileAttrs(o);
if (typeof o.unixPermissions === "string") {
o.unixPermissions = parseInt(o.unixPermissions, 8);
}
if (o.unixPermissions && (o.unixPermissions & 0x4000)) {
o.dir = true;
}
if (o.dosPermissions && (o.dosPermissions & 0x0010)) {
o.dir = true;
}
if (o.dir) {
name = forceTrailingSlash(name);
}
if (o.createFolders && (parent = parentFolder(name))) {
folderAdd.call(this, parent, true);
}
if (o.dir || data === null || typeof data === "undefined") {
o.base64 = false;
o.binary = false;
data = null;
dataType = null;
}
else if (dataType === "string") {
if (o.binary && !o.base64) {
if (o.optimizedBinaryString !== true) {
data = utils.string2binary(data);
}
}
}
else {
o.base64 = false;
o.binary = true;
if (!dataType && !(data instanceof CompressedObject)) {
throw new Error("The data of '" + name + "' is in an unsupported format !");
}
if (dataType === "arraybuffer") {
data = utils.transformTo("uint8array", data);
}
}
var object = new ZipObject(name, data, o);
this.files[name] = object;
return object;
};
var parentFolder = function (path) {
if (path.slice(-1) == '/') {
path = path.substring(0, path.length - 1);
}
var lastSlash = path.lastIndexOf('/');
return (lastSlash > 0) ? path.substring(0, lastSlash) : "";
};
var forceTrailingSlash = function(path) {
if (path.slice(-1) != "/") {
path += "/";
}
return path;
};
var folderAdd = function(name, createFolders) {
createFolders = (typeof createFolders !== 'undefined') ? createFolders : false;
name = forceTrailingSlash(name);
if (!this.files[name]) {
fileAdd.call(this, name, null, {
dir: true,
createFolders: createFolders
});
}
return this.files[name];
};
var generateCompressedObjectFrom = function(file, compression, compressionOptions) {
var result = new CompressedObject(),
content;
if (file._data instanceof CompressedObject) {
result.uncompressedSize = file._data.uncompressedSize;
result.crc32 = file._data.crc32;
if (result.uncompressedSize === 0 || file.dir) {
compression = compressions['STORE'];
result.compressedContent = "";
result.crc32 = 0;
}
else if (file._data.compressionMethod === compression.magic) {
result.compressedContent = file._data.getCompressedContent();
}
else {
content = file._data.getContent();
result.compressedContent = compression.compress(utils.transformTo(compression.compressInputType, content), compressionOptions);
}
}
else {
content = getBinaryData(file);
if (!content || content.length === 0 || file.dir) {
compression = compressions['STORE'];
content = "";
}
result.uncompressedSize = content.length;
result.crc32 = crc32(content);
result.compressedContent = compression.compress(utils.transformTo(compression.compressInputType, content), compressionOptions);
}
result.compressedSize = result.compressedContent.length;
result.compressionMethod = compression.magic;
return result;
};
var generateUnixExternalFileAttr = function (unixPermissions, isDir) {
var result = unixPermissions;
if (!unixPermissions) {
result = isDir ? 0x41fd : 0x81b4;
}
return (result & 0xFFFF) << 16;
};
var generateDosExternalFileAttr = function (dosPermissions, isDir) {
return (dosPermissions || 0)  & 0x3F;
};
var generateZipParts = function(name, file, compressedObject, offset, platform, encodeFileName) {
var data = compressedObject.compressedContent,
useCustomEncoding = encodeFileName !== utf8.utf8encode,
encodedFileName = utils.transformTo("string", encodeFileName(file.name)),
utfEncodedFileName = utils.transformTo("string", utf8.utf8encode(file.name)),
comment = file.comment || "",
encodedComment = utils.transformTo("string", encodeFileName(comment)),
utfEncodedComment = utils.transformTo("string", utf8.utf8encode(comment)),
useUTF8ForFileName = utfEncodedFileName.length !== file.name.length,
useUTF8ForComment = utfEncodedComment.length !== comment.length,
o = file.options,
dosTime,
dosDate,
extraFields = "",
unicodePathExtraField = "",
unicodeCommentExtraField = "",
dir, date;
if (file._initialMetadata.dir !== file.dir) {
dir = file.dir;
} else {
dir = o.dir;
}
if(file._initialMetadata.date !== file.date) {
date = file.date;
} else {
date = o.date;
}
var extFileAttr = 0;
var versionMadeBy = 0;
if (dir) {
extFileAttr |= 0x00010;
}
if(platform === "UNIX") {
versionMadeBy = 0x031E;
extFileAttr |= generateUnixExternalFileAttr(file.unixPermissions, dir);
} else {
versionMadeBy = 0x0014;
extFileAttr |= generateDosExternalFileAttr(file.dosPermissions, dir);
}
dosTime = date.getHours();
dosTime = dosTime << 6;
dosTime = dosTime | date.getMinutes();
dosTime = dosTime << 5;
dosTime = dosTime | date.getSeconds() / 2;
dosDate = date.getFullYear() - 1980;
dosDate = dosDate << 4;
dosDate = dosDate | (date.getMonth() + 1);
dosDate = dosDate << 5;
dosDate = dosDate | date.getDate();
if (useUTF8ForFileName) {
unicodePathExtraField =
decToHex(1, 1) +
decToHex(crc32(encodedFileName), 4) +
utfEncodedFileName;
extraFields +=
"\x75\x70" +
decToHex(unicodePathExtraField.length, 2) +
unicodePathExtraField;
}
if(useUTF8ForComment) {
unicodeCommentExtraField =
decToHex(1, 1) +
decToHex(this.crc32(encodedComment), 4) +
utfEncodedComment;
extraFields +=
"\x75\x63" +
decToHex(unicodeCommentExtraField.length, 2) +
unicodeCommentExtraField;
}
var header = "";
header += "\x0A\x00";
header += !useCustomEncoding && (useUTF8ForFileName || useUTF8ForComment) ? "\x00\x08" : "\x00\x00";
header += compressedObject.compressionMethod;
header += decToHex(dosTime, 2);
header += decToHex(dosDate, 2);
header += decToHex(compressedObject.crc32, 4);
header += decToHex(compressedObject.compressedSize, 4);
header += decToHex(compressedObject.uncompressedSize, 4);
header += decToHex(encodedFileName.length, 2);
header += decToHex(extraFields.length, 2);
var fileRecord = signature.LOCAL_FILE_HEADER + header + encodedFileName + extraFields;
var dirRecord = signature.CENTRAL_FILE_HEADER +
decToHex(versionMadeBy, 2) +
header +
decToHex(encodedComment.length, 2) +
"\x00\x00" +
"\x00\x00" +
decToHex(extFileAttr, 4) +
decToHex(offset, 4) +
encodedFileName +
extraFields +
encodedComment;
return {
fileRecord: fileRecord,
dirRecord: dirRecord,
compressedObject: compressedObject
};
};
var out = {
load: function(stream, options) {
throw new Error("Load method is not defined. Is the file jszip-load.js included ?");
},
filter: function(search) {
var result = [],
filename, relativePath, file, fileClone;
for (filename in this.files) {
if (!this.files.hasOwnProperty(filename)) {
continue;
}
file = this.files[filename];
fileClone = new ZipObject(file.name, file._data, utils.extend(file.options));
relativePath = filename.slice(this.root.length, filename.length);
if (filename.slice(0, this.root.length) === this.root &&
search(relativePath, fileClone)) {
result.push(fileClone);
}
}
return result;
},
file: function(name, data, o) {
if (arguments.length === 1) {
if (utils.isRegExp(name)) {
var regexp = name;
return this.filter(function(relativePath, file) {
return !file.dir && regexp.test(relativePath);
});
}
else {
return this.filter(function(relativePath, file) {
return !file.dir && relativePath === name;
})[0] || null;
}
}
else {
name = this.root + name;
fileAdd.call(this, name, data, o);
}
return this;
},
folder: function(arg) {
if (!arg) {
return this;
}
if (utils.isRegExp(arg)) {
return this.filter(function(relativePath, file) {
return file.dir && arg.test(relativePath);
});
}
var name = this.root + arg;
var newFolder = folderAdd.call(this, name);
var ret = this.clone();
ret.root = newFolder.name;
return ret;
},
remove: function(name) {
name = this.root + name;
var file = this.files[name];
if (!file) {
if (name.slice(-1) != "/") {
name += "/";
}
file = this.files[name];
}
if (file && !file.dir) {
delete this.files[name];
} else {
var kids = this.filter(function(relativePath, file) {
return file.name.slice(0, name.length) === name;
});
for (var i = 0; i < kids.length; i++) {
delete this.files[kids[i].name];
}
}
return this;
},
generate: function(options) {
options = utils.extend(options || {}, {
base64: true,
compression: "STORE",
compressionOptions : null,
type: "base64",
platform: "DOS",
comment: null,
mimeType: 'application/zip',
encodeFileName: utf8.utf8encode
});
utils.checkSupport(options.type);
if(
options.platform === 'darwin' ||
options.platform === 'freebsd' ||
options.platform === 'linux' ||
options.platform === 'sunos'
) {
options.platform = "UNIX";
}
if (options.platform === 'win32') {
options.platform = "DOS";
}
var zipData = [],
localDirLength = 0,
centralDirLength = 0,
writer, i,
encodedComment = utils.transformTo("string", options.encodeFileName(options.comment || this.comment || ""));
for (var name in this.files) {
if (!this.files.hasOwnProperty(name)) {
continue;
}
var file = this.files[name];
var compressionName = file.options.compression || options.compression.toUpperCase();
var compression = compressions[compressionName];
if (!compression) {
throw new Error(compressionName + " is not a valid compression method !");
}
var compressionOptions = file.options.compressionOptions || options.compressionOptions || {};
var compressedObject = generateCompressedObjectFrom.call(this, file, compression, compressionOptions);
var zipPart = generateZipParts.call(this, name, file, compressedObject, localDirLength, options.platform, options.encodeFileName);
localDirLength += zipPart.fileRecord.length + compressedObject.compressedSize;
centralDirLength += zipPart.dirRecord.length;
zipData.push(zipPart);
}
var dirEnd = "";
dirEnd = signature.CENTRAL_DIRECTORY_END +
"\x00\x00" +
"\x00\x00" +
decToHex(zipData.length, 2) +
decToHex(zipData.length, 2) +
decToHex(centralDirLength, 4) +
decToHex(localDirLength, 4) +
decToHex(encodedComment.length, 2) +
encodedComment;
var typeName = options.type.toLowerCase();
if(typeName==="uint8array"||typeName==="arraybuffer"||typeName==="blob"||typeName==="nodebuffer") {
writer = new Uint8ArrayWriter(localDirLength + centralDirLength + dirEnd.length);
}else{
writer = new StringWriter(localDirLength + centralDirLength + dirEnd.length);
}
for (i = 0; i < zipData.length; i++) {
writer.append(zipData[i].fileRecord);
writer.append(zipData[i].compressedObject.compressedContent);
}
for (i = 0; i < zipData.length; i++) {
writer.append(zipData[i].dirRecord);
}
writer.append(dirEnd);
var zip = writer.finalize();
switch(options.type.toLowerCase()) {
case "uint8array" :
case "arraybuffer" :
case "nodebuffer" :
return utils.transformTo(options.type.toLowerCase(), zip);
case "blob" :
return utils.arrayBuffer2Blob(utils.transformTo("arraybuffer", zip), options.mimeType);
case "base64" :
return (options.base64) ? base64.encode(zip) : zip;
default :
return zip;
}
},
crc32: function (input, crc) {
return crc32(input, crc);
},
utf8encode: function (string) {
return utils.transformTo("string", utf8.utf8encode(string));
},
utf8decode: function (input) {
return utf8.utf8decode(input);
}
};
module.exports = out;
},{"./base64":6,"./compressedObject":7,"./compressions":8,"./crc32":9,"./defaults":11,"./nodeBuffer":16,"./signature":19,"./stringWriter":21,"./support":22,"./uint8ArrayWriter":24,"./utf8":25,"./utils":26}],19:[function(_dereq_,module,exports){
'use strict';
exports.LOCAL_FILE_HEADER = "PK\x03\x04";
exports.CENTRAL_FILE_HEADER = "PK\x01\x02";
exports.CENTRAL_DIRECTORY_END = "PK\x05\x06";
exports.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x06\x07";
exports.ZIP64_CENTRAL_DIRECTORY_END = "PK\x06\x06";
exports.DATA_DESCRIPTOR = "PK\x07\x08";
},{}],20:[function(_dereq_,module,exports){
'use strict';
var DataReader = _dereq_('./dataReader');
var utils = _dereq_('./utils');
function StringReader(data, optimizedBinaryString) {
this.data = data;
if (!optimizedBinaryString) {
this.data = utils.string2binary(this.data);
}
this.length = this.data.length;
this.index = 0;
this.zero = 0;
}
StringReader.prototype = new DataReader();
StringReader.prototype.byteAt = function(i) {
return this.data.charCodeAt(this.zero + i);
};
StringReader.prototype.lastIndexOfSignature = function(sig) {
return this.data.lastIndexOf(sig) - this.zero;
};
StringReader.prototype.readData = function(size) {
this.checkOffset(size);
var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
this.index += size;
return result;
};
module.exports = StringReader;
},{"./dataReader":10,"./utils":26}],21:[function(_dereq_,module,exports){
'use strict';
var utils = _dereq_('./utils');
var StringWriter = function() {
this.data = [];
};
StringWriter.prototype = {
append: function(input) {
input = utils.transformTo("string", input);
this.data.push(input);
},
finalize: function() {
return this.data.join("");
}
};
module.exports = StringWriter;
},{"./utils":26}],22:[function(_dereq_,module,exports){
(function (Buffer){
'use strict';
exports.base64 = true;
exports.array = true;
exports.string = true;
exports.arraybuffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined";
exports.nodebuffer = typeof Buffer !== "undefined";
exports.uint8array = typeof Uint8Array !== "undefined";
if (typeof ArrayBuffer === "undefined") {
exports.blob = false;
}
else {
var buffer = new ArrayBuffer(0);
try {
exports.blob = new Blob([buffer], {
type: "application/zip"
}).size === 0;
}
catch (e) {
try {
var Builder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
var builder = new Builder();
builder.append(buffer);
exports.blob = builder.getBlob('application/zip').size === 0;
}
catch (e) {
exports.blob = false;
}
}
}
}).call(this,_dereq_("buffer").Buffer)
},{"buffer":1}],23:[function(_dereq_,module,exports){
'use strict';
var ArrayReader = _dereq_('./arrayReader');
function Uint8ArrayReader(data) {
if (data) {
this.data = data;
this.length = this.data.length;
this.index = 0;
this.zero = 0;
}
}
Uint8ArrayReader.prototype = new ArrayReader();
Uint8ArrayReader.prototype.readData = function(size) {
this.checkOffset(size);
if(size === 0) {
return new Uint8Array(0);
}
var result = this.data.subarray(this.zero + this.index, this.zero + this.index + size);
this.index += size;
return result;
};
module.exports = Uint8ArrayReader;
},{"./arrayReader":5}],24:[function(_dereq_,module,exports){
'use strict';
var utils = _dereq_('./utils');
var Uint8ArrayWriter = function(length) {
this.data = new Uint8Array(length);
this.index = 0;
};
Uint8ArrayWriter.prototype = {
append: function(input) {
if (input.length !== 0) {
input = utils.transformTo("uint8array", input);
this.data.set(input, this.index);
this.index += input.length;
}
},
finalize: function() {
return this.data;
}
};
module.exports = Uint8ArrayWriter;
},{"./utils":26}],25:[function(_dereq_,module,exports){
'use strict';
var utils = _dereq_('./utils');
var support = _dereq_('./support');
var nodeBuffer = _dereq_('./nodeBuffer');
var _utf8len = new Array(256);
for (var i=0; i<256; i++) {
_utf8len[i] = (i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1);
}
_utf8len[254]=_utf8len[254]=1;
var string2buf = function (str) {
var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
for (m_pos = 0; m_pos < str_len; m_pos++) {
c = str.charCodeAt(m_pos);
if ((c & 0xfc00) === 0xd800 && (m_pos+1 < str_len)) {
c2 = str.charCodeAt(m_pos+1);
if ((c2 & 0xfc00) === 0xdc00) {
c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
m_pos++;
}
}
buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
}
if (support.uint8array) {
buf = new Uint8Array(buf_len);
} else {
buf = new Array(buf_len);
}
for (i=0, m_pos = 0; i < buf_len; m_pos++) {
c = str.charCodeAt(m_pos);
if ((c & 0xfc00) === 0xd800 && (m_pos+1 < str_len)) {
c2 = str.charCodeAt(m_pos+1);
if ((c2 & 0xfc00) === 0xdc00) {
c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
m_pos++;
}
}
if (c < 0x80) {
buf[i++] = c;
} else if (c < 0x800) {
buf[i++] = 0xC0 | (c >>> 6);
buf[i++] = 0x80 | (c & 0x3f);
} else if (c < 0x10000) {
buf[i++] = 0xE0 | (c >>> 12);
buf[i++] = 0x80 | (c >>> 6 & 0x3f);
buf[i++] = 0x80 | (c & 0x3f);
} else {
buf[i++] = 0xf0 | (c >>> 18);
buf[i++] = 0x80 | (c >>> 12 & 0x3f);
buf[i++] = 0x80 | (c >>> 6 & 0x3f);
buf[i++] = 0x80 | (c & 0x3f);
}
}
return buf;
};
var utf8border = function(buf, max) {
var pos;
max = max || buf.length;
if (max > buf.length) { max = buf.length; }
pos = max-1;
while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }
if (pos < 0) { return max; }
if (pos === 0) { return max; }
return (pos + _utf8len[buf[pos]] > max) ? pos : max;
};
var buf2string = function (buf) {
var str, i, out, c, c_len;
var len = buf.length;
var utf16buf = new Array(len*2);
for (out=0, i=0; i<len;) {
c = buf[i++];
if (c < 0x80) { utf16buf[out++] = c; continue; }
c_len = _utf8len[c];
if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len-1; continue; }
c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
while (c_len > 1 && i < len) {
c = (c << 6) | (buf[i++] & 0x3f);
c_len--;
}
if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }
if (c < 0x10000) {
utf16buf[out++] = c;
} else {
c -= 0x10000;
utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
utf16buf[out++] = 0xdc00 | (c & 0x3ff);
}
}
if (utf16buf.length !== out) {
if(utf16buf.subarray) {
utf16buf = utf16buf.subarray(0, out);
} else {
utf16buf.length = out;
}
}
return utils.applyFromCharCode(utf16buf);
};
exports.utf8encode = function utf8encode(str) {
if (support.nodebuffer) {
return nodeBuffer(str, "utf-8");
}
return string2buf(str);
};
exports.utf8decode = function utf8decode(buf) {
if (support.nodebuffer) {
return utils.transformTo("nodebuffer", buf).toString("utf-8");
}
buf = utils.transformTo(support.uint8array ? "uint8array" : "array", buf);
var result = [], k = 0, len = buf.length, chunk = 65536;
while (k < len) {
var nextBoundary = utf8border(buf, Math.min(k + chunk, len));
if (support.uint8array) {
result.push(buf2string(buf.subarray(k, nextBoundary)));
} else {
result.push(buf2string(buf.slice(k, nextBoundary)));
}
k = nextBoundary;
}
return result.join("");
};
},{"./nodeBuffer":16,"./support":22,"./utils":26}],26:[function(_dereq_,module,exports){
'use strict';
var support = _dereq_('./support');
var compressions = _dereq_('./compressions');
var nodeBuffer = _dereq_('./nodeBuffer');
exports.string2binary = function(str) {
var result = "";
for (var i = 0; i < str.length; i++) {
result += String.fromCharCode(str.charCodeAt(i) & 0xff);
}
return result;
};
exports.arrayBuffer2Blob = function(buffer, mimeType) {
exports.checkSupport("blob");
mimeType = mimeType || 'application/zip';
try {
return new Blob([buffer], {
type: mimeType
});
}
catch (e) {
try {
var Builder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
var builder = new Builder();
builder.append(buffer);
return builder.getBlob(mimeType);
}
catch (e) {
throw new Error("Bug : can't construct the Blob.");
}
}
};
function identity(input) {
return input;
}
function stringToArrayLike(str, array) {
for (var i = 0; i < str.length; ++i) {
array[i] = str.charCodeAt(i) & 0xFF;
}
return array;
}
function arrayLikeToString(array) {
var chunk = 65536;
var result = [],
len = array.length,
type = exports.getTypeOf(array),
k = 0,
canUseApply = true;
try {
switch(type) {
case "uint8array":
String.fromCharCode.apply(null, new Uint8Array(0));
break;
case "nodebuffer":
String.fromCharCode.apply(null, nodeBuffer(0));
break;
}
} catch(e) {
canUseApply = false;
}
if (!canUseApply) {
var resultStr = "";
for(var i = 0; i < array.length;i++) {
resultStr += String.fromCharCode(array[i]);
}
return resultStr;
}
while (k < len && chunk > 1) {
try {
if (type === "array" || type === "nodebuffer") {
result.push(String.fromCharCode.apply(null, array.slice(k, Math.min(k + chunk, len))));
}
else {
result.push(String.fromCharCode.apply(null, array.subarray(k, Math.min(k + chunk, len))));
}
k += chunk;
}
catch (e) {
chunk = Math.floor(chunk / 2);
}
}
return result.join("");
}
exports.applyFromCharCode = arrayLikeToString;
function arrayLikeToArrayLike(arrayFrom, arrayTo) {
for (var i = 0; i < arrayFrom.length; i++) {
arrayTo[i] = arrayFrom[i];
}
return arrayTo;
}
var transform = {};
transform["string"] = {
"string": identity,
"array": function(input) {
return stringToArrayLike(input, new Array(input.length));
},
"arraybuffer": function(input) {
return transform["string"]["uint8array"](input).buffer;
},
"uint8array": function(input) {
return stringToArrayLike(input, new Uint8Array(input.length));
},
"nodebuffer": function(input) {
return stringToArrayLike(input, nodeBuffer(input.length));
}
};
transform["array"] = {
"string": arrayLikeToString,
"array": identity,
"arraybuffer": function(input) {
return (new Uint8Array(input)).buffer;
},
"uint8array": function(input) {
return new Uint8Array(input);
},
"nodebuffer": function(input) {
return nodeBuffer(input);
}
};
transform["arraybuffer"] = {
"string": function(input) {
return arrayLikeToString(new Uint8Array(input));
},
"array": function(input) {
return arrayLikeToArrayLike(new Uint8Array(input), new Array(input.byteLength));
},
"arraybuffer": identity,
"uint8array": function(input) {
return new Uint8Array(input);
},
"nodebuffer": function(input) {
return nodeBuffer(new Uint8Array(input));
}
};
transform["uint8array"] = {
"string": arrayLikeToString,
"array": function(input) {
return arrayLikeToArrayLike(input, new Array(input.length));
},
"arraybuffer": function(input) {
return input.buffer;
},
"uint8array": identity,
"nodebuffer": function(input) {
return nodeBuffer(input);
}
};
transform["nodebuffer"] = {
"string": arrayLikeToString,
"array": function(input) {
return arrayLikeToArrayLike(input, new Array(input.length));
},
"arraybuffer": function(input) {
return transform["nodebuffer"]["uint8array"](input).buffer;
},
"uint8array": function(input) {
return arrayLikeToArrayLike(input, new Uint8Array(input.length));
},
"nodebuffer": identity
};
exports.transformTo = function(outputType, input) {
if (!input) {
input = "";
}
if (!outputType) {
return input;
}
exports.checkSupport(outputType);
var inputType = exports.getTypeOf(input);
var result = transform[inputType][outputType](input);
return result;
};
exports.getTypeOf = function(input) {
if (typeof input === "string") {
return "string";
}
if (Object.prototype.toString.call(input) === "[object Array]") {
return "array";
}
if (support.nodebuffer && nodeBuffer.test(input)) {
return "nodebuffer";
}
if (support.uint8array && input instanceof Uint8Array) {
return "uint8array";
}
if (support.arraybuffer && input instanceof ArrayBuffer) {
return "arraybuffer";
}
};
exports.checkSupport = function(type) {
var supported = support[type.toLowerCase()];
if (!supported) {
throw new Error(type + " is not supported by this browser");
}
};
exports.MAX_VALUE_16BITS = 65535;
exports.MAX_VALUE_32BITS = -1;
exports.pretty = function(str) {
var res = '',
code, i;
for (i = 0; i < (str || "").length; i++) {
code = str.charCodeAt(i);
res += '\\x' + (code < 16 ? "0" : "") + code.toString(16).toUpperCase();
}
return res;
};
exports.findCompression = function(compressionMethod) {
for (var method in compressions) {
if (!compressions.hasOwnProperty(method)) {
continue;
}
if (compressions[method].magic === compressionMethod) {
return compressions[method];
}
}
return null;
};
exports.isRegExp = function (object) {
return Object.prototype.toString.call(object) === "[object RegExp]";
};
exports.extend = function() {
var result = {}, i, attr;
for (i = 0; i < arguments.length; i++) {
for (attr in arguments[i]) {
if (arguments[i].hasOwnProperty(attr) && typeof result[attr] === "undefined") {
result[attr] = arguments[i][attr];
}
}
}
return result;
};
},{"./compressions":8,"./nodeBuffer":16,"./support":22}],27:[function(_dereq_,module,exports){
'use strict';
var StringReader = _dereq_('./stringReader');
var NodeBufferReader = _dereq_('./nodeBufferReader');
var Uint8ArrayReader = _dereq_('./uint8ArrayReader');
var ArrayReader = _dereq_('./arrayReader');
var utils = _dereq_('./utils');
var sig = _dereq_('./signature');
var ZipEntry = _dereq_('./zipEntry');
var support = _dereq_('./support');
var jszipProto = _dereq_('./object');
function ZipEntries(data, loadOptions) {
this.files = [];
this.loadOptions = loadOptions;
if (data) {
this.load(data);
}
}
ZipEntries.prototype = {
checkSignature: function(expectedSignature) {
var signature = this.reader.readString(4);
if (signature !== expectedSignature) {
throw new Error("Corrupted zip or bug : unexpected signature " + "(" + utils.pretty(signature) + ", expected " + utils.pretty(expectedSignature) + ")");
}
},
isSignature: function(askedIndex, expectedSignature) {
var currentIndex = this.reader.index;
this.reader.setIndex(askedIndex);
var signature = this.reader.readString(4);
var result = signature === expectedSignature;
this.reader.setIndex(currentIndex);
return result;
},
readBlockEndOfCentral: function() {
this.diskNumber = this.reader.readInt(2);
this.diskWithCentralDirStart = this.reader.readInt(2);
this.centralDirRecordsOnThisDisk = this.reader.readInt(2);
this.centralDirRecords = this.reader.readInt(2);
this.centralDirSize = this.reader.readInt(4);
this.centralDirOffset = this.reader.readInt(4);
this.zipCommentLength = this.reader.readInt(2);
var zipComment = this.reader.readData(this.zipCommentLength);
var decodeParamType = support.uint8array ? "uint8array" : "array";
var decodeContent = utils.transformTo(decodeParamType, zipComment);
this.zipComment = this.loadOptions.decodeFileName(decodeContent);
},
readBlockZip64EndOfCentral: function() {
this.zip64EndOfCentralSize = this.reader.readInt(8);
this.versionMadeBy = this.reader.readString(2);
this.versionNeeded = this.reader.readInt(2);
this.diskNumber = this.reader.readInt(4);
this.diskWithCentralDirStart = this.reader.readInt(4);
this.centralDirRecordsOnThisDisk = this.reader.readInt(8);
this.centralDirRecords = this.reader.readInt(8);
this.centralDirSize = this.reader.readInt(8);
this.centralDirOffset = this.reader.readInt(8);
this.zip64ExtensibleData = {};
var extraDataSize = this.zip64EndOfCentralSize - 44,
index = 0,
extraFieldId,
extraFieldLength,
extraFieldValue;
while (index < extraDataSize) {
extraFieldId = this.reader.readInt(2);
extraFieldLength = this.reader.readInt(4);
extraFieldValue = this.reader.readString(extraFieldLength);
this.zip64ExtensibleData[extraFieldId] = {
id: extraFieldId,
length: extraFieldLength,
value: extraFieldValue
};
}
},
readBlockZip64EndOfCentralLocator: function() {
this.diskWithZip64CentralDirStart = this.reader.readInt(4);
this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8);
this.disksCount = this.reader.readInt(4);
if (this.disksCount > 1) {
throw new Error("Multi-volumes zip are not supported");
}
},
readLocalFiles: function() {
var i, file;
for (i = 0; i < this.files.length; i++) {
file = this.files[i];
this.reader.setIndex(file.localHeaderOffset);
this.checkSignature(sig.LOCAL_FILE_HEADER);
file.readLocalPart(this.reader);
file.handleUTF8();
file.processAttributes();
}
},
readCentralDir: function() {
var file;
this.reader.setIndex(this.centralDirOffset);
while (this.reader.readString(4) === sig.CENTRAL_FILE_HEADER) {
file = new ZipEntry({
zip64: this.zip64
}, this.loadOptions);
file.readCentralPart(this.reader);
this.files.push(file);
}
if (this.centralDirRecords !== this.files.length) {
if (this.centralDirRecords !== 0 && this.files.length === 0) {
throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
} else {
}
}
},
readEndOfCentral: function() {
var offset = this.reader.lastIndexOfSignature(sig.CENTRAL_DIRECTORY_END);
if (offset < 0) {
var isGarbage = !this.isSignature(0, sig.LOCAL_FILE_HEADER);
if (isGarbage) {
throw new Error("Can't find end of central directory : is this a zip file ? " +
"If it is, see http://stuk.github.io/jszip/documentation/howto/read_zip.html");
} else {
throw new Error("Corrupted zip : can't find end of central directory");
}
}
this.reader.setIndex(offset);
var endOfCentralDirOffset = offset;
this.checkSignature(sig.CENTRAL_DIRECTORY_END);
this.readBlockEndOfCentral();
if (this.diskNumber === utils.MAX_VALUE_16BITS || this.diskWithCentralDirStart === utils.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === utils.MAX_VALUE_16BITS || this.centralDirRecords === utils.MAX_VALUE_16BITS || this.centralDirSize === utils.MAX_VALUE_32BITS || this.centralDirOffset === utils.MAX_VALUE_32BITS) {
this.zip64 = true;
offset = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
if (offset < 0) {
throw new Error("Corrupted zip : can't find the ZIP64 end of central directory locator");
}
this.reader.setIndex(offset);
this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
this.readBlockZip64EndOfCentralLocator();
if (!this.isSignature(this.relativeOffsetEndOfZip64CentralDir, sig.ZIP64_CENTRAL_DIRECTORY_END)) {
this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
if (this.relativeOffsetEndOfZip64CentralDir < 0) {
throw new Error("Corrupted zip : can't find the ZIP64 end of central directory");
}
}
this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);
this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
this.readBlockZip64EndOfCentral();
}
var expectedEndOfCentralDirOffset = this.centralDirOffset + this.centralDirSize;
if (this.zip64) {
expectedEndOfCentralDirOffset += 20;
expectedEndOfCentralDirOffset += 12  + this.zip64EndOfCentralSize;
}
var extraBytes = endOfCentralDirOffset - expectedEndOfCentralDirOffset;
if (extraBytes > 0) {
if (this.isSignature(endOfCentralDirOffset, sig.CENTRAL_FILE_HEADER)) {
} else {
this.reader.zero = extraBytes;
}
} else if (extraBytes < 0) {
throw new Error("Corrupted zip: missing " + Math.abs(extraBytes) + " bytes.");
}
},
prepareReader: function(data) {
var type = utils.getTypeOf(data);
utils.checkSupport(type);
if (type === "string" && !support.uint8array) {
this.reader = new StringReader(data, this.loadOptions.optimizedBinaryString);
}
else if (type === "nodebuffer") {
this.reader = new NodeBufferReader(data);
}
else if (support.uint8array) {
this.reader = new Uint8ArrayReader(utils.transformTo("uint8array", data));
} else if (support.array) {
this.reader = new ArrayReader(utils.transformTo("array", data));
} else {
throw new Error("Unexpected error: unsupported type '" + type + "'");
}
},
load: function(data) {
this.prepareReader(data);
this.readEndOfCentral();
this.readCentralDir();
this.readLocalFiles();
}
};
module.exports = ZipEntries;
},{"./arrayReader":5,"./nodeBufferReader":17,"./object":18,"./signature":19,"./stringReader":20,"./support":22,"./uint8ArrayReader":23,"./utils":26,"./zipEntry":28}],28:[function(_dereq_,module,exports){
'use strict';
var StringReader = _dereq_('./stringReader');
var utils = _dereq_('./utils');
var CompressedObject = _dereq_('./compressedObject');
var jszipProto = _dereq_('./object');
var support = _dereq_('./support');
var MADE_BY_DOS = 0x00;
var MADE_BY_UNIX = 0x03;
function ZipEntry(options, loadOptions) {
this.options = options;
this.loadOptions = loadOptions;
}
ZipEntry.prototype = {
isEncrypted: function() {
return (this.bitFlag & 0x0001) === 0x0001;
},
useUTF8: function() {
return (this.bitFlag & 0x0800) === 0x0800;
},
prepareCompressedContent: function(reader, from, length) {
return function() {
var previousIndex = reader.index;
reader.setIndex(from);
var compressedFileData = reader.readData(length);
reader.setIndex(previousIndex);
return compressedFileData;
};
},
prepareContent: function(reader, from, length, compression, uncompressedSize) {
return function() {
var compressedFileData = utils.transformTo(compression.uncompressInputType, this.getCompressedContent());
var uncompressedFileData = compression.uncompress(compressedFileData);
if (uncompressedFileData.length !== uncompressedSize) {
throw new Error("Bug : uncompressed data size mismatch");
}
return uncompressedFileData;
};
},
readLocalPart: function(reader) {
var compression, localExtraFieldsLength;
reader.skip(22);
this.fileNameLength = reader.readInt(2);
localExtraFieldsLength = reader.readInt(2);
this.fileName = reader.readData(this.fileNameLength);
reader.skip(localExtraFieldsLength);
if (this.compressedSize == -1 || this.uncompressedSize == -1) {
throw new Error("Bug or corrupted zip : didn't get enough informations from the central directory " + "(compressedSize == -1 || uncompressedSize == -1)");
}
compression = utils.findCompression(this.compressionMethod);
if (compression === null) {
throw new Error("Corrupted zip : compression " + utils.pretty(this.compressionMethod) + " unknown (inner file : " +  utils.transformTo("string", this.fileName) + ")");
}
this.decompressed = new CompressedObject();
this.decompressed.compressedSize = this.compressedSize;
this.decompressed.uncompressedSize = this.uncompressedSize;
this.decompressed.crc32 = this.crc32;
this.decompressed.compressionMethod = this.compressionMethod;
this.decompressed.getCompressedContent = this.prepareCompressedContent(reader, reader.index, this.compressedSize, compression);
this.decompressed.getContent = this.prepareContent(reader, reader.index, this.compressedSize, compression, this.uncompressedSize);
if (this.loadOptions.checkCRC32) {
this.decompressed = utils.transformTo("string", this.decompressed.getContent());
if (jszipProto.crc32(this.decompressed) !== this.crc32) {
throw new Error("Corrupted zip : CRC32 mismatch");
}
}
},
readCentralPart: function(reader) {
this.versionMadeBy = reader.readInt(2);
this.versionNeeded = reader.readInt(2);
this.bitFlag = reader.readInt(2);
this.compressionMethod = reader.readString(2);
this.date = reader.readDate();
this.crc32 = reader.readInt(4);
this.compressedSize = reader.readInt(4);
this.uncompressedSize = reader.readInt(4);
this.fileNameLength = reader.readInt(2);
this.extraFieldsLength = reader.readInt(2);
this.fileCommentLength = reader.readInt(2);
this.diskNumberStart = reader.readInt(2);
this.internalFileAttributes = reader.readInt(2);
this.externalFileAttributes = reader.readInt(4);
this.localHeaderOffset = reader.readInt(4);
if (this.isEncrypted()) {
throw new Error("Encrypted zip are not supported");
}
this.fileName = reader.readData(this.fileNameLength);
this.readExtraFields(reader);
this.parseZIP64ExtraField(reader);
this.fileComment = reader.readData(this.fileCommentLength);
},
processAttributes: function () {
this.unixPermissions = null;
this.dosPermissions = null;
var madeBy = this.versionMadeBy >> 8;
this.dir = this.externalFileAttributes & 0x0010 ? true : false;
if(madeBy === MADE_BY_DOS) {
this.dosPermissions = this.externalFileAttributes & 0x3F;
}
if(madeBy === MADE_BY_UNIX) {
this.unixPermissions = (this.externalFileAttributes >> 16) & 0xFFFF;
}
if (!this.dir && this.fileNameStr.slice(-1) === '/') {
this.dir = true;
}
},
parseZIP64ExtraField: function(reader) {
if (!this.extraFields[0x0001]) {
return;
}
var extraReader = new StringReader(this.extraFields[0x0001].value);
if (this.uncompressedSize === utils.MAX_VALUE_32BITS) {
this.uncompressedSize = extraReader.readInt(8);
}
if (this.compressedSize === utils.MAX_VALUE_32BITS) {
this.compressedSize = extraReader.readInt(8);
}
if (this.localHeaderOffset === utils.MAX_VALUE_32BITS) {
this.localHeaderOffset = extraReader.readInt(8);
}
if (this.diskNumberStart === utils.MAX_VALUE_32BITS) {
this.diskNumberStart = extraReader.readInt(4);
}
},
readExtraFields: function(reader) {
var start = reader.index,
extraFieldId,
extraFieldLength,
extraFieldValue;
this.extraFields = this.extraFields || {};
while (reader.index < start + this.extraFieldsLength) {
extraFieldId = reader.readInt(2);
extraFieldLength = reader.readInt(2);
extraFieldValue = reader.readString(extraFieldLength);
this.extraFields[extraFieldId] = {
id: extraFieldId,
length: extraFieldLength,
value: extraFieldValue
};
}
},
handleUTF8: function() {
var decodeParamType = support.uint8array ? "uint8array" : "array";
if (this.useUTF8()) {
this.fileNameStr = jszipProto.utf8decode(this.fileName);
this.fileCommentStr = jszipProto.utf8decode(this.fileComment);
} else {
var upath = this.findExtraFieldUnicodePath();
if (upath !== null) {
this.fileNameStr = upath;
} else {
var fileNameByteArray =  utils.transformTo(decodeParamType, this.fileName);
this.fileNameStr = this.loadOptions.decodeFileName(fileNameByteArray);
}
var ucomment = this.findExtraFieldUnicodeComment();
if (ucomment !== null) {
this.fileCommentStr = ucomment;
} else {
var commentByteArray =  utils.transformTo(decodeParamType, this.fileComment);
this.fileCommentStr = this.loadOptions.decodeFileName(commentByteArray);
}
}
},
findExtraFieldUnicodePath: function() {
var upathField = this.extraFields[0x7075];
if (upathField) {
var extraReader = new StringReader(upathField.value);
if (extraReader.readInt(1) !== 1) {
return null;
}
if (jszipProto.crc32(this.fileName) !== extraReader.readInt(4)) {
return null;
}
return jszipProto.utf8decode(extraReader.readString(upathField.length - 5));
}
return null;
},
findExtraFieldUnicodeComment: function() {
var ucommentField = this.extraFields[0x6375];
if (ucommentField) {
var extraReader = new StringReader(ucommentField.value);
if (extraReader.readInt(1) !== 1) {
return null;
}
if (jszipProto.crc32(this.fileComment) !== extraReader.readInt(4)) {
return null;
}
return jszipProto.utf8decode(extraReader.readString(ucommentField.length - 5));
}
return null;
}
};
module.exports = ZipEntry;
},{"./compressedObject":7,"./object":18,"./stringReader":20,"./support":22,"./utils":26}],29:[function(_dereq_,module,exports){
'use strict';
var assign    = _dereq_('./lib/utils/common').assign;
var deflate   = _dereq_('./lib/deflate');
var inflate   = _dereq_('./lib/inflate');
var constants = _dereq_('./lib/zlib/constants');
var pako = {};
assign(pako, deflate, inflate, constants);
module.exports = pako;
},{"./lib/deflate":30,"./lib/inflate":31,"./lib/utils/common":32,"./lib/zlib/constants":35}],30:[function(_dereq_,module,exports){
'use strict';
var zlib_deflate = _dereq_('./zlib/deflate');
var utils        = _dereq_('./utils/common');
var strings      = _dereq_('./utils/strings');
var msg          = _dereq_('./zlib/messages');
var ZStream      = _dereq_('./zlib/zstream');
var toString = Object.prototype.toString;
var Z_NO_FLUSH      = 0;
var Z_FINISH        = 4;
var Z_OK            = 0;
var Z_STREAM_END    = 1;
var Z_SYNC_FLUSH    = 2;
var Z_DEFAULT_COMPRESSION = -1;
var Z_DEFAULT_STRATEGY    = 0;
var Z_DEFLATED  = 8;
function Deflate(options) {
if (!(this instanceof Deflate)) return new Deflate(options);
this.options = utils.assign({
level: Z_DEFAULT_COMPRESSION,
method: Z_DEFLATED,
chunkSize: 16384,
windowBits: 15,
memLevel: 8,
strategy: Z_DEFAULT_STRATEGY,
to: ''
}, options || {});
var opt = this.options;
if (opt.raw && (opt.windowBits > 0)) {
opt.windowBits = -opt.windowBits;
}
else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
opt.windowBits += 16;
}
this.err    = 0;
this.msg    = '';
this.ended  = false;
this.chunks = [];
this.strm = new ZStream();
this.strm.avail_out = 0;
var status = zlib_deflate.deflateInit2(
this.strm,
opt.level,
opt.method,
opt.windowBits,
opt.memLevel,
opt.strategy
);
if (status !== Z_OK) {
throw new Error(msg[status]);
}
if (opt.header) {
zlib_deflate.deflateSetHeader(this.strm, opt.header);
}
if (opt.dictionary) {
var dict;
if (typeof opt.dictionary === 'string') {
dict = strings.string2buf(opt.dictionary);
} else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {
dict = new Uint8Array(opt.dictionary);
} else {
dict = opt.dictionary;
}
status = zlib_deflate.deflateSetDictionary(this.strm, dict);
if (status !== Z_OK) {
throw new Error(msg[status]);
}
this._dict_set = true;
}
}
Deflate.prototype.push = function (data, mode) {
var strm = this.strm;
var chunkSize = this.options.chunkSize;
var status, _mode;
if (this.ended) { return false; }
_mode = (mode === ~~mode) ? mode : ((mode === true) ? Z_FINISH : Z_NO_FLUSH);
if (typeof data === 'string') {
strm.input = strings.string2buf(data);
} else if (toString.call(data) === '[object ArrayBuffer]') {
strm.input = new Uint8Array(data);
} else {
strm.input = data;
}
strm.next_in = 0;
strm.avail_in = strm.input.length;
do {
if (strm.avail_out === 0) {
strm.output = new utils.Buf8(chunkSize);
strm.next_out = 0;
strm.avail_out = chunkSize;
}
status = zlib_deflate.deflate(strm, _mode);
if (status !== Z_STREAM_END && status !== Z_OK) {
this.onEnd(status);
this.ended = true;
return false;
}
if (strm.avail_out === 0 || (strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH))) {
if (this.options.to === 'string') {
this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
} else {
this.onData(utils.shrinkBuf(strm.output, strm.next_out));
}
}
} while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);
if (_mode === Z_FINISH) {
status = zlib_deflate.deflateEnd(this.strm);
this.onEnd(status);
this.ended = true;
return status === Z_OK;
}
if (_mode === Z_SYNC_FLUSH) {
this.onEnd(Z_OK);
strm.avail_out = 0;
return true;
}
return true;
};
Deflate.prototype.onData = function (chunk) {
this.chunks.push(chunk);
};
Deflate.prototype.onEnd = function (status) {
if (status === Z_OK) {
if (this.options.to === 'string') {
this.result = this.chunks.join('');
} else {
this.result = utils.flattenChunks(this.chunks);
}
}
this.chunks = [];
this.err = status;
this.msg = this.strm.msg;
};
function deflate(input, options) {
var deflator = new Deflate(options);
deflator.push(input, true);
if (deflator.err) { throw deflator.msg; }
return deflator.result;
}
function deflateRaw(input, options) {
options = options || {};
options.raw = true;
return deflate(input, options);
}
function gzip(input, options) {
options = options || {};
options.gzip = true;
return deflate(input, options);
}
exports.Deflate = Deflate;
exports.deflate = deflate;
exports.deflateRaw = deflateRaw;
exports.gzip = gzip;
},{"./utils/common":32,"./utils/strings":33,"./zlib/deflate":37,"./zlib/messages":42,"./zlib/zstream":44}],31:[function(_dereq_,module,exports){
'use strict';
var zlib_inflate = _dereq_('./zlib/inflate');
var utils        = _dereq_('./utils/common');
var strings      = _dereq_('./utils/strings');
var c            = _dereq_('./zlib/constants');
var msg          = _dereq_('./zlib/messages');
var ZStream      = _dereq_('./zlib/zstream');
var GZheader     = _dereq_('./zlib/gzheader');
var toString = Object.prototype.toString;
function Inflate(options) {
if (!(this instanceof Inflate)) return new Inflate(options);
this.options = utils.assign({
chunkSize: 16384,
windowBits: 0,
to: ''
}, options || {});
var opt = this.options;
if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
opt.windowBits = -opt.windowBits;
if (opt.windowBits === 0) { opt.windowBits = -15; }
}
if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
!(options && options.windowBits)) {
opt.windowBits += 32;
}
if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
if ((opt.windowBits & 15) === 0) {
opt.windowBits |= 15;
}
}
this.err    = 0;
this.msg    = '';
this.ended  = false;
this.chunks = [];
this.strm   = new ZStream();
this.strm.avail_out = 0;
var status  = zlib_inflate.inflateInit2(
this.strm,
opt.windowBits
);
if (status !== c.Z_OK) {
throw new Error(msg[status]);
}
this.header = new GZheader();
zlib_inflate.inflateGetHeader(this.strm, this.header);
}
Inflate.prototype.push = function (data, mode) {
var strm = this.strm;
var chunkSize = this.options.chunkSize;
var dictionary = this.options.dictionary;
var status, _mode;
var next_out_utf8, tail, utf8str;
var dict;
var allowBufError = false;
if (this.ended) { return false; }
_mode = (mode === ~~mode) ? mode : ((mode === true) ? c.Z_FINISH : c.Z_NO_FLUSH);
if (typeof data === 'string') {
strm.input = strings.binstring2buf(data);
} else if (toString.call(data) === '[object ArrayBuffer]') {
strm.input = new Uint8Array(data);
} else {
strm.input = data;
}
strm.next_in = 0;
strm.avail_in = strm.input.length;
do {
if (strm.avail_out === 0) {
strm.output = new utils.Buf8(chunkSize);
strm.next_out = 0;
strm.avail_out = chunkSize;
}
status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);
if (status === c.Z_NEED_DICT && dictionary) {
if (typeof dictionary === 'string') {
dict = strings.string2buf(dictionary);
} else if (toString.call(dictionary) === '[object ArrayBuffer]') {
dict = new Uint8Array(dictionary);
} else {
dict = dictionary;
}
status = zlib_inflate.inflateSetDictionary(this.strm, dict);
}
if (status === c.Z_BUF_ERROR && allowBufError === true) {
status = c.Z_OK;
allowBufError = false;
}
if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
this.onEnd(status);
this.ended = true;
return false;
}
if (strm.next_out) {
if (strm.avail_out === 0 || status === c.Z_STREAM_END || (strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH))) {
if (this.options.to === 'string') {
next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
tail = strm.next_out - next_out_utf8;
utf8str = strings.buf2string(strm.output, next_out_utf8);
strm.next_out = tail;
strm.avail_out = chunkSize - tail;
if (tail) { utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0); }
this.onData(utf8str);
} else {
this.onData(utils.shrinkBuf(strm.output, strm.next_out));
}
}
}
if (strm.avail_in === 0 && strm.avail_out === 0) {
allowBufError = true;
}
} while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);
if (status === c.Z_STREAM_END) {
_mode = c.Z_FINISH;
}
if (_mode === c.Z_FINISH) {
status = zlib_inflate.inflateEnd(this.strm);
this.onEnd(status);
this.ended = true;
return status === c.Z_OK;
}
if (_mode === c.Z_SYNC_FLUSH) {
this.onEnd(c.Z_OK);
strm.avail_out = 0;
return true;
}
return true;
};
Inflate.prototype.onData = function (chunk) {
this.chunks.push(chunk);
};
Inflate.prototype.onEnd = function (status) {
if (status === c.Z_OK) {
if (this.options.to === 'string') {
this.result = this.chunks.join('');
} else {
this.result = utils.flattenChunks(this.chunks);
}
}
this.chunks = [];
this.err = status;
this.msg = this.strm.msg;
};
function inflate(input, options) {
var inflator = new Inflate(options);
inflator.push(input, true);
if (inflator.err) { throw inflator.msg; }
return inflator.result;
}
function inflateRaw(input, options) {
options = options || {};
options.raw = true;
return inflate(input, options);
}
exports.Inflate = Inflate;
exports.inflate = inflate;
exports.inflateRaw = inflateRaw;
exports.ungzip  = inflate;
},{"./utils/common":32,"./utils/strings":33,"./zlib/constants":35,"./zlib/gzheader":38,"./zlib/inflate":40,"./zlib/messages":42,"./zlib/zstream":44}],32:[function(_dereq_,module,exports){
'use strict';
var TYPED_OK =  (typeof Uint8Array !== 'undefined') &&
(typeof Uint16Array !== 'undefined') &&
(typeof Int32Array !== 'undefined');
exports.assign = function (obj ) {
var sources = Array.prototype.slice.call(arguments, 1);
while (sources.length) {
var source = sources.shift();
if (!source) { continue; }
if (typeof source !== 'object') {
throw new TypeError(source + 'must be non-object');
}
for (var p in source) {
if (source.hasOwnProperty(p)) {
obj[p] = source[p];
}
}
}
return obj;
};
exports.shrinkBuf = function (buf, size) {
if (buf.length === size) { return buf; }
if (buf.subarray) { return buf.subarray(0, size); }
buf.length = size;
return buf;
};
var fnTyped = {
arraySet: function (dest, src, src_offs, len, dest_offs) {
if (src.subarray && dest.subarray) {
dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
return;
}
for (var i = 0; i < len; i++) {
dest[dest_offs + i] = src[src_offs + i];
}
},
flattenChunks: function (chunks) {
var i, l, len, pos, chunk, result;
len = 0;
for (i = 0, l = chunks.length; i < l; i++) {
len += chunks[i].length;
}
result = new Uint8Array(len);
pos = 0;
for (i = 0, l = chunks.length; i < l; i++) {
chunk = chunks[i];
result.set(chunk, pos);
pos += chunk.length;
}
return result;
}
};
var fnUntyped = {
arraySet: function (dest, src, src_offs, len, dest_offs) {
for (var i = 0; i < len; i++) {
dest[dest_offs + i] = src[src_offs + i];
}
},
flattenChunks: function (chunks) {
return [].concat.apply([], chunks);
}
};
exports.setTyped = function (on) {
if (on) {
exports.Buf8  = Uint8Array;
exports.Buf16 = Uint16Array;
exports.Buf32 = Int32Array;
exports.assign(exports, fnTyped);
} else {
exports.Buf8  = Array;
exports.Buf16 = Array;
exports.Buf32 = Array;
exports.assign(exports, fnUntyped);
}
};
exports.setTyped(TYPED_OK);
},{}],33:[function(_dereq_,module,exports){
'use strict';
var utils = _dereq_('./common');
var STR_APPLY_OK = true;
var STR_APPLY_UIA_OK = true;
try { String.fromCharCode.apply(null, [ 0 ]); } catch (__) { STR_APPLY_OK = false; }
try { String.fromCharCode.apply(null, new Uint8Array(1)); } catch (__) { STR_APPLY_UIA_OK = false; }
var _utf8len = new utils.Buf8(256);
for (var q = 0; q < 256; q++) {
_utf8len[q] = (q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1);
}
_utf8len[254] = _utf8len[254] = 1;
exports.string2buf = function (str) {
var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
for (m_pos = 0; m_pos < str_len; m_pos++) {
c = str.charCodeAt(m_pos);
if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
c2 = str.charCodeAt(m_pos + 1);
if ((c2 & 0xfc00) === 0xdc00) {
c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
m_pos++;
}
}
buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
}
buf = new utils.Buf8(buf_len);
for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
c = str.charCodeAt(m_pos);
if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
c2 = str.charCodeAt(m_pos + 1);
if ((c2 & 0xfc00) === 0xdc00) {
c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
m_pos++;
}
}
if (c < 0x80) {
buf[i++] = c;
} else if (c < 0x800) {
buf[i++] = 0xC0 | (c >>> 6);
buf[i++] = 0x80 | (c & 0x3f);
} else if (c < 0x10000) {
buf[i++] = 0xE0 | (c >>> 12);
buf[i++] = 0x80 | (c >>> 6 & 0x3f);
buf[i++] = 0x80 | (c & 0x3f);
} else {
buf[i++] = 0xf0 | (c >>> 18);
buf[i++] = 0x80 | (c >>> 12 & 0x3f);
buf[i++] = 0x80 | (c >>> 6 & 0x3f);
buf[i++] = 0x80 | (c & 0x3f);
}
}
return buf;
};
function buf2binstring(buf, len) {
if (len < 65537) {
if ((buf.subarray && STR_APPLY_UIA_OK) || (!buf.subarray && STR_APPLY_OK)) {
return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
}
}
var result = '';
for (var i = 0; i < len; i++) {
result += String.fromCharCode(buf[i]);
}
return result;
}
exports.buf2binstring = function (buf) {
return buf2binstring(buf, buf.length);
};
exports.binstring2buf = function (str) {
var buf = new utils.Buf8(str.length);
for (var i = 0, len = buf.length; i < len; i++) {
buf[i] = str.charCodeAt(i);
}
return buf;
};
exports.buf2string = function (buf, max) {
var i, out, c, c_len;
var len = max || buf.length;
var utf16buf = new Array(len * 2);
for (out = 0, i = 0; i < len;) {
c = buf[i++];
if (c < 0x80) { utf16buf[out++] = c; continue; }
c_len = _utf8len[c];
if (c_len > 4) { utf16buf[out++] = 0xfffd; i += c_len - 1; continue; }
c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
while (c_len > 1 && i < len) {
c = (c << 6) | (buf[i++] & 0x3f);
c_len--;
}
if (c_len > 1) { utf16buf[out++] = 0xfffd; continue; }
if (c < 0x10000) {
utf16buf[out++] = c;
} else {
c -= 0x10000;
utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
utf16buf[out++] = 0xdc00 | (c & 0x3ff);
}
}
return buf2binstring(utf16buf, out);
};
exports.utf8border = function (buf, max) {
var pos;
max = max || buf.length;
if (max > buf.length) { max = buf.length; }
pos = max - 1;
while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) { pos--; }
if (pos < 0) { return max; }
if (pos === 0) { return max; }
return (pos + _utf8len[buf[pos]] > max) ? pos : max;
};
},{"./common":32}],34:[function(_dereq_,module,exports){
'use strict';
function adler32(adler, buf, len, pos) {
var s1 = (adler & 0xffff) |0,
s2 = ((adler >>> 16) & 0xffff) |0,
n = 0;
while (len !== 0) {
n = len > 2000 ? 2000 : len;
len -= n;
do {
s1 = (s1 + buf[pos++]) |0;
s2 = (s2 + s1) |0;
} while (--n);
s1 %= 65521;
s2 %= 65521;
}
return (s1 | (s2 << 16)) |0;
}
module.exports = adler32;
},{}],35:[function(_dereq_,module,exports){
'use strict';
module.exports = {
Z_NO_FLUSH:         0,
Z_PARTIAL_FLUSH:    1,
Z_SYNC_FLUSH:       2,
Z_FULL_FLUSH:       3,
Z_FINISH:           4,
Z_BLOCK:            5,
Z_TREES:            6,
Z_OK:               0,
Z_STREAM_END:       1,
Z_NEED_DICT:        2,
Z_ERRNO:           -1,
Z_STREAM_ERROR:    -2,
Z_DATA_ERROR:      -3,
Z_BUF_ERROR:       -5,
Z_NO_COMPRESSION:         0,
Z_BEST_SPEED:             1,
Z_BEST_COMPRESSION:       9,
Z_DEFAULT_COMPRESSION:   -1,
Z_FILTERED:               1,
Z_HUFFMAN_ONLY:           2,
Z_RLE:                    3,
Z_FIXED:                  4,
Z_DEFAULT_STRATEGY:       0,
Z_BINARY:                 0,
Z_TEXT:                   1,
Z_UNKNOWN:                2,
Z_DEFLATED:               8
};
},{}],36:[function(_dereq_,module,exports){
'use strict';
function makeTable() {
var c, table = [];
for (var n = 0; n < 256; n++) {
c = n;
for (var k = 0; k < 8; k++) {
c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
}
table[n] = c;
}
return table;
}
var crcTable = makeTable();
function crc32(crc, buf, len, pos) {
var t = crcTable,
end = pos + len;
crc ^= -1;
for (var i = pos; i < end; i++) {
crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
}
return (crc ^ (-1));
}
module.exports = crc32;
},{}],37:[function(_dereq_,module,exports){
'use strict';
var utils   = _dereq_('../utils/common');
var trees   = _dereq_('./trees');
var adler32 = _dereq_('./adler32');
var crc32   = _dereq_('./crc32');
var msg     = _dereq_('./messages');
var Z_NO_FLUSH      = 0;
var Z_PARTIAL_FLUSH = 1;
var Z_FULL_FLUSH    = 3;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
var Z_OK            = 0;
var Z_STREAM_END    = 1;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
var Z_BUF_ERROR     = -5;
var Z_DEFAULT_COMPRESSION = -1;
var Z_FILTERED            = 1;
var Z_HUFFMAN_ONLY        = 2;
var Z_RLE                 = 3;
var Z_FIXED               = 4;
var Z_DEFAULT_STRATEGY    = 0;
var Z_UNKNOWN             = 2;
var Z_DEFLATED  = 8;
var MAX_MEM_LEVEL = 9;
var MAX_WBITS = 15;
var DEF_MEM_LEVEL = 8;
var LENGTH_CODES  = 29;
var LITERALS      = 256;
var L_CODES       = LITERALS + 1 + LENGTH_CODES;
var D_CODES       = 30;
var BL_CODES      = 19;
var HEAP_SIZE     = 2 * L_CODES + 1;
var MAX_BITS  = 15;
var MIN_MATCH = 3;
var MAX_MATCH = 258;
var MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);
var PRESET_DICT = 0x20;
var INIT_STATE = 42;
var EXTRA_STATE = 69;
var NAME_STATE = 73;
var COMMENT_STATE = 91;
var HCRC_STATE = 103;
var BUSY_STATE = 113;
var FINISH_STATE = 666;
var BS_NEED_MORE      = 1;
var BS_BLOCK_DONE     = 2;
var BS_FINISH_STARTED = 3;
var BS_FINISH_DONE    = 4;
var OS_CODE = 0x03;
function err(strm, errorCode) {
strm.msg = msg[errorCode];
return errorCode;
}
function rank(f) {
return ((f) << 1) - ((f) > 4 ? 9 : 0);
}
function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }
function flush_pending(strm) {
var s = strm.state;
var len = s.pending;
if (len > strm.avail_out) {
len = strm.avail_out;
}
if (len === 0) { return; }
utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
strm.next_out += len;
s.pending_out += len;
strm.total_out += len;
strm.avail_out -= len;
s.pending -= len;
if (s.pending === 0) {
s.pending_out = 0;
}
}
function flush_block_only(s, last) {
trees._tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
s.block_start = s.strstart;
flush_pending(s.strm);
}
function put_byte(s, b) {
s.pending_buf[s.pending++] = b;
}
function putShortMSB(s, b) {
s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
s.pending_buf[s.pending++] = b & 0xff;
}
function read_buf(strm, buf, start, size) {
var len = strm.avail_in;
if (len > size) { len = size; }
if (len === 0) { return 0; }
strm.avail_in -= len;
utils.arraySet(buf, strm.input, strm.next_in, len, start);
if (strm.state.wrap === 1) {
strm.adler = adler32(strm.adler, buf, len, start);
}
else if (strm.state.wrap === 2) {
strm.adler = crc32(strm.adler, buf, len, start);
}
strm.next_in += len;
strm.total_in += len;
return len;
}
function longest_match(s, cur_match) {
var chain_length = s.max_chain_length;
var scan = s.strstart;
var match;
var len;
var best_len = s.prev_length;
var nice_match = s.nice_match;
var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
var _win = s.window;
var wmask = s.w_mask;
var prev  = s.prev;
var strend = s.strstart + MAX_MATCH;
var scan_end1  = _win[scan + best_len - 1];
var scan_end   = _win[scan + best_len];
if (s.prev_length >= s.good_match) {
chain_length >>= 2;
}
if (nice_match > s.lookahead) { nice_match = s.lookahead; }
do {
match = cur_match;
if (_win[match + best_len]     !== scan_end  ||
_win[match + best_len - 1] !== scan_end1 ||
_win[match]                !== _win[scan] ||
_win[++match]              !== _win[scan + 1]) {
continue;
}
scan += 2;
match++;
do {
} while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
scan < strend);
len = MAX_MATCH - (strend - scan);
scan = strend - MAX_MATCH;
if (len > best_len) {
s.match_start = cur_match;
best_len = len;
if (len >= nice_match) {
break;
}
scan_end1  = _win[scan + best_len - 1];
scan_end   = _win[scan + best_len];
}
} while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
if (best_len <= s.lookahead) {
return best_len;
}
return s.lookahead;
}
function fill_window(s) {
var _w_size = s.w_size;
var p, n, m, more, str;
do {
more = s.window_size - s.lookahead - s.strstart;
if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
s.match_start -= _w_size;
s.strstart -= _w_size;
s.block_start -= _w_size;
n = s.hash_size;
p = n;
do {
m = s.head[--p];
s.head[p] = (m >= _w_size ? m - _w_size : 0);
} while (--n);
n = _w_size;
p = n;
do {
m = s.prev[--p];
s.prev[p] = (m >= _w_size ? m - _w_size : 0);
} while (--n);
more += _w_size;
}
if (s.strm.avail_in === 0) {
break;
}
n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
s.lookahead += n;
if (s.lookahead + s.insert >= MIN_MATCH) {
str = s.strstart - s.insert;
s.ins_h = s.window[str];
s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
while (s.insert) {
s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
s.prev[str & s.w_mask] = s.head[s.ins_h];
s.head[s.ins_h] = str;
str++;
s.insert--;
if (s.lookahead + s.insert < MIN_MATCH) {
break;
}
}
}
} while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
}
function deflate_stored(s, flush) {
var max_block_size = 0xffff;
if (max_block_size > s.pending_buf_size - 5) {
max_block_size = s.pending_buf_size - 5;
}
for (;;) {
if (s.lookahead <= 1) {
fill_window(s);
if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
return BS_NEED_MORE;
}
if (s.lookahead === 0) {
break;
}
}
s.strstart += s.lookahead;
s.lookahead = 0;
var max_start = s.block_start + max_block_size;
if (s.strstart === 0 || s.strstart >= max_start) {
s.lookahead = s.strstart - max_start;
s.strstart = max_start;
flush_block_only(s, false);
if (s.strm.avail_out === 0) {
return BS_NEED_MORE;
}
}
if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
flush_block_only(s, false);
if (s.strm.avail_out === 0) {
return BS_NEED_MORE;
}
}
}
s.insert = 0;
if (flush === Z_FINISH) {
flush_block_only(s, true);
if (s.strm.avail_out === 0) {
return BS_FINISH_STARTED;
}
return BS_FINISH_DONE;
}
if (s.strstart > s.block_start) {
flush_block_only(s, false);
if (s.strm.avail_out === 0) {
return BS_NEED_MORE;
}
}
return BS_NEED_MORE;
}
function deflate_fast(s, flush) {
var hash_head;
var bflush;
for (;;) {
if (s.lookahead < MIN_LOOKAHEAD) {
fill_window(s);
if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
return BS_NEED_MORE;
}
if (s.lookahead === 0) {
break;
}
}
hash_head = 0;
if (s.lookahead >= MIN_MATCH) {
s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
s.head[s.ins_h] = s.strstart;
}
if (hash_head !== 0 && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
s.match_length = longest_match(s, hash_head);
}
if (s.match_length >= MIN_MATCH) {
bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
s.lookahead -= s.match_length;
if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
s.match_length--;
do {
s.strstart++;
s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
s.head[s.ins_h] = s.strstart;
} while (--s.match_length !== 0);
s.strstart++;
} else
{
s.strstart += s.match_length;
s.match_length = 0;
s.ins_h = s.window[s.strstart];
s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;
}
} else {
bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
s.lookahead--;
s.strstart++;
}
if (bflush) {
flush_block_only(s, false);
if (s.strm.avail_out === 0) {
return BS_NEED_MORE;
}
}
}
s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
if (flush === Z_FINISH) {
flush_block_only(s, true);
if (s.strm.avail_out === 0) {
return BS_FINISH_STARTED;
}
return BS_FINISH_DONE;
}
if (s.last_lit) {
flush_block_only(s, false);
if (s.strm.avail_out === 0) {
return BS_NEED_MORE;
}
}
return BS_BLOCK_DONE;
}
function deflate_slow(s, flush) {
var hash_head;
var bflush;
var max_insert;
for (;;) {
if (s.lookahead < MIN_LOOKAHEAD) {
fill_window(s);
if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
return BS_NEED_MORE;
}
if (s.lookahead === 0) { break; }
}
hash_head = 0;
if (s.lookahead >= MIN_MATCH) {
s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
s.head[s.ins_h] = s.strstart;
}
s.prev_length = s.match_length;
s.prev_match = s.match_start;
s.match_length = MIN_MATCH - 1;
if (hash_head !== 0 && s.prev_length < s.max_lazy_match &&
s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)) {
s.match_length = longest_match(s, hash_head);
if (s.match_length <= 5 &&
(s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096))) {
s.match_length = MIN_MATCH - 1;
}
}
if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
max_insert = s.strstart + s.lookahead - MIN_MATCH;
bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
s.lookahead -= s.prev_length - 1;
s.prev_length -= 2;
do {
if (++s.strstart <= max_insert) {
s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
s.head[s.ins_h] = s.strstart;
}
} while (--s.prev_length !== 0);
s.match_available = 0;
s.match_length = MIN_MATCH - 1;
s.strstart++;
if (bflush) {
flush_block_only(s, false);
if (s.strm.avail_out === 0) {
return BS_NEED_MORE;
}
}
} else if (s.match_available) {
bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
if (bflush) {
flush_block_only(s, false);
}
s.strstart++;
s.lookahead--;
if (s.strm.avail_out === 0) {
return BS_NEED_MORE;
}
} else {
s.match_available = 1;
s.strstart++;
s.lookahead--;
}
}
if (s.match_available) {
bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
s.match_available = 0;
}
s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
if (flush === Z_FINISH) {
flush_block_only(s, true);
if (s.strm.avail_out === 0) {
return BS_FINISH_STARTED;
}
return BS_FINISH_DONE;
}
if (s.last_lit) {
flush_block_only(s, false);
if (s.strm.avail_out === 0) {
return BS_NEED_MORE;
}
}
return BS_BLOCK_DONE;
}
function deflate_rle(s, flush) {
var bflush;
var prev;
var scan, strend;
var _win = s.window;
for (;;) {
if (s.lookahead <= MAX_MATCH) {
fill_window(s);
if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
return BS_NEED_MORE;
}
if (s.lookahead === 0) { break; }
}
s.match_length = 0;
if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
scan = s.strstart - 1;
prev = _win[scan];
if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
strend = s.strstart + MAX_MATCH;
do {
} while (prev === _win[++scan] && prev === _win[++scan] &&
prev === _win[++scan] && prev === _win[++scan] &&
prev === _win[++scan] && prev === _win[++scan] &&
prev === _win[++scan] && prev === _win[++scan] &&
scan < strend);
s.match_length = MAX_MATCH - (strend - scan);
if (s.match_length > s.lookahead) {
s.match_length = s.lookahead;
}
}
}
if (s.match_length >= MIN_MATCH) {
bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);
s.lookahead -= s.match_length;
s.strstart += s.match_length;
s.match_length = 0;
} else {
bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
s.lookahead--;
s.strstart++;
}
if (bflush) {
flush_block_only(s, false);
if (s.strm.avail_out === 0) {
return BS_NEED_MORE;
}
}
}
s.insert = 0;
if (flush === Z_FINISH) {
flush_block_only(s, true);
if (s.strm.avail_out === 0) {
return BS_FINISH_STARTED;
}
return BS_FINISH_DONE;
}
if (s.last_lit) {
flush_block_only(s, false);
if (s.strm.avail_out === 0) {
return BS_NEED_MORE;
}
}
return BS_BLOCK_DONE;
}
function deflate_huff(s, flush) {
var bflush;
for (;;) {
if (s.lookahead === 0) {
fill_window(s);
if (s.lookahead === 0) {
if (flush === Z_NO_FLUSH) {
return BS_NEED_MORE;
}
break;
}
}
s.match_length = 0;
bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
s.lookahead--;
s.strstart++;
if (bflush) {
flush_block_only(s, false);
if (s.strm.avail_out === 0) {
return BS_NEED_MORE;
}
}
}
s.insert = 0;
if (flush === Z_FINISH) {
flush_block_only(s, true);
if (s.strm.avail_out === 0) {
return BS_FINISH_STARTED;
}
return BS_FINISH_DONE;
}
if (s.last_lit) {
flush_block_only(s, false);
if (s.strm.avail_out === 0) {
return BS_NEED_MORE;
}
}
return BS_BLOCK_DONE;
}
function Config(good_length, max_lazy, nice_length, max_chain, func) {
this.good_length = good_length;
this.max_lazy = max_lazy;
this.nice_length = nice_length;
this.max_chain = max_chain;
this.func = func;
}
var configuration_table;
configuration_table = [
new Config(0, 0, 0, 0, deflate_stored),
new Config(4, 4, 8, 4, deflate_fast),
new Config(4, 5, 16, 8, deflate_fast),
new Config(4, 6, 32, 32, deflate_fast),
new Config(4, 4, 16, 16, deflate_slow),
new Config(8, 16, 32, 32, deflate_slow),
new Config(8, 16, 128, 128, deflate_slow),
new Config(8, 32, 128, 256, deflate_slow),
new Config(32, 128, 258, 1024, deflate_slow),
new Config(32, 258, 258, 4096, deflate_slow)
];
function lm_init(s) {
s.window_size = 2 * s.w_size;
zero(s.head);
s.max_lazy_match = configuration_table[s.level].max_lazy;
s.good_match = configuration_table[s.level].good_length;
s.nice_match = configuration_table[s.level].nice_length;
s.max_chain_length = configuration_table[s.level].max_chain;
s.strstart = 0;
s.block_start = 0;
s.lookahead = 0;
s.insert = 0;
s.match_length = s.prev_length = MIN_MATCH - 1;
s.match_available = 0;
s.ins_h = 0;
}
function DeflateState() {
this.strm = null;
this.status = 0;
this.pending_buf = null;
this.pending_buf_size = 0;
this.pending_out = 0;
this.pending = 0;
this.wrap = 0;
this.gzhead = null;
this.gzindex = 0;
this.method = Z_DEFLATED;
this.last_flush = -1;
this.w_size = 0;
this.w_bits = 0;
this.w_mask = 0;
this.window = null;
this.window_size = 0;
this.prev = null;
this.head = null;
this.ins_h = 0;
this.hash_size = 0;
this.hash_bits = 0;
this.hash_mask = 0;
this.hash_shift = 0;
this.block_start = 0;
this.match_length = 0;
this.prev_match = 0;
this.match_available = 0;
this.strstart = 0;
this.match_start = 0;
this.lookahead = 0;
this.prev_length = 0;
this.max_chain_length = 0;
this.max_lazy_match = 0;
this.level = 0;
this.strategy = 0;
this.good_match = 0;
this.nice_match = 0;
this.dyn_ltree  = new utils.Buf16(HEAP_SIZE * 2);
this.dyn_dtree  = new utils.Buf16((2 * D_CODES + 1) * 2);
this.bl_tree    = new utils.Buf16((2 * BL_CODES + 1) * 2);
zero(this.dyn_ltree);
zero(this.dyn_dtree);
zero(this.bl_tree);
this.l_desc   = null;
this.d_desc   = null;
this.bl_desc  = null;
this.bl_count = new utils.Buf16(MAX_BITS + 1);
this.heap = new utils.Buf16(2 * L_CODES + 1);
zero(this.heap);
this.heap_len = 0;
this.heap_max = 0;
this.depth = new utils.Buf16(2 * L_CODES + 1);
zero(this.depth);
this.l_buf = 0;
this.lit_bufsize = 0;
this.last_lit = 0;
this.d_buf = 0;
this.opt_len = 0;
this.static_len = 0;
this.matches = 0;
this.insert = 0;
this.bi_buf = 0;
this.bi_valid = 0;
}
function deflateResetKeep(strm) {
var s;
if (!strm || !strm.state) {
return err(strm, Z_STREAM_ERROR);
}
strm.total_in = strm.total_out = 0;
strm.data_type = Z_UNKNOWN;
s = strm.state;
s.pending = 0;
s.pending_out = 0;
if (s.wrap < 0) {
s.wrap = -s.wrap;
}
s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
strm.adler = (s.wrap === 2) ?
0
:
1;
s.last_flush = Z_NO_FLUSH;
trees._tr_init(s);
return Z_OK;
}
function deflateReset(strm) {
var ret = deflateResetKeep(strm);
if (ret === Z_OK) {
lm_init(strm.state);
}
return ret;
}
function deflateSetHeader(strm, head) {
if (!strm || !strm.state) { return Z_STREAM_ERROR; }
if (strm.state.wrap !== 2) { return Z_STREAM_ERROR; }
strm.state.gzhead = head;
return Z_OK;
}
function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
if (!strm) {
return Z_STREAM_ERROR;
}
var wrap = 1;
if (level === Z_DEFAULT_COMPRESSION) {
level = 6;
}
if (windowBits < 0) {
wrap = 0;
windowBits = -windowBits;
}
else if (windowBits > 15) {
wrap = 2;
windowBits -= 16;
}
if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||
windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
strategy < 0 || strategy > Z_FIXED) {
return err(strm, Z_STREAM_ERROR);
}
if (windowBits === 8) {
windowBits = 9;
}
var s = new DeflateState();
strm.state = s;
s.strm = strm;
s.wrap = wrap;
s.gzhead = null;
s.w_bits = windowBits;
s.w_size = 1 << s.w_bits;
s.w_mask = s.w_size - 1;
s.hash_bits = memLevel + 7;
s.hash_size = 1 << s.hash_bits;
s.hash_mask = s.hash_size - 1;
s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
s.window = new utils.Buf8(s.w_size * 2);
s.head = new utils.Buf16(s.hash_size);
s.prev = new utils.Buf16(s.w_size);
s.lit_bufsize = 1 << (memLevel + 6);
s.pending_buf_size = s.lit_bufsize * 4;
s.pending_buf = new utils.Buf8(s.pending_buf_size);
s.d_buf = s.lit_bufsize >> 1;
s.l_buf = (1 + 2) * s.lit_bufsize;
s.level = level;
s.strategy = strategy;
s.method = method;
return deflateReset(strm);
}
function deflateInit(strm, level) {
return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
}
function deflate(strm, flush) {
var old_flush, s;
var beg, val;
if (!strm || !strm.state ||
flush > Z_BLOCK || flush < 0) {
return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
}
s = strm.state;
if (!strm.output ||
(!strm.input && strm.avail_in !== 0) ||
(s.status === FINISH_STATE && flush !== Z_FINISH)) {
return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);
}
s.strm = strm;
old_flush = s.last_flush;
s.last_flush = flush;
if (s.status === INIT_STATE) {
if (s.wrap === 2) {
strm.adler = 0;
put_byte(s, 31);
put_byte(s, 139);
put_byte(s, 8);
if (!s.gzhead) {
put_byte(s, 0);
put_byte(s, 0);
put_byte(s, 0);
put_byte(s, 0);
put_byte(s, 0);
put_byte(s, s.level === 9 ? 2 :
(s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
4 : 0));
put_byte(s, OS_CODE);
s.status = BUSY_STATE;
}
else {
put_byte(s, (s.gzhead.text ? 1 : 0) +
(s.gzhead.hcrc ? 2 : 0) +
(!s.gzhead.extra ? 0 : 4) +
(!s.gzhead.name ? 0 : 8) +
(!s.gzhead.comment ? 0 : 16)
);
put_byte(s, s.gzhead.time & 0xff);
put_byte(s, (s.gzhead.time >> 8) & 0xff);
put_byte(s, (s.gzhead.time >> 16) & 0xff);
put_byte(s, (s.gzhead.time >> 24) & 0xff);
put_byte(s, s.level === 9 ? 2 :
(s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
4 : 0));
put_byte(s, s.gzhead.os & 0xff);
if (s.gzhead.extra && s.gzhead.extra.length) {
put_byte(s, s.gzhead.extra.length & 0xff);
put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
}
if (s.gzhead.hcrc) {
strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
}
s.gzindex = 0;
s.status = EXTRA_STATE;
}
}
else
{
var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
var level_flags = -1;
if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
level_flags = 0;
} else if (s.level < 6) {
level_flags = 1;
} else if (s.level === 6) {
level_flags = 2;
} else {
level_flags = 3;
}
header |= (level_flags << 6);
if (s.strstart !== 0) { header |= PRESET_DICT; }
header += 31 - (header % 31);
s.status = BUSY_STATE;
putShortMSB(s, header);
if (s.strstart !== 0) {
putShortMSB(s, strm.adler >>> 16);
putShortMSB(s, strm.adler & 0xffff);
}
strm.adler = 1;
}
}
if (s.status === EXTRA_STATE) {
if (s.gzhead.extra) {
beg = s.pending;
while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
if (s.pending === s.pending_buf_size) {
if (s.gzhead.hcrc && s.pending > beg) {
strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
}
flush_pending(strm);
beg = s.pending;
if (s.pending === s.pending_buf_size) {
break;
}
}
put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
s.gzindex++;
}
if (s.gzhead.hcrc && s.pending > beg) {
strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
}
if (s.gzindex === s.gzhead.extra.length) {
s.gzindex = 0;
s.status = NAME_STATE;
}
}
else {
s.status = NAME_STATE;
}
}
if (s.status === NAME_STATE) {
if (s.gzhead.name) {
beg = s.pending;
do {
if (s.pending === s.pending_buf_size) {
if (s.gzhead.hcrc && s.pending > beg) {
strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
}
flush_pending(strm);
beg = s.pending;
if (s.pending === s.pending_buf_size) {
val = 1;
break;
}
}
if (s.gzindex < s.gzhead.name.length) {
val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
} else {
val = 0;
}
put_byte(s, val);
} while (val !== 0);
if (s.gzhead.hcrc && s.pending > beg) {
strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
}
if (val === 0) {
s.gzindex = 0;
s.status = COMMENT_STATE;
}
}
else {
s.status = COMMENT_STATE;
}
}
if (s.status === COMMENT_STATE) {
if (s.gzhead.comment) {
beg = s.pending;
do {
if (s.pending === s.pending_buf_size) {
if (s.gzhead.hcrc && s.pending > beg) {
strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
}
flush_pending(strm);
beg = s.pending;
if (s.pending === s.pending_buf_size) {
val = 1;
break;
}
}
if (s.gzindex < s.gzhead.comment.length) {
val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
} else {
val = 0;
}
put_byte(s, val);
} while (val !== 0);
if (s.gzhead.hcrc && s.pending > beg) {
strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
}
if (val === 0) {
s.status = HCRC_STATE;
}
}
else {
s.status = HCRC_STATE;
}
}
if (s.status === HCRC_STATE) {
if (s.gzhead.hcrc) {
if (s.pending + 2 > s.pending_buf_size) {
flush_pending(strm);
}
if (s.pending + 2 <= s.pending_buf_size) {
put_byte(s, strm.adler & 0xff);
put_byte(s, (strm.adler >> 8) & 0xff);
strm.adler = 0;
s.status = BUSY_STATE;
}
}
else {
s.status = BUSY_STATE;
}
}
if (s.pending !== 0) {
flush_pending(strm);
if (strm.avail_out === 0) {
s.last_flush = -1;
return Z_OK;
}
} else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
flush !== Z_FINISH) {
return err(strm, Z_BUF_ERROR);
}
if (s.status === FINISH_STATE && strm.avail_in !== 0) {
return err(strm, Z_BUF_ERROR);
}
if (strm.avail_in !== 0 || s.lookahead !== 0 ||
(flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {
var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :
(s.strategy === Z_RLE ? deflate_rle(s, flush) :
configuration_table[s.level].func(s, flush));
if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
s.status = FINISH_STATE;
}
if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
if (strm.avail_out === 0) {
s.last_flush = -1;
}
return Z_OK;
}
if (bstate === BS_BLOCK_DONE) {
if (flush === Z_PARTIAL_FLUSH) {
trees._tr_align(s);
}
else if (flush !== Z_BLOCK) {
trees._tr_stored_block(s, 0, 0, false);
if (flush === Z_FULL_FLUSH) {
zero(s.head);
if (s.lookahead === 0) {
s.strstart = 0;
s.block_start = 0;
s.insert = 0;
}
}
}
flush_pending(strm);
if (strm.avail_out === 0) {
s.last_flush = -1;
return Z_OK;
}
}
}
if (flush !== Z_FINISH) { return Z_OK; }
if (s.wrap <= 0) { return Z_STREAM_END; }
if (s.wrap === 2) {
put_byte(s, strm.adler & 0xff);
put_byte(s, (strm.adler >> 8) & 0xff);
put_byte(s, (strm.adler >> 16) & 0xff);
put_byte(s, (strm.adler >> 24) & 0xff);
put_byte(s, strm.total_in & 0xff);
put_byte(s, (strm.total_in >> 8) & 0xff);
put_byte(s, (strm.total_in >> 16) & 0xff);
put_byte(s, (strm.total_in >> 24) & 0xff);
}
else
{
putShortMSB(s, strm.adler >>> 16);
putShortMSB(s, strm.adler & 0xffff);
}
flush_pending(strm);
if (s.wrap > 0) { s.wrap = -s.wrap; }
return s.pending !== 0 ? Z_OK : Z_STREAM_END;
}
function deflateEnd(strm) {
var status;
if (!strm || !strm.state) {
return Z_STREAM_ERROR;
}
status = strm.state.status;
if (status !== INIT_STATE &&
status !== EXTRA_STATE &&
status !== NAME_STATE &&
status !== COMMENT_STATE &&
status !== HCRC_STATE &&
status !== BUSY_STATE &&
status !== FINISH_STATE
) {
return err(strm, Z_STREAM_ERROR);
}
strm.state = null;
return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
}
function deflateSetDictionary(strm, dictionary) {
var dictLength = dictionary.length;
var s;
var str, n;
var wrap;
var avail;
var next;
var input;
var tmpDict;
if (!strm || !strm.state) {
return Z_STREAM_ERROR;
}
s = strm.state;
wrap = s.wrap;
if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {
return Z_STREAM_ERROR;
}
if (wrap === 1) {
strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
}
s.wrap = 0;
if (dictLength >= s.w_size) {
if (wrap === 0) {
zero(s.head);
s.strstart = 0;
s.block_start = 0;
s.insert = 0;
}
tmpDict = new utils.Buf8(s.w_size);
utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
dictionary = tmpDict;
dictLength = s.w_size;
}
avail = strm.avail_in;
next = strm.next_in;
input = strm.input;
strm.avail_in = dictLength;
strm.next_in = 0;
strm.input = dictionary;
fill_window(s);
while (s.lookahead >= MIN_MATCH) {
str = s.strstart;
n = s.lookahead - (MIN_MATCH - 1);
do {
s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
s.prev[str & s.w_mask] = s.head[s.ins_h];
s.head[s.ins_h] = str;
str++;
} while (--n);
s.strstart = str;
s.lookahead = MIN_MATCH - 1;
fill_window(s);
}
s.strstart += s.lookahead;
s.block_start = s.strstart;
s.insert = s.lookahead;
s.lookahead = 0;
s.match_length = s.prev_length = MIN_MATCH - 1;
s.match_available = 0;
strm.next_in = next;
strm.input = input;
strm.avail_in = avail;
s.wrap = wrap;
return Z_OK;
}
exports.deflateInit = deflateInit;
exports.deflateInit2 = deflateInit2;
exports.deflateReset = deflateReset;
exports.deflateResetKeep = deflateResetKeep;
exports.deflateSetHeader = deflateSetHeader;
exports.deflate = deflate;
exports.deflateEnd = deflateEnd;
exports.deflateSetDictionary = deflateSetDictionary;
exports.deflateInfo = 'pako deflate (from Nodeca project)';
},{"../utils/common":32,"./adler32":34,"./crc32":36,"./messages":42,"./trees":43}],38:[function(_dereq_,module,exports){
'use strict';
function GZheader() {
this.text       = 0;
this.time       = 0;
this.xflags     = 0;
this.os         = 0;
this.extra      = null;
this.extra_len  = 0;
this.name       = '';
this.comment    = '';
this.hcrc       = 0;
this.done       = false;
}
module.exports = GZheader;
},{}],39:[function(_dereq_,module,exports){
'use strict';
var BAD = 30;
var TYPE = 12;
module.exports = function inflate_fast(strm, start) {
var state;
var _in;
var last;
var _out;
var beg;
var end;
var dmax;
var wsize;
var whave;
var wnext;
var s_window;
var hold;
var bits;
var lcode;
var dcode;
var lmask;
var dmask;
var here;
var op;
var len;
var dist;
var from;
var from_source;
var input, output;
state = strm.state;
_in = strm.next_in;
input = strm.input;
last = _in + (strm.avail_in - 5);
_out = strm.next_out;
output = strm.output;
beg = _out - (start - strm.avail_out);
end = _out + (strm.avail_out - 257);
dmax = state.dmax;
wsize = state.wsize;
whave = state.whave;
wnext = state.wnext;
s_window = state.window;
hold = state.hold;
bits = state.bits;
lcode = state.lencode;
dcode = state.distcode;
lmask = (1 << state.lenbits) - 1;
dmask = (1 << state.distbits) - 1;
top:
do {
if (bits < 15) {
hold += input[_in++] << bits;
bits += 8;
hold += input[_in++] << bits;
bits += 8;
}
here = lcode[hold & lmask];
dolen:
for (;;) {
op = here >>> 24;
hold >>>= op;
bits -= op;
op = (here >>> 16) & 0xff;
if (op === 0) {
output[_out++] = here & 0xffff;
}
else if (op & 16) {
len = here & 0xffff;
op &= 15;
if (op) {
if (bits < op) {
hold += input[_in++] << bits;
bits += 8;
}
len += hold & ((1 << op) - 1);
hold >>>= op;
bits -= op;
}
if (bits < 15) {
hold += input[_in++] << bits;
bits += 8;
hold += input[_in++] << bits;
bits += 8;
}
here = dcode[hold & dmask];
dodist:
for (;;) {
op = here >>> 24;
hold >>>= op;
bits -= op;
op = (here >>> 16) & 0xff;
if (op & 16) {
dist = here & 0xffff;
op &= 15;
if (bits < op) {
hold += input[_in++] << bits;
bits += 8;
if (bits < op) {
hold += input[_in++] << bits;
bits += 8;
}
}
dist += hold & ((1 << op) - 1);
if (dist > dmax) {
strm.msg = 'invalid distance too far back';
state.mode = BAD;
break top;
}
hold >>>= op;
bits -= op;
op = _out - beg;
if (dist > op) {
op = dist - op;
if (op > whave) {
if (state.sane) {
strm.msg = 'invalid distance too far back';
state.mode = BAD;
break top;
}
}
from = 0;
from_source = s_window;
if (wnext === 0) {
from += wsize - op;
if (op < len) {
len -= op;
do {
output[_out++] = s_window[from++];
} while (--op);
from = _out - dist;
from_source = output;
}
}
else if (wnext < op) {
from += wsize + wnext - op;
op -= wnext;
if (op < len) {
len -= op;
do {
output[_out++] = s_window[from++];
} while (--op);
from = 0;
if (wnext < len) {
op = wnext;
len -= op;
do {
output[_out++] = s_window[from++];
} while (--op);
from = _out - dist;
from_source = output;
}
}
}
else {
from += wnext - op;
if (op < len) {
len -= op;
do {
output[_out++] = s_window[from++];
} while (--op);
from = _out - dist;
from_source = output;
}
}
while (len > 2) {
output[_out++] = from_source[from++];
output[_out++] = from_source[from++];
output[_out++] = from_source[from++];
len -= 3;
}
if (len) {
output[_out++] = from_source[from++];
if (len > 1) {
output[_out++] = from_source[from++];
}
}
}
else {
from = _out - dist;
do {
output[_out++] = output[from++];
output[_out++] = output[from++];
output[_out++] = output[from++];
len -= 3;
} while (len > 2);
if (len) {
output[_out++] = output[from++];
if (len > 1) {
output[_out++] = output[from++];
}
}
}
}
else if ((op & 64) === 0) {
here = dcode[(here & 0xffff) + (hold & ((1 << op) - 1))];
continue dodist;
}
else {
strm.msg = 'invalid distance code';
state.mode = BAD;
break top;
}
break;
}
}
else if ((op & 64) === 0) {
here = lcode[(here & 0xffff) + (hold & ((1 << op) - 1))];
continue dolen;
}
else if (op & 32) {
state.mode = TYPE;
break top;
}
else {
strm.msg = 'invalid literal/length code';
state.mode = BAD;
break top;
}
break;
}
} while (_in < last && _out < end);
len = bits >> 3;
_in -= len;
bits -= len << 3;
hold &= (1 << bits) - 1;
strm.next_in = _in;
strm.next_out = _out;
strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
state.hold = hold;
state.bits = bits;
return;
};
},{}],40:[function(_dereq_,module,exports){
'use strict';
var utils         = _dereq_('../utils/common');
var adler32       = _dereq_('./adler32');
var crc32         = _dereq_('./crc32');
var inflate_fast  = _dereq_('./inffast');
var inflate_table = _dereq_('./inftrees');
var CODES = 0;
var LENS = 1;
var DISTS = 2;
var Z_FINISH        = 4;
var Z_BLOCK         = 5;
var Z_TREES         = 6;
var Z_OK            = 0;
var Z_STREAM_END    = 1;
var Z_NEED_DICT     = 2;
var Z_STREAM_ERROR  = -2;
var Z_DATA_ERROR    = -3;
var Z_MEM_ERROR     = -4;
var Z_BUF_ERROR     = -5;
var Z_DEFLATED  = 8;
var    HEAD = 1;
var    FLAGS = 2;
var    TIME = 3;
var    OS = 4;
var    EXLEN = 5;
var    EXTRA = 6;
var    NAME = 7;
var    COMMENT = 8;
var    HCRC = 9;
var    DICTID = 10;
var    DICT = 11;
var        TYPE = 12;
var        TYPEDO = 13;
var        STORED = 14;
var        COPY_ = 15;
var        COPY = 16;
var        TABLE = 17;
var        LENLENS = 18;
var        CODELENS = 19;
var            LEN_ = 20;
var            LEN = 21;
var            LENEXT = 22;
var            DIST = 23;
var            DISTEXT = 24;
var            MATCH = 25;
var            LIT = 26;
var    CHECK = 27;
var    LENGTH = 28;
var    DONE = 29;
var    BAD = 30;
var    MEM = 31;
var    SYNC = 32;
var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
var MAX_WBITS = 15;
var DEF_WBITS = MAX_WBITS;
function zswap32(q) {
return  (((q >>> 24) & 0xff) +
((q >>> 8) & 0xff00) +
((q & 0xff00) << 8) +
((q & 0xff) << 24));
}
function InflateState() {
this.mode = 0;
this.last = false;
this.wrap = 0;
this.havedict = false;
this.flags = 0;
this.dmax = 0;
this.check = 0;
this.total = 0;
this.head = null;
this.wbits = 0;
this.wsize = 0;
this.whave = 0;
this.wnext = 0;
this.window = null;
this.hold = 0;
this.bits = 0;
this.length = 0;
this.offset = 0;
this.extra = 0;
this.lencode = null;
this.distcode = null;
this.lenbits = 0;
this.distbits = 0;
this.ncode = 0;
this.nlen = 0;
this.ndist = 0;
this.have = 0;
this.next = null;
this.lens = new utils.Buf16(320);
this.work = new utils.Buf16(288);
this.lendyn = null;
this.distdyn = null;
this.sane = 0;
this.back = 0;
this.was = 0;
}
function inflateResetKeep(strm) {
var state;
if (!strm || !strm.state) { return Z_STREAM_ERROR; }
state = strm.state;
strm.total_in = strm.total_out = state.total = 0;
strm.msg = '';
if (state.wrap) {
strm.adler = state.wrap & 1;
}
state.mode = HEAD;
state.last = 0;
state.havedict = 0;
state.dmax = 32768;
state.head = null;
state.hold = 0;
state.bits = 0;
state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);
state.sane = 1;
state.back = -1;
return Z_OK;
}
function inflateReset(strm) {
var state;
if (!strm || !strm.state) { return Z_STREAM_ERROR; }
state = strm.state;
state.wsize = 0;
state.whave = 0;
state.wnext = 0;
return inflateResetKeep(strm);
}
function inflateReset2(strm, windowBits) {
var wrap;
var state;
if (!strm || !strm.state) { return Z_STREAM_ERROR; }
state = strm.state;
if (windowBits < 0) {
wrap = 0;
windowBits = -windowBits;
}
else {
wrap = (windowBits >> 4) + 1;
if (windowBits < 48) {
windowBits &= 15;
}
}
if (windowBits && (windowBits < 8 || windowBits > 15)) {
return Z_STREAM_ERROR;
}
if (state.window !== null && state.wbits !== windowBits) {
state.window = null;
}
state.wrap = wrap;
state.wbits = windowBits;
return inflateReset(strm);
}
function inflateInit2(strm, windowBits) {
var ret;
var state;
if (!strm) { return Z_STREAM_ERROR; }
state = new InflateState();
strm.state = state;
state.window = null;
ret = inflateReset2(strm, windowBits);
if (ret !== Z_OK) {
strm.state = null;
}
return ret;
}
function inflateInit(strm) {
return inflateInit2(strm, DEF_WBITS);
}
var virgin = true;
var lenfix, distfix;
function fixedtables(state) {
if (virgin) {
var sym;
lenfix = new utils.Buf32(512);
distfix = new utils.Buf32(32);
sym = 0;
while (sym < 144) { state.lens[sym++] = 8; }
while (sym < 256) { state.lens[sym++] = 9; }
while (sym < 280) { state.lens[sym++] = 7; }
while (sym < 288) { state.lens[sym++] = 8; }
inflate_table(LENS,  state.lens, 0, 288, lenfix,   0, state.work, { bits: 9 });
sym = 0;
while (sym < 32) { state.lens[sym++] = 5; }
inflate_table(DISTS, state.lens, 0, 32,   distfix, 0, state.work, { bits: 5 });
virgin = false;
}
state.lencode = lenfix;
state.lenbits = 9;
state.distcode = distfix;
state.distbits = 5;
}
function updatewindow(strm, src, end, copy) {
var dist;
var state = strm.state;
if (state.window === null) {
state.wsize = 1 << state.wbits;
state.wnext = 0;
state.whave = 0;
state.window = new utils.Buf8(state.wsize);
}
if (copy >= state.wsize) {
utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
state.wnext = 0;
state.whave = state.wsize;
}
else {
dist = state.wsize - state.wnext;
if (dist > copy) {
dist = copy;
}
utils.arraySet(state.window, src, end - copy, dist, state.wnext);
copy -= dist;
if (copy) {
utils.arraySet(state.window, src, end - copy, copy, 0);
state.wnext = copy;
state.whave = state.wsize;
}
else {
state.wnext += dist;
if (state.wnext === state.wsize) { state.wnext = 0; }
if (state.whave < state.wsize) { state.whave += dist; }
}
}
return 0;
}
function inflate(strm, flush) {
var state;
var input, output;
var next;
var put;
var have, left;
var hold;
var bits;
var _in, _out;
var copy;
var from;
var from_source;
var here = 0;
var here_bits, here_op, here_val;
var last_bits, last_op, last_val;
var len;
var ret;
var hbuf = new utils.Buf8(4);
var opts;
var n;
var order =
[ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ];
if (!strm || !strm.state || !strm.output ||
(!strm.input && strm.avail_in !== 0)) {
return Z_STREAM_ERROR;
}
state = strm.state;
if (state.mode === TYPE) { state.mode = TYPEDO; }
put = strm.next_out;
output = strm.output;
left = strm.avail_out;
next = strm.next_in;
input = strm.input;
have = strm.avail_in;
hold = state.hold;
bits = state.bits;
_in = have;
_out = left;
ret = Z_OK;
inf_leave:
for (;;) {
switch (state.mode) {
case HEAD:
if (state.wrap === 0) {
state.mode = TYPEDO;
break;
}
while (bits < 16) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
if ((state.wrap & 2) && hold === 0x8b1f) {
state.check = 0;
hbuf[0] = hold & 0xff;
hbuf[1] = (hold >>> 8) & 0xff;
state.check = crc32(state.check, hbuf, 2, 0);
hold = 0;
bits = 0;
state.mode = FLAGS;
break;
}
state.flags = 0;
if (state.head) {
state.head.done = false;
}
if (!(state.wrap & 1) ||
(((hold & 0xff) << 8) + (hold >> 8)) % 31) {
strm.msg = 'incorrect header check';
state.mode = BAD;
break;
}
if ((hold & 0x0f) !== Z_DEFLATED) {
strm.msg = 'unknown compression method';
state.mode = BAD;
break;
}
hold >>>= 4;
bits -= 4;
len = (hold & 0x0f) + 8;
if (state.wbits === 0) {
state.wbits = len;
}
else if (len > state.wbits) {
strm.msg = 'invalid window size';
state.mode = BAD;
break;
}
state.dmax = 1 << len;
strm.adler = state.check = 1;
state.mode = hold & 0x200 ? DICTID : TYPE;
hold = 0;
bits = 0;
break;
case FLAGS:
while (bits < 16) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
state.flags = hold;
if ((state.flags & 0xff) !== Z_DEFLATED) {
strm.msg = 'unknown compression method';
state.mode = BAD;
break;
}
if (state.flags & 0xe000) {
strm.msg = 'unknown header flags set';
state.mode = BAD;
break;
}
if (state.head) {
state.head.text = ((hold >> 8) & 1);
}
if (state.flags & 0x0200) {
hbuf[0] = hold & 0xff;
hbuf[1] = (hold >>> 8) & 0xff;
state.check = crc32(state.check, hbuf, 2, 0);
}
hold = 0;
bits = 0;
state.mode = TIME;
case TIME:
while (bits < 32) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
if (state.head) {
state.head.time = hold;
}
if (state.flags & 0x0200) {
hbuf[0] = hold & 0xff;
hbuf[1] = (hold >>> 8) & 0xff;
hbuf[2] = (hold >>> 16) & 0xff;
hbuf[3] = (hold >>> 24) & 0xff;
state.check = crc32(state.check, hbuf, 4, 0);
}
hold = 0;
bits = 0;
state.mode = OS;
case OS:
while (bits < 16) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
if (state.head) {
state.head.xflags = (hold & 0xff);
state.head.os = (hold >> 8);
}
if (state.flags & 0x0200) {
hbuf[0] = hold & 0xff;
hbuf[1] = (hold >>> 8) & 0xff;
state.check = crc32(state.check, hbuf, 2, 0);
}
hold = 0;
bits = 0;
state.mode = EXLEN;
case EXLEN:
if (state.flags & 0x0400) {
while (bits < 16) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
state.length = hold;
if (state.head) {
state.head.extra_len = hold;
}
if (state.flags & 0x0200) {
hbuf[0] = hold & 0xff;
hbuf[1] = (hold >>> 8) & 0xff;
state.check = crc32(state.check, hbuf, 2, 0);
}
hold = 0;
bits = 0;
}
else if (state.head) {
state.head.extra = null;
}
state.mode = EXTRA;
case EXTRA:
if (state.flags & 0x0400) {
copy = state.length;
if (copy > have) { copy = have; }
if (copy) {
if (state.head) {
len = state.head.extra_len - state.length;
if (!state.head.extra) {
state.head.extra = new Array(state.head.extra_len);
}
utils.arraySet(
state.head.extra,
input,
next,
copy,
len
);
}
if (state.flags & 0x0200) {
state.check = crc32(state.check, input, copy, next);
}
have -= copy;
next += copy;
state.length -= copy;
}
if (state.length) { break inf_leave; }
}
state.length = 0;
state.mode = NAME;
case NAME:
if (state.flags & 0x0800) {
if (have === 0) { break inf_leave; }
copy = 0;
do {
len = input[next + copy++];
if (state.head && len &&
(state.length < 65536 )) {
state.head.name += String.fromCharCode(len);
}
} while (len && copy < have);
if (state.flags & 0x0200) {
state.check = crc32(state.check, input, copy, next);
}
have -= copy;
next += copy;
if (len) { break inf_leave; }
}
else if (state.head) {
state.head.name = null;
}
state.length = 0;
state.mode = COMMENT;
case COMMENT:
if (state.flags & 0x1000) {
if (have === 0) { break inf_leave; }
copy = 0;
do {
len = input[next + copy++];
if (state.head && len &&
(state.length < 65536 )) {
state.head.comment += String.fromCharCode(len);
}
} while (len && copy < have);
if (state.flags & 0x0200) {
state.check = crc32(state.check, input, copy, next);
}
have -= copy;
next += copy;
if (len) { break inf_leave; }
}
else if (state.head) {
state.head.comment = null;
}
state.mode = HCRC;
case HCRC:
if (state.flags & 0x0200) {
while (bits < 16) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
if (hold !== (state.check & 0xffff)) {
strm.msg = 'header crc mismatch';
state.mode = BAD;
break;
}
hold = 0;
bits = 0;
}
if (state.head) {
state.head.hcrc = ((state.flags >> 9) & 1);
state.head.done = true;
}
strm.adler = state.check = 0;
state.mode = TYPE;
break;
case DICTID:
while (bits < 32) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
strm.adler = state.check = zswap32(hold);
hold = 0;
bits = 0;
state.mode = DICT;
case DICT:
if (state.havedict === 0) {
strm.next_out = put;
strm.avail_out = left;
strm.next_in = next;
strm.avail_in = have;
state.hold = hold;
state.bits = bits;
return Z_NEED_DICT;
}
strm.adler = state.check = 1;
state.mode = TYPE;
case TYPE:
if (flush === Z_BLOCK || flush === Z_TREES) { break inf_leave; }
case TYPEDO:
if (state.last) {
hold >>>= bits & 7;
bits -= bits & 7;
state.mode = CHECK;
break;
}
while (bits < 3) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
state.last = (hold & 0x01);
hold >>>= 1;
bits -= 1;
switch ((hold & 0x03)) {
case 0:
state.mode = STORED;
break;
case 1:
fixedtables(state);
state.mode = LEN_;
if (flush === Z_TREES) {
hold >>>= 2;
bits -= 2;
break inf_leave;
}
break;
case 2:
state.mode = TABLE;
break;
case 3:
strm.msg = 'invalid block type';
state.mode = BAD;
}
hold >>>= 2;
bits -= 2;
break;
case STORED:
hold >>>= bits & 7;
bits -= bits & 7;
while (bits < 32) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
strm.msg = 'invalid stored block lengths';
state.mode = BAD;
break;
}
state.length = hold & 0xffff;
hold = 0;
bits = 0;
state.mode = COPY_;
if (flush === Z_TREES) { break inf_leave; }
case COPY_:
state.mode = COPY;
case COPY:
copy = state.length;
if (copy) {
if (copy > have) { copy = have; }
if (copy > left) { copy = left; }
if (copy === 0) { break inf_leave; }
utils.arraySet(output, input, next, copy, put);
have -= copy;
next += copy;
left -= copy;
put += copy;
state.length -= copy;
break;
}
state.mode = TYPE;
break;
case TABLE:
while (bits < 14) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
state.nlen = (hold & 0x1f) + 257;
hold >>>= 5;
bits -= 5;
state.ndist = (hold & 0x1f) + 1;
hold >>>= 5;
bits -= 5;
state.ncode = (hold & 0x0f) + 4;
hold >>>= 4;
bits -= 4;
if (state.nlen > 286 || state.ndist > 30) {
strm.msg = 'too many length or distance symbols';
state.mode = BAD;
break;
}
state.have = 0;
state.mode = LENLENS;
case LENLENS:
while (state.have < state.ncode) {
while (bits < 3) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
state.lens[order[state.have++]] = (hold & 0x07);
hold >>>= 3;
bits -= 3;
}
while (state.have < 19) {
state.lens[order[state.have++]] = 0;
}
state.lencode = state.lendyn;
state.lenbits = 7;
opts = { bits: state.lenbits };
ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
state.lenbits = opts.bits;
if (ret) {
strm.msg = 'invalid code lengths set';
state.mode = BAD;
break;
}
state.have = 0;
state.mode = CODELENS;
case CODELENS:
while (state.have < state.nlen + state.ndist) {
for (;;) {
here = state.lencode[hold & ((1 << state.lenbits) - 1)];
here_bits = here >>> 24;
here_op = (here >>> 16) & 0xff;
here_val = here & 0xffff;
if ((here_bits) <= bits) { break; }
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
if (here_val < 16) {
hold >>>= here_bits;
bits -= here_bits;
state.lens[state.have++] = here_val;
}
else {
if (here_val === 16) {
n = here_bits + 2;
while (bits < n) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
hold >>>= here_bits;
bits -= here_bits;
if (state.have === 0) {
strm.msg = 'invalid bit length repeat';
state.mode = BAD;
break;
}
len = state.lens[state.have - 1];
copy = 3 + (hold & 0x03);
hold >>>= 2;
bits -= 2;
}
else if (here_val === 17) {
n = here_bits + 3;
while (bits < n) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
hold >>>= here_bits;
bits -= here_bits;
len = 0;
copy = 3 + (hold & 0x07);
hold >>>= 3;
bits -= 3;
}
else {
n = here_bits + 7;
while (bits < n) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
hold >>>= here_bits;
bits -= here_bits;
len = 0;
copy = 11 + (hold & 0x7f);
hold >>>= 7;
bits -= 7;
}
if (state.have + copy > state.nlen + state.ndist) {
strm.msg = 'invalid bit length repeat';
state.mode = BAD;
break;
}
while (copy--) {
state.lens[state.have++] = len;
}
}
}
if (state.mode === BAD) { break; }
if (state.lens[256] === 0) {
strm.msg = 'invalid code -- missing end-of-block';
state.mode = BAD;
break;
}
state.lenbits = 9;
opts = { bits: state.lenbits };
ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
state.lenbits = opts.bits;
if (ret) {
strm.msg = 'invalid literal/lengths set';
state.mode = BAD;
break;
}
state.distbits = 6;
state.distcode = state.distdyn;
opts = { bits: state.distbits };
ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
state.distbits = opts.bits;
if (ret) {
strm.msg = 'invalid distances set';
state.mode = BAD;
break;
}
state.mode = LEN_;
if (flush === Z_TREES) { break inf_leave; }
case LEN_:
state.mode = LEN;
case LEN:
if (have >= 6 && left >= 258) {
strm.next_out = put;
strm.avail_out = left;
strm.next_in = next;
strm.avail_in = have;
state.hold = hold;
state.bits = bits;
inflate_fast(strm, _out);
put = strm.next_out;
output = strm.output;
left = strm.avail_out;
next = strm.next_in;
input = strm.input;
have = strm.avail_in;
hold = state.hold;
bits = state.bits;
if (state.mode === TYPE) {
state.back = -1;
}
break;
}
state.back = 0;
for (;;) {
here = state.lencode[hold & ((1 << state.lenbits) - 1)];
here_bits = here >>> 24;
here_op = (here >>> 16) & 0xff;
here_val = here & 0xffff;
if (here_bits <= bits) { break; }
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
if (here_op && (here_op & 0xf0) === 0) {
last_bits = here_bits;
last_op = here_op;
last_val = here_val;
for (;;) {
here = state.lencode[last_val +
((hold & ((1 << (last_bits + last_op)) - 1)) >> last_bits)];
here_bits = here >>> 24;
here_op = (here >>> 16) & 0xff;
here_val = here & 0xffff;
if ((last_bits + here_bits) <= bits) { break; }
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
hold >>>= last_bits;
bits -= last_bits;
state.back += last_bits;
}
hold >>>= here_bits;
bits -= here_bits;
state.back += here_bits;
state.length = here_val;
if (here_op === 0) {
state.mode = LIT;
break;
}
if (here_op & 32) {
state.back = -1;
state.mode = TYPE;
break;
}
if (here_op & 64) {
strm.msg = 'invalid literal/length code';
state.mode = BAD;
break;
}
state.extra = here_op & 15;
state.mode = LENEXT;
case LENEXT:
if (state.extra) {
n = state.extra;
while (bits < n) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
state.length += hold & ((1 << state.extra) - 1);
hold >>>= state.extra;
bits -= state.extra;
state.back += state.extra;
}
state.was = state.length;
state.mode = DIST;
case DIST:
for (;;) {
here = state.distcode[hold & ((1 << state.distbits) - 1)];
here_bits = here >>> 24;
here_op = (here >>> 16) & 0xff;
here_val = here & 0xffff;
if ((here_bits) <= bits) { break; }
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
if ((here_op & 0xf0) === 0) {
last_bits = here_bits;
last_op = here_op;
last_val = here_val;
for (;;) {
here = state.distcode[last_val +
((hold & ((1 << (last_bits + last_op)) - 1)) >> last_bits)];
here_bits = here >>> 24;
here_op = (here >>> 16) & 0xff;
here_val = here & 0xffff;
if ((last_bits + here_bits) <= bits) { break; }
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
hold >>>= last_bits;
bits -= last_bits;
state.back += last_bits;
}
hold >>>= here_bits;
bits -= here_bits;
state.back += here_bits;
if (here_op & 64) {
strm.msg = 'invalid distance code';
state.mode = BAD;
break;
}
state.offset = here_val;
state.extra = (here_op) & 15;
state.mode = DISTEXT;
case DISTEXT:
if (state.extra) {
n = state.extra;
while (bits < n) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
state.offset += hold & ((1 << state.extra) - 1);
hold >>>= state.extra;
bits -= state.extra;
state.back += state.extra;
}
if (state.offset > state.dmax) {
strm.msg = 'invalid distance too far back';
state.mode = BAD;
break;
}
state.mode = MATCH;
case MATCH:
if (left === 0) { break inf_leave; }
copy = _out - left;
if (state.offset > copy) {
copy = state.offset - copy;
if (copy > state.whave) {
if (state.sane) {
strm.msg = 'invalid distance too far back';
state.mode = BAD;
break;
}
}
if (copy > state.wnext) {
copy -= state.wnext;
from = state.wsize - copy;
}
else {
from = state.wnext - copy;
}
if (copy > state.length) { copy = state.length; }
from_source = state.window;
}
else {
from_source = output;
from = put - state.offset;
copy = state.length;
}
if (copy > left) { copy = left; }
left -= copy;
state.length -= copy;
do {
output[put++] = from_source[from++];
} while (--copy);
if (state.length === 0) { state.mode = LEN; }
break;
case LIT:
if (left === 0) { break inf_leave; }
output[put++] = state.length;
left--;
state.mode = LEN;
break;
case CHECK:
if (state.wrap) {
while (bits < 32) {
if (have === 0) { break inf_leave; }
have--;
hold |= input[next++] << bits;
bits += 8;
}
_out -= left;
strm.total_out += _out;
state.total += _out;
if (_out) {
strm.adler = state.check =
(state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));
}
_out = left;
if ((state.flags ? hold : zswap32(hold)) !== state.check) {
strm.msg = 'incorrect data check';
state.mode = BAD;
break;
}
hold = 0;
bits = 0;
}
state.mode = LENGTH;
case LENGTH:
if (state.wrap && state.flags) {
while (bits < 32) {
if (have === 0) { break inf_leave; }
have--;
hold += input[next++] << bits;
bits += 8;
}
if (hold !== (state.total & 0xffffffff)) {
strm.msg = 'incorrect length check';
state.mode = BAD;
break;
}
hold = 0;
bits = 0;
}
state.mode = DONE;
case DONE:
ret = Z_STREAM_END;
break inf_leave;
case BAD:
ret = Z_DATA_ERROR;
break inf_leave;
case MEM:
return Z_MEM_ERROR;
case SYNC:
default:
return Z_STREAM_ERROR;
}
}
strm.next_out = put;
strm.avail_out = left;
strm.next_in = next;
strm.avail_in = have;
state.hold = hold;
state.bits = bits;
if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
(state.mode < CHECK || flush !== Z_FINISH))) {
if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
state.mode = MEM;
return Z_MEM_ERROR;
}
}
_in -= strm.avail_in;
_out -= strm.avail_out;
strm.total_in += _in;
strm.total_out += _out;
state.total += _out;
if (state.wrap && _out) {
strm.adler = state.check =
(state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));
}
strm.data_type = state.bits + (state.last ? 64 : 0) +
(state.mode === TYPE ? 128 : 0) +
(state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {
ret = Z_BUF_ERROR;
}
return ret;
}
function inflateEnd(strm) {
if (!strm || !strm.state ) {
return Z_STREAM_ERROR;
}
var state = strm.state;
if (state.window) {
state.window = null;
}
strm.state = null;
return Z_OK;
}
function inflateGetHeader(strm, head) {
var state;
if (!strm || !strm.state) { return Z_STREAM_ERROR; }
state = strm.state;
if ((state.wrap & 2) === 0) { return Z_STREAM_ERROR; }
state.head = head;
head.done = false;
return Z_OK;
}
function inflateSetDictionary(strm, dictionary) {
var dictLength = dictionary.length;
var state;
var dictid;
var ret;
if (!strm  || !strm.state ) { return Z_STREAM_ERROR; }
state = strm.state;
if (state.wrap !== 0 && state.mode !== DICT) {
return Z_STREAM_ERROR;
}
if (state.mode === DICT) {
dictid = 1;
dictid = adler32(dictid, dictionary, dictLength, 0);
if (dictid !== state.check) {
return Z_DATA_ERROR;
}
}
ret = updatewindow(strm, dictionary, dictLength, dictLength);
if (ret) {
state.mode = MEM;
return Z_MEM_ERROR;
}
state.havedict = 1;
return Z_OK;
}
exports.inflateReset = inflateReset;
exports.inflateReset2 = inflateReset2;
exports.inflateResetKeep = inflateResetKeep;
exports.inflateInit = inflateInit;
exports.inflateInit2 = inflateInit2;
exports.inflate = inflate;
exports.inflateEnd = inflateEnd;
exports.inflateGetHeader = inflateGetHeader;
exports.inflateSetDictionary = inflateSetDictionary;
exports.inflateInfo = 'pako inflate (from Nodeca project)';
},{"../utils/common":32,"./adler32":34,"./crc32":36,"./inffast":39,"./inftrees":41}],41:[function(_dereq_,module,exports){
'use strict';
var utils = _dereq_('../utils/common');
var MAXBITS = 15;
var ENOUGH_LENS = 852;
var ENOUGH_DISTS = 592;
var CODES = 0;
var LENS = 1;
var DISTS = 2;
var lbase = [
3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
];
var lext = [
16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
];
var dbase = [
1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
8193, 12289, 16385, 24577, 0, 0
];
var dext = [
16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
28, 28, 29, 29, 64, 64
];
module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts)
{
var bits = opts.bits;
var len = 0;
var sym = 0;
var min = 0, max = 0;
var root = 0;
var curr = 0;
var drop = 0;
var left = 0;
var used = 0;
var huff = 0;
var incr;
var fill;
var low;
var mask;
var next;
var base = null;
var base_index = 0;
var end;
var count = new utils.Buf16(MAXBITS + 1);
var offs = new utils.Buf16(MAXBITS + 1);
var extra = null;
var extra_index = 0;
var here_bits, here_op, here_val;
for (len = 0; len <= MAXBITS; len++) {
count[len] = 0;
}
for (sym = 0; sym < codes; sym++) {
count[lens[lens_index + sym]]++;
}
root = bits;
for (max = MAXBITS; max >= 1; max--) {
if (count[max] !== 0) { break; }
}
if (root > max) {
root = max;
}
if (max === 0) {
table[table_index++] = (1 << 24) | (64 << 16) | 0;
table[table_index++] = (1 << 24) | (64 << 16) | 0;
opts.bits = 1;
return 0;
}
for (min = 1; min < max; min++) {
if (count[min] !== 0) { break; }
}
if (root < min) {
root = min;
}
left = 1;
for (len = 1; len <= MAXBITS; len++) {
left <<= 1;
left -= count[len];
if (left < 0) {
return -1;
}
}
if (left > 0 && (type === CODES || max !== 1)) {
return -1;
}
offs[1] = 0;
for (len = 1; len < MAXBITS; len++) {
offs[len + 1] = offs[len] + count[len];
}
for (sym = 0; sym < codes; sym++) {
if (lens[lens_index + sym] !== 0) {
work[offs[lens[lens_index + sym]]++] = sym;
}
}
if (type === CODES) {
base = extra = work;
end = 19;
} else if (type === LENS) {
base = lbase;
base_index -= 257;
extra = lext;
extra_index -= 257;
end = 256;
} else {
base = dbase;
extra = dext;
end = -1;
}
huff = 0;
sym = 0;
len = min;
next = table_index;
curr = root;
drop = 0;
low = -1;
used = 1 << root;
mask = used - 1;
if ((type === LENS && used > ENOUGH_LENS) ||
(type === DISTS && used > ENOUGH_DISTS)) {
return 1;
}
var i = 0;
for (;;) {
i++;
here_bits = len - drop;
if (work[sym] < end) {
here_op = 0;
here_val = work[sym];
}
else if (work[sym] > end) {
here_op = extra[extra_index + work[sym]];
here_val = base[base_index + work[sym]];
}
else {
here_op = 32 + 64;
here_val = 0;
}
incr = 1 << (len - drop);
fill = 1 << curr;
min = fill;
do {
fill -= incr;
table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val |0;
} while (fill !== 0);
incr = 1 << (len - 1);
while (huff & incr) {
incr >>= 1;
}
if (incr !== 0) {
huff &= incr - 1;
huff += incr;
} else {
huff = 0;
}
sym++;
if (--count[len] === 0) {
if (len === max) { break; }
len = lens[lens_index + work[sym]];
}
if (len > root && (huff & mask) !== low) {
if (drop === 0) {
drop = root;
}
next += min;
curr = len - drop;
left = 1 << curr;
while (curr + drop < max) {
left -= count[curr + drop];
if (left <= 0) { break; }
curr++;
left <<= 1;
}
used += 1 << curr;
if ((type === LENS && used > ENOUGH_LENS) ||
(type === DISTS && used > ENOUGH_DISTS)) {
return 1;
}
low = huff & mask;
table[low] = (root << 24) | (curr << 16) | (next - table_index) |0;
}
}
if (huff !== 0) {
table[next + huff] = ((len - drop) << 24) | (64 << 16) |0;
}
opts.bits = root;
return 0;
};
},{"../utils/common":32}],42:[function(_dereq_,module,exports){
'use strict';
module.exports = {
2:      'need dictionary',
1:      'stream end',
0:      '',
'-1':   'file error',
'-2':   'stream error',
'-3':   'data error',
'-4':   'insufficient memory',
'-5':   'buffer error',
'-6':   'incompatible version'
};
},{}],43:[function(_dereq_,module,exports){
'use strict';
var utils = _dereq_('../utils/common');
var Z_FIXED               = 4;
var Z_BINARY              = 0;
var Z_TEXT                = 1;
var Z_UNKNOWN             = 2;
function zero(buf) { var len = buf.length; while (--len >= 0) { buf[len] = 0; } }
var STORED_BLOCK = 0;
var STATIC_TREES = 1;
var DYN_TREES    = 2;
var MIN_MATCH    = 3;
var MAX_MATCH    = 258;
var LENGTH_CODES  = 29;
var LITERALS      = 256;
var L_CODES       = LITERALS + 1 + LENGTH_CODES;
var D_CODES       = 30;
var BL_CODES      = 19;
var HEAP_SIZE     = 2 * L_CODES + 1;
var MAX_BITS      = 15;
var Buf_size      = 16;
var MAX_BL_BITS = 7;
var END_BLOCK   = 256;
var REP_3_6     = 16;
var REPZ_3_10   = 17;
var REPZ_11_138 = 18;
var extra_lbits =
[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
var extra_dbits =
[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
var extra_blbits =
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7];
var bl_order =
[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
var DIST_CODE_LEN = 512;
var static_ltree  = new Array((L_CODES + 2) * 2);
zero(static_ltree);
var static_dtree  = new Array(D_CODES * 2);
zero(static_dtree);
var _dist_code    = new Array(DIST_CODE_LEN);
zero(_dist_code);
var _length_code  = new Array(MAX_MATCH - MIN_MATCH + 1);
zero(_length_code);
var base_length   = new Array(LENGTH_CODES);
zero(base_length);
var base_dist     = new Array(D_CODES);
zero(base_dist);
function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
this.static_tree  = static_tree;
this.extra_bits   = extra_bits;
this.extra_base   = extra_base;
this.elems        = elems;
this.max_length   = max_length;
this.has_stree    = static_tree && static_tree.length;
}
var static_l_desc;
var static_d_desc;
var static_bl_desc;
function TreeDesc(dyn_tree, stat_desc) {
this.dyn_tree = dyn_tree;
this.max_code = 0;
this.stat_desc = stat_desc;
}
function d_code(dist) {
return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
}
function put_short(s, w) {
s.pending_buf[s.pending++] = (w) & 0xff;
s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
}
function send_bits(s, value, length) {
if (s.bi_valid > (Buf_size - length)) {
s.bi_buf |= (value << s.bi_valid) & 0xffff;
put_short(s, s.bi_buf);
s.bi_buf = value >> (Buf_size - s.bi_valid);
s.bi_valid += length - Buf_size;
} else {
s.bi_buf |= (value << s.bi_valid) & 0xffff;
s.bi_valid += length;
}
}
function send_code(s, c, tree) {
send_bits(s, tree[c * 2], tree[c * 2 + 1]);
}
function bi_reverse(code, len) {
var res = 0;
do {
res |= code & 1;
code >>>= 1;
res <<= 1;
} while (--len > 0);
return res >>> 1;
}
function bi_flush(s) {
if (s.bi_valid === 16) {
put_short(s, s.bi_buf);
s.bi_buf = 0;
s.bi_valid = 0;
} else if (s.bi_valid >= 8) {
s.pending_buf[s.pending++] = s.bi_buf & 0xff;
s.bi_buf >>= 8;
s.bi_valid -= 8;
}
}
function gen_bitlen(s, desc)
{
var tree            = desc.dyn_tree;
var max_code        = desc.max_code;
var stree           = desc.stat_desc.static_tree;
var has_stree       = desc.stat_desc.has_stree;
var extra           = desc.stat_desc.extra_bits;
var base            = desc.stat_desc.extra_base;
var max_length      = desc.stat_desc.max_length;
var h;
var n, m;
var bits;
var xbits;
var f;
var overflow = 0;
for (bits = 0; bits <= MAX_BITS; bits++) {
s.bl_count[bits] = 0;
}
tree[s.heap[s.heap_max] * 2 + 1] = 0;
for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
n = s.heap[h];
bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
if (bits > max_length) {
bits = max_length;
overflow++;
}
tree[n * 2 + 1] = bits;
if (n > max_code) { continue; }
s.bl_count[bits]++;
xbits = 0;
if (n >= base) {
xbits = extra[n - base];
}
f = tree[n * 2];
s.opt_len += f * (bits + xbits);
if (has_stree) {
s.static_len += f * (stree[n * 2 + 1] + xbits);
}
}
if (overflow === 0) { return; }
do {
bits = max_length - 1;
while (s.bl_count[bits] === 0) { bits--; }
s.bl_count[bits]--;
s.bl_count[bits + 1] += 2;
s.bl_count[max_length]--;
overflow -= 2;
} while (overflow > 0);
for (bits = max_length; bits !== 0; bits--) {
n = s.bl_count[bits];
while (n !== 0) {
m = s.heap[--h];
if (m > max_code) { continue; }
if (tree[m * 2 + 1] !== bits) {
s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
tree[m * 2 + 1] = bits;
}
n--;
}
}
}
function gen_codes(tree, max_code, bl_count)
{
var next_code = new Array(MAX_BITS + 1);
var code = 0;
var bits;
var n;
for (bits = 1; bits <= MAX_BITS; bits++) {
next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
}
for (n = 0;  n <= max_code; n++) {
var len = tree[n * 2 + 1];
if (len === 0) { continue; }
tree[n * 2] = bi_reverse(next_code[len]++, len);
}
}
function tr_static_init() {
var n;
var bits;
var length;
var code;
var dist;
var bl_count = new Array(MAX_BITS + 1);
length = 0;
for (code = 0; code < LENGTH_CODES - 1; code++) {
base_length[code] = length;
for (n = 0; n < (1 << extra_lbits[code]); n++) {
_length_code[length++] = code;
}
}
_length_code[length - 1] = code;
dist = 0;
for (code = 0; code < 16; code++) {
base_dist[code] = dist;
for (n = 0; n < (1 << extra_dbits[code]); n++) {
_dist_code[dist++] = code;
}
}
dist >>= 7;
for (; code < D_CODES; code++) {
base_dist[code] = dist << 7;
for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
_dist_code[256 + dist++] = code;
}
}
for (bits = 0; bits <= MAX_BITS; bits++) {
bl_count[bits] = 0;
}
n = 0;
while (n <= 143) {
static_ltree[n * 2 + 1] = 8;
n++;
bl_count[8]++;
}
while (n <= 255) {
static_ltree[n * 2 + 1] = 9;
n++;
bl_count[9]++;
}
while (n <= 279) {
static_ltree[n * 2 + 1] = 7;
n++;
bl_count[7]++;
}
while (n <= 287) {
static_ltree[n * 2 + 1] = 8;
n++;
bl_count[8]++;
}
gen_codes(static_ltree, L_CODES + 1, bl_count);
for (n = 0; n < D_CODES; n++) {
static_dtree[n * 2 + 1] = 5;
static_dtree[n * 2] = bi_reverse(n, 5);
}
static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0,          D_CODES, MAX_BITS);
static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0,         BL_CODES, MAX_BL_BITS);
}
function init_block(s) {
var n;
for (n = 0; n < L_CODES;  n++) { s.dyn_ltree[n * 2] = 0; }
for (n = 0; n < D_CODES;  n++) { s.dyn_dtree[n * 2] = 0; }
for (n = 0; n < BL_CODES; n++) { s.bl_tree[n * 2] = 0; }
s.dyn_ltree[END_BLOCK * 2] = 1;
s.opt_len = s.static_len = 0;
s.last_lit = s.matches = 0;
}
function bi_windup(s)
{
if (s.bi_valid > 8) {
put_short(s, s.bi_buf);
} else if (s.bi_valid > 0) {
s.pending_buf[s.pending++] = s.bi_buf;
}
s.bi_buf = 0;
s.bi_valid = 0;
}
function copy_block(s, buf, len, header)
{
bi_windup(s);
if (header) {
put_short(s, len);
put_short(s, ~len);
}
utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
s.pending += len;
}
function smaller(tree, n, m, depth) {
var _n2 = n * 2;
var _m2 = m * 2;
return (tree[_n2] < tree[_m2] ||
(tree[_n2] === tree[_m2] && depth[n] <= depth[m]));
}
function pqdownheap(s, tree, k)
{
var v = s.heap[k];
var j = k << 1;
while (j <= s.heap_len) {
if (j < s.heap_len &&
smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
j++;
}
if (smaller(tree, v, s.heap[j], s.depth)) { break; }
s.heap[k] = s.heap[j];
k = j;
j <<= 1;
}
s.heap[k] = v;
}
function compress_block(s, ltree, dtree)
{
var dist;
var lc;
var lx = 0;
var code;
var extra;
if (s.last_lit !== 0) {
do {
dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);
lc = s.pending_buf[s.l_buf + lx];
lx++;
if (dist === 0) {
send_code(s, lc, ltree);
} else {
code = _length_code[lc];
send_code(s, code + LITERALS + 1, ltree);
extra = extra_lbits[code];
if (extra !== 0) {
lc -= base_length[code];
send_bits(s, lc, extra);
}
dist--;
code = d_code(dist);
send_code(s, code, dtree);
extra = extra_dbits[code];
if (extra !== 0) {
dist -= base_dist[code];
send_bits(s, dist, extra);
}
}
} while (lx < s.last_lit);
}
send_code(s, END_BLOCK, ltree);
}
function build_tree(s, desc)
{
var tree     = desc.dyn_tree;
var stree    = desc.stat_desc.static_tree;
var has_stree = desc.stat_desc.has_stree;
var elems    = desc.stat_desc.elems;
var n, m;
var max_code = -1;
var node;
s.heap_len = 0;
s.heap_max = HEAP_SIZE;
for (n = 0; n < elems; n++) {
if (tree[n * 2] !== 0) {
s.heap[++s.heap_len] = max_code = n;
s.depth[n] = 0;
} else {
tree[n * 2 + 1] = 0;
}
}
while (s.heap_len < 2) {
node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
tree[node * 2] = 1;
s.depth[node] = 0;
s.opt_len--;
if (has_stree) {
s.static_len -= stree[node * 2 + 1];
}
}
desc.max_code = max_code;
for (n = (s.heap_len >> 1); n >= 1; n--) { pqdownheap(s, tree, n); }
node = elems;
do {
n = s.heap[1];
s.heap[1] = s.heap[s.heap_len--];
pqdownheap(s, tree, 1);
m = s.heap[1];
s.heap[--s.heap_max] = n;
s.heap[--s.heap_max] = m;
tree[node * 2] = tree[n * 2] + tree[m * 2];
s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
tree[n * 2 + 1] = tree[m * 2 + 1] = node;
s.heap[1] = node++;
pqdownheap(s, tree, 1);
} while (s.heap_len >= 2);
s.heap[--s.heap_max] = s.heap[1];
gen_bitlen(s, desc);
gen_codes(tree, max_code, s.bl_count);
}
function scan_tree(s, tree, max_code)
{
var n;
var prevlen = -1;
var curlen;
var nextlen = tree[0 * 2 + 1];
var count = 0;
var max_count = 7;
var min_count = 4;
if (nextlen === 0) {
max_count = 138;
min_count = 3;
}
tree[(max_code + 1) * 2 + 1] = 0xffff;
for (n = 0; n <= max_code; n++) {
curlen = nextlen;
nextlen = tree[(n + 1) * 2 + 1];
if (++count < max_count && curlen === nextlen) {
continue;
} else if (count < min_count) {
s.bl_tree[curlen * 2] += count;
} else if (curlen !== 0) {
if (curlen !== prevlen) { s.bl_tree[curlen * 2]++; }
s.bl_tree[REP_3_6 * 2]++;
} else if (count <= 10) {
s.bl_tree[REPZ_3_10 * 2]++;
} else {
s.bl_tree[REPZ_11_138 * 2]++;
}
count = 0;
prevlen = curlen;
if (nextlen === 0) {
max_count = 138;
min_count = 3;
} else if (curlen === nextlen) {
max_count = 6;
min_count = 3;
} else {
max_count = 7;
min_count = 4;
}
}
}
function send_tree(s, tree, max_code)
{
var n;
var prevlen = -1;
var curlen;
var nextlen = tree[0 * 2 + 1];
var count = 0;
var max_count = 7;
var min_count = 4;
if (nextlen === 0) {
max_count = 138;
min_count = 3;
}
for (n = 0; n <= max_code; n++) {
curlen = nextlen;
nextlen = tree[(n + 1) * 2 + 1];
if (++count < max_count && curlen === nextlen) {
continue;
} else if (count < min_count) {
do { send_code(s, curlen, s.bl_tree); } while (--count !== 0);
} else if (curlen !== 0) {
if (curlen !== prevlen) {
send_code(s, curlen, s.bl_tree);
count--;
}
send_code(s, REP_3_6, s.bl_tree);
send_bits(s, count - 3, 2);
} else if (count <= 10) {
send_code(s, REPZ_3_10, s.bl_tree);
send_bits(s, count - 3, 3);
} else {
send_code(s, REPZ_11_138, s.bl_tree);
send_bits(s, count - 11, 7);
}
count = 0;
prevlen = curlen;
if (nextlen === 0) {
max_count = 138;
min_count = 3;
} else if (curlen === nextlen) {
max_count = 6;
min_count = 3;
} else {
max_count = 7;
min_count = 4;
}
}
}
function build_bl_tree(s) {
var max_blindex;
scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
build_tree(s, s.bl_desc);
for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
break;
}
}
s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
return max_blindex;
}
function send_all_trees(s, lcodes, dcodes, blcodes)
{
var rank;
send_bits(s, lcodes - 257, 5);
send_bits(s, dcodes - 1,   5);
send_bits(s, blcodes - 4,  4);
for (rank = 0; rank < blcodes; rank++) {
send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
}
send_tree(s, s.dyn_ltree, lcodes - 1);
send_tree(s, s.dyn_dtree, dcodes - 1);
}
function detect_data_type(s) {
var black_mask = 0xf3ffc07f;
var n;
for (n = 0; n <= 31; n++, black_mask >>>= 1) {
if ((black_mask & 1) && (s.dyn_ltree[n * 2] !== 0)) {
return Z_BINARY;
}
}
if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 ||
s.dyn_ltree[13 * 2] !== 0) {
return Z_TEXT;
}
for (n = 32; n < LITERALS; n++) {
if (s.dyn_ltree[n * 2] !== 0) {
return Z_TEXT;
}
}
return Z_BINARY;
}
var static_init_done = false;
function _tr_init(s)
{
if (!static_init_done) {
tr_static_init();
static_init_done = true;
}
s.l_desc  = new TreeDesc(s.dyn_ltree, static_l_desc);
s.d_desc  = new TreeDesc(s.dyn_dtree, static_d_desc);
s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
s.bi_buf = 0;
s.bi_valid = 0;
init_block(s);
}
function _tr_stored_block(s, buf, stored_len, last)
{
send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
copy_block(s, buf, stored_len, true);
}
function _tr_align(s) {
send_bits(s, STATIC_TREES << 1, 3);
send_code(s, END_BLOCK, static_ltree);
bi_flush(s);
}
function _tr_flush_block(s, buf, stored_len, last)
{
var opt_lenb, static_lenb;
var max_blindex = 0;
if (s.level > 0) {
if (s.strm.data_type === Z_UNKNOWN) {
s.strm.data_type = detect_data_type(s);
}
build_tree(s, s.l_desc);
build_tree(s, s.d_desc);
max_blindex = build_bl_tree(s);
opt_lenb = (s.opt_len + 3 + 7) >>> 3;
static_lenb = (s.static_len + 3 + 7) >>> 3;
if (static_lenb <= opt_lenb) { opt_lenb = static_lenb; }
} else {
opt_lenb = static_lenb = stored_len + 5;
}
if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
_tr_stored_block(s, buf, stored_len, last);
} else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
compress_block(s, static_ltree, static_dtree);
} else {
send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
compress_block(s, s.dyn_ltree, s.dyn_dtree);
}
init_block(s);
if (last) {
bi_windup(s);
}
}
function _tr_tally(s, dist, lc)
{
s.pending_buf[s.d_buf + s.last_lit * 2]     = (dist >>> 8) & 0xff;
s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;
s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
s.last_lit++;
if (dist === 0) {
s.dyn_ltree[lc * 2]++;
} else {
s.matches++;
dist--;
s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
s.dyn_dtree[d_code(dist) * 2]++;
}
return (s.last_lit === s.lit_bufsize - 1);
}
exports._tr_init  = _tr_init;
exports._tr_stored_block = _tr_stored_block;
exports._tr_flush_block  = _tr_flush_block;
exports._tr_tally = _tr_tally;
exports._tr_align = _tr_align;
},{"../utils/common":32}],44:[function(_dereq_,module,exports){
'use strict';
function ZStream() {
this.input = null;
this.next_in = 0;
this.avail_in = 0;
this.total_in = 0;
this.output = null;
this.next_out = 0;
this.avail_out = 0;
this.total_out = 0;
this.msg = '';
this.state = null;
this.data_type = 2;
this.adler = 0;
}
module.exports = ZStream;
},{}],45:[function(_dereq_,module,exports){
var root = _dereq_('lodash._root');
var INFINITY = 1 / 0;
var symbolTag = '[object Symbol]';
var reUnescapedHtml = /[&<>"'`]/g,
reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
var htmlEscapes = {
'&': '&amp;',
'<': '&lt;',
'>': '&gt;',
'"': '&quot;',
"'": '&#39;',
'`': '&#96;'
};
function escapeHtmlChar(chr) {
return htmlEscapes[chr];
}
var objectProto = Object.prototype;
var objectToString = objectProto.toString;
var Symbol = root.Symbol;
var symbolProto = Symbol ? Symbol.prototype : undefined,
symbolToString = Symbol ? symbolProto.toString : undefined;
function isObjectLike(value) {
return !!value && typeof value == 'object';
}
function isSymbol(value) {
return typeof value == 'symbol' ||
(isObjectLike(value) && objectToString.call(value) == symbolTag);
}
function toString(value) {
if (typeof value == 'string') {
return value;
}
if (value == null) {
return '';
}
if (isSymbol(value)) {
return Symbol ? symbolToString.call(value) : '';
}
var result = (value + '');
return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}
function escape(string) {
string = toString(string);
return (string && reHasUnescapedHtml.test(string))
? string.replace(reUnescapedHtml, escapeHtmlChar)
: string;
}
module.exports = escape;
},{"lodash._root":46}],46:[function(_dereq_,module,exports){
(function (global){
var objectTypes = {
'function': true,
'object': true
};
var freeExports = (objectTypes[typeof exports] && exports && !exports.nodeType)
? exports
: undefined;
var freeModule = (objectTypes[typeof module] && module && !module.nodeType)
? module
: undefined;
var freeGlobal = checkGlobal(freeExports && freeModule && typeof global == 'object' && global);
var freeSelf = checkGlobal(objectTypes[typeof self] && self);
var freeWindow = checkGlobal(objectTypes[typeof window] && window);
var thisGlobal = checkGlobal(objectTypes[typeof this] && this);
var root = freeGlobal ||
((freeWindow !== (thisGlobal && thisGlobal.window)) && freeWindow) ||
freeSelf || thisGlobal || Function('return this')();
function checkGlobal(value) {
return (value && value.Object === Object) ? value : null;
}
module.exports = root;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],47:[function(_dereq_,module,exports){
var arrayCopy = _dereq_('lodash._arraycopy'),
arrayEach = _dereq_('lodash._arrayeach'),
createAssigner = _dereq_('lodash._createassigner'),
isArguments = _dereq_('lodash.isarguments'),
isArray = _dereq_('lodash.isarray'),
isPlainObject = _dereq_('lodash.isplainobject'),
isTypedArray = _dereq_('lodash.istypedarray'),
keys = _dereq_('lodash.keys'),
toPlainObject = _dereq_('lodash.toplainobject');
function isObjectLike(value) {
return !!value && typeof value == 'object';
}
var MAX_SAFE_INTEGER = 9007199254740991;
function baseMerge(object, source, customizer, stackA, stackB) {
if (!isObject(object)) {
return object;
}
var isSrcArr = isArrayLike(source) && (isArray(source) || isTypedArray(source)),
props = isSrcArr ? undefined : keys(source);
arrayEach(props || source, function(srcValue, key) {
if (props) {
key = srcValue;
srcValue = source[key];
}
if (isObjectLike(srcValue)) {
stackA || (stackA = []);
stackB || (stackB = []);
baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
}
else {
var value = object[key],
result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
isCommon = result === undefined;
if (isCommon) {
result = srcValue;
}
if ((result !== undefined || (isSrcArr && !(key in object))) &&
(isCommon || (result === result ? (result !== value) : (value === value)))) {
object[key] = result;
}
}
});
return object;
}
function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
var length = stackA.length,
srcValue = source[key];
while (length--) {
if (stackA[length] == srcValue) {
object[key] = stackB[length];
return;
}
}
var value = object[key],
result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
isCommon = result === undefined;
if (isCommon) {
result = srcValue;
if (isArrayLike(srcValue) && (isArray(srcValue) || isTypedArray(srcValue))) {
result = isArray(value)
? value
: (isArrayLike(value) ? arrayCopy(value) : []);
}
else if (isPlainObject(srcValue) || isArguments(srcValue)) {
result = isArguments(value)
? toPlainObject(value)
: (isPlainObject(value) ? value : {});
}
else {
isCommon = false;
}
}
stackA.push(srcValue);
stackB.push(result);
if (isCommon) {
object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
} else if (result === result ? (result !== value) : (value === value)) {
object[key] = result;
}
}
function baseProperty(key) {
return function(object) {
return object == null ? undefined : object[key];
};
}
var getLength = baseProperty('length');
function isArrayLike(value) {
return value != null && isLength(getLength(value));
}
function isLength(value) {
return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
function isObject(value) {
var type = typeof value;
return !!value && (type == 'object' || type == 'function');
}
var merge = createAssigner(baseMerge);
module.exports = merge;
},{"lodash._arraycopy":48,"lodash._arrayeach":49,"lodash._createassigner":50,"lodash.isarguments":55,"lodash.isarray":56,"lodash.isplainobject":57,"lodash.istypedarray":59,"lodash.keys":60,"lodash.toplainobject":62}],48:[function(_dereq_,module,exports){
function arrayCopy(source, array) {
var index = -1,
length = source.length;
array || (array = Array(length));
while (++index < length) {
array[index] = source[index];
}
return array;
}
module.exports = arrayCopy;
},{}],49:[function(_dereq_,module,exports){
function arrayEach(array, iteratee) {
var index = -1,
length = array.length;
while (++index < length) {
if (iteratee(array[index], index, array) === false) {
break;
}
}
return array;
}
module.exports = arrayEach;
},{}],50:[function(_dereq_,module,exports){
var bindCallback = _dereq_('lodash._bindcallback'),
isIterateeCall = _dereq_('lodash._isiterateecall'),
restParam = _dereq_('lodash.restparam');
function createAssigner(assigner) {
return restParam(function(object, sources) {
var index = -1,
length = object == null ? 0 : sources.length,
customizer = length > 2 ? sources[length - 2] : undefined,
guard = length > 2 ? sources[2] : undefined,
thisArg = length > 1 ? sources[length - 1] : undefined;
if (typeof customizer == 'function') {
customizer = bindCallback(customizer, thisArg, 5);
length -= 2;
} else {
customizer = typeof thisArg == 'function' ? thisArg : undefined;
length -= (customizer ? 1 : 0);
}
if (guard && isIterateeCall(sources[0], sources[1], guard)) {
customizer = length < 3 ? undefined : customizer;
length = 1;
}
while (++index < length) {
var source = sources[index];
if (source) {
assigner(object, source, customizer);
}
}
return object;
});
}
module.exports = createAssigner;
},{"lodash._bindcallback":51,"lodash._isiterateecall":52,"lodash.restparam":53}],51:[function(_dereq_,module,exports){
function bindCallback(func, thisArg, argCount) {
if (typeof func != 'function') {
return identity;
}
if (thisArg === undefined) {
return func;
}
switch (argCount) {
case 1: return function(value) {
return func.call(thisArg, value);
};
case 3: return function(value, index, collection) {
return func.call(thisArg, value, index, collection);
};
case 4: return function(accumulator, value, index, collection) {
return func.call(thisArg, accumulator, value, index, collection);
};
case 5: return function(value, other, key, object, source) {
return func.call(thisArg, value, other, key, object, source);
};
}
return function() {
return func.apply(thisArg, arguments);
};
}
function identity(value) {
return value;
}
module.exports = bindCallback;
},{}],52:[function(_dereq_,module,exports){
var reIsUint = /^\d+$/;
var MAX_SAFE_INTEGER = 9007199254740991;
function baseProperty(key) {
return function(object) {
return object == null ? undefined : object[key];
};
}
var getLength = baseProperty('length');
function isArrayLike(value) {
return value != null && isLength(getLength(value));
}
function isIndex(value, length) {
value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
length = length == null ? MAX_SAFE_INTEGER : length;
return value > -1 && value % 1 == 0 && value < length;
}
function isIterateeCall(value, index, object) {
if (!isObject(object)) {
return false;
}
var type = typeof index;
if (type == 'number'
? (isArrayLike(object) && isIndex(index, object.length))
: (type == 'string' && index in object)) {
var other = object[index];
return value === value ? (value === other) : (other !== other);
}
return false;
}
function isLength(value) {
return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
function isObject(value) {
var type = typeof value;
return !!value && (type == 'object' || type == 'function');
}
module.exports = isIterateeCall;
},{}],53:[function(_dereq_,module,exports){
var FUNC_ERROR_TEXT = 'Expected a function';
var nativeMax = Math.max;
function restParam(func, start) {
if (typeof func != 'function') {
throw new TypeError(FUNC_ERROR_TEXT);
}
start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
return function() {
var args = arguments,
index = -1,
length = nativeMax(args.length - start, 0),
rest = Array(length);
while (++index < length) {
rest[index] = args[start + index];
}
switch (start) {
case 0: return func.call(this, rest);
case 1: return func.call(this, args[0], rest);
case 2: return func.call(this, args[0], args[1], rest);
}
var otherArgs = Array(start + 1);
index = -1;
while (++index < start) {
otherArgs[index] = args[index];
}
otherArgs[start] = rest;
return func.apply(this, otherArgs);
};
}
module.exports = restParam;
},{}],54:[function(_dereq_,module,exports){
var funcTag = '[object Function]';
var reIsHostCtor = /^\[object .+?Constructor\]$/;
function isObjectLike(value) {
return !!value && typeof value == 'object';
}
var objectProto = Object.prototype;
var fnToString = Function.prototype.toString;
var hasOwnProperty = objectProto.hasOwnProperty;
var objToString = objectProto.toString;
var reIsNative = RegExp('^' +
fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
.replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);
function getNative(object, key) {
var value = object == null ? undefined : object[key];
return isNative(value) ? value : undefined;
}
function isFunction(value) {
return isObject(value) && objToString.call(value) == funcTag;
}
function isObject(value) {
var type = typeof value;
return !!value && (type == 'object' || type == 'function');
}
function isNative(value) {
if (value == null) {
return false;
}
if (isFunction(value)) {
return reIsNative.test(fnToString.call(value));
}
return isObjectLike(value) && reIsHostCtor.test(value);
}
module.exports = getNative;
},{}],55:[function(_dereq_,module,exports){
var MAX_SAFE_INTEGER = 9007199254740991;
var argsTag = '[object Arguments]',
funcTag = '[object Function]',
genTag = '[object GeneratorFunction]';
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var objectToString = objectProto.toString;
var propertyIsEnumerable = objectProto.propertyIsEnumerable;
function baseProperty(key) {
return function(object) {
return object == null ? undefined : object[key];
};
}
var getLength = baseProperty('length');
function isArguments(value) {
return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
(!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}
function isArrayLike(value) {
return value != null && isLength(getLength(value)) && !isFunction(value);
}
function isArrayLikeObject(value) {
return isObjectLike(value) && isArrayLike(value);
}
function isFunction(value) {
var tag = isObject(value) ? objectToString.call(value) : '';
return tag == funcTag || tag == genTag;
}
function isLength(value) {
return typeof value == 'number' &&
value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
function isObject(value) {
var type = typeof value;
return !!value && (type == 'object' || type == 'function');
}
function isObjectLike(value) {
return !!value && typeof value == 'object';
}
module.exports = isArguments;
},{}],56:[function(_dereq_,module,exports){
var arrayTag = '[object Array]',
funcTag = '[object Function]';
var reIsHostCtor = /^\[object .+?Constructor\]$/;
function isObjectLike(value) {
return !!value && typeof value == 'object';
}
var objectProto = Object.prototype;
var fnToString = Function.prototype.toString;
var hasOwnProperty = objectProto.hasOwnProperty;
var objToString = objectProto.toString;
var reIsNative = RegExp('^' +
fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
.replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);
var nativeIsArray = getNative(Array, 'isArray');
var MAX_SAFE_INTEGER = 9007199254740991;
function getNative(object, key) {
var value = object == null ? undefined : object[key];
return isNative(value) ? value : undefined;
}
function isLength(value) {
return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
var isArray = nativeIsArray || function(value) {
return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
};
function isFunction(value) {
return isObject(value) && objToString.call(value) == funcTag;
}
function isObject(value) {
var type = typeof value;
return !!value && (type == 'object' || type == 'function');
}
function isNative(value) {
if (value == null) {
return false;
}
if (isFunction(value)) {
return reIsNative.test(fnToString.call(value));
}
return isObjectLike(value) && reIsHostCtor.test(value);
}
module.exports = isArray;
},{}],57:[function(_dereq_,module,exports){
var baseFor = _dereq_('lodash._basefor'),
isArguments = _dereq_('lodash.isarguments'),
keysIn = _dereq_('lodash.keysin');
var objectTag = '[object Object]';
function isObjectLike(value) {
return !!value && typeof value == 'object';
}
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var objToString = objectProto.toString;
function baseForIn(object, iteratee) {
return baseFor(object, iteratee, keysIn);
}
function isPlainObject(value) {
var Ctor;
if (!(isObjectLike(value) && objToString.call(value) == objectTag && !isArguments(value)) ||
(!hasOwnProperty.call(value, 'constructor') && (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
return false;
}
var result;
baseForIn(value, function(subValue, key) {
result = key;
});
return result === undefined || hasOwnProperty.call(value, result);
}
module.exports = isPlainObject;
},{"lodash._basefor":58,"lodash.isarguments":55,"lodash.keysin":61}],58:[function(_dereq_,module,exports){
var baseFor = createBaseFor();
function createBaseFor(fromRight) {
return function(object, iteratee, keysFunc) {
var index = -1,
iterable = Object(object),
props = keysFunc(object),
length = props.length;
while (length--) {
var key = props[fromRight ? length : ++index];
if (iteratee(iterable[key], key, iterable) === false) {
break;
}
}
return object;
};
}
module.exports = baseFor;
},{}],59:[function(_dereq_,module,exports){
var MAX_SAFE_INTEGER = 9007199254740991;
var argsTag = '[object Arguments]',
arrayTag = '[object Array]',
boolTag = '[object Boolean]',
dateTag = '[object Date]',
errorTag = '[object Error]',
funcTag = '[object Function]',
mapTag = '[object Map]',
numberTag = '[object Number]',
objectTag = '[object Object]',
regexpTag = '[object RegExp]',
setTag = '[object Set]',
stringTag = '[object String]',
weakMapTag = '[object WeakMap]';
var arrayBufferTag = '[object ArrayBuffer]',
dataViewTag = '[object DataView]',
float32Tag = '[object Float32Array]',
float64Tag = '[object Float64Array]',
int8Tag = '[object Int8Array]',
int16Tag = '[object Int16Array]',
int32Tag = '[object Int32Array]',
uint8Tag = '[object Uint8Array]',
uint8ClampedTag = '[object Uint8ClampedArray]',
uint16Tag = '[object Uint16Array]',
uint32Tag = '[object Uint32Array]';
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;
var objectProto = Object.prototype;
var objectToString = objectProto.toString;
function isLength(value) {
return typeof value == 'number' &&
value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
function isObjectLike(value) {
return !!value && typeof value == 'object';
}
function isTypedArray(value) {
return isObjectLike(value) &&
isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
}
module.exports = isTypedArray;
},{}],60:[function(_dereq_,module,exports){
var getNative = _dereq_('lodash._getnative'),
isArguments = _dereq_('lodash.isarguments'),
isArray = _dereq_('lodash.isarray');
var reIsUint = /^\d+$/;
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var nativeKeys = getNative(Object, 'keys');
var MAX_SAFE_INTEGER = 9007199254740991;
function baseProperty(key) {
return function(object) {
return object == null ? undefined : object[key];
};
}
var getLength = baseProperty('length');
function isArrayLike(value) {
return value != null && isLength(getLength(value));
}
function isIndex(value, length) {
value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
length = length == null ? MAX_SAFE_INTEGER : length;
return value > -1 && value % 1 == 0 && value < length;
}
function isLength(value) {
return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
function shimKeys(object) {
var props = keysIn(object),
propsLength = props.length,
length = propsLength && object.length;
var allowIndexes = !!length && isLength(length) &&
(isArray(object) || isArguments(object));
var index = -1,
result = [];
while (++index < propsLength) {
var key = props[index];
if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
result.push(key);
}
}
return result;
}
function isObject(value) {
var type = typeof value;
return !!value && (type == 'object' || type == 'function');
}
var keys = !nativeKeys ? shimKeys : function(object) {
var Ctor = object == null ? undefined : object.constructor;
if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
(typeof object != 'function' && isArrayLike(object))) {
return shimKeys(object);
}
return isObject(object) ? nativeKeys(object) : [];
};
function keysIn(object) {
if (object == null) {
return [];
}
if (!isObject(object)) {
object = Object(object);
}
var length = object.length;
length = (length && isLength(length) &&
(isArray(object) || isArguments(object)) && length) || 0;
var Ctor = object.constructor,
index = -1,
isProto = typeof Ctor == 'function' && Ctor.prototype === object,
result = Array(length),
skipIndexes = length > 0;
while (++index < length) {
result[index] = (index + '');
}
for (var key in object) {
if (!(skipIndexes && isIndex(key, length)) &&
!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
result.push(key);
}
}
return result;
}
module.exports = keys;
},{"lodash._getnative":54,"lodash.isarguments":55,"lodash.isarray":56}],61:[function(_dereq_,module,exports){
var isArguments = _dereq_('lodash.isarguments'),
isArray = _dereq_('lodash.isarray');
var reIsUint = /^\d+$/;
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
var MAX_SAFE_INTEGER = 9007199254740991;
function isIndex(value, length) {
value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
length = length == null ? MAX_SAFE_INTEGER : length;
return value > -1 && value % 1 == 0 && value < length;
}
function isLength(value) {
return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
function isObject(value) {
var type = typeof value;
return !!value && (type == 'object' || type == 'function');
}
function keysIn(object) {
if (object == null) {
return [];
}
if (!isObject(object)) {
object = Object(object);
}
var length = object.length;
length = (length && isLength(length) &&
(isArray(object) || isArguments(object)) && length) || 0;
var Ctor = object.constructor,
index = -1,
isProto = typeof Ctor == 'function' && Ctor.prototype === object,
result = Array(length),
skipIndexes = length > 0;
while (++index < length) {
result[index] = (index + '');
}
for (var key in object) {
if (!(skipIndexes && isIndex(key, length)) &&
!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
result.push(key);
}
}
return result;
}
module.exports = keysIn;
},{"lodash.isarguments":55,"lodash.isarray":56}],62:[function(_dereq_,module,exports){
var baseCopy = _dereq_('lodash._basecopy'),
keysIn = _dereq_('lodash.keysin');
function toPlainObject(value) {
return baseCopy(value, keysIn(value));
}
module.exports = toPlainObject;
},{"lodash._basecopy":63,"lodash.keysin":61}],63:[function(_dereq_,module,exports){
function baseCopy(source, props, object) {
object || (object = {});
var index = -1,
length = props.length;
while (++index < length) {
var key = props[index];
object[key] = source[key];
}
return object;
}
module.exports = baseCopy;
},{}],64:[function(_dereq_,module,exports){
var JSZip, fs, internal;
JSZip = _dereq_('jszip');
internal = _dereq_('./internal');
module.exports = {
asBlob: function(html, options) {
var zip;
zip = new JSZip();
internal.addFiles(zip, html, options);
return internal.generateDocument(zip);
}
};
},{"./internal":65,"jszip":14}],65:[function(_dereq_,module,exports){
(function (global,Buffer){
var documentTemplate, fs, utils, _;
documentTemplate = _dereq_('./templates/document');
utils = _dereq_('./utils');
_ = {
merge: _dereq_('lodash.merge')
};
module.exports = {
generateDocument: function(zip) {
var buffer;
buffer = zip.generate({
type: 'arraybuffer'
});
if (global.Blob) {
return new Blob([buffer], {
type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
});
} else if (global.Buffer) {
return new Buffer(new Uint8Array(buffer));
} else {
throw new Error("Neither Blob nor Buffer are accessible in this environment. " + "Consider adding Blob.js shim");
}
},
renderDocumentFile: function(documentOptions) {
var templateData;
if (documentOptions == null) {
documentOptions = {};
}
templateData = _.merge({
margins: {
top: 1440,
right: 1440,
bottom: 1440,
left: 1440,
header: 720,
footer: 720,
gutter: 0
}
}, (function() {
switch (documentOptions.orientation) {
case 'landscape':
return {
height: 12240,
width: 15840,
orient: 'landscape'
};
default:
return {
width: 12240,
height: 15840,
orient: 'portrait'
};
}
})(), {
margins: documentOptions.margins
});
return documentTemplate(templateData);
},
addFiles: function(zip, htmlSource, documentOptions) {
zip.file('[Content_Types].xml', Buffer("PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/Pgo8VHlwZXMgeG1sbnM9Imh0dHA6Ly9zY2hlbWFzLm9wZW54bWxmb3JtYXRzLm9yZy9wYWNrYWdlLzIwMDYvY29udGVudC10eXBlcyI+CiAgPERlZmF1bHQgRXh0ZW5zaW9uPSJyZWxzIiBDb250ZW50VHlwZT0KICAgICJhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtcGFja2FnZS5yZWxhdGlvbnNoaXBzK3htbCIgLz4KICA8T3ZlcnJpZGUgUGFydE5hbWU9Ii93b3JkL2RvY3VtZW50LnhtbCIgQ29udGVudFR5cGU9CiAgICAiYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwuZG9jdW1lbnQubWFpbit4bWwiLz4KICA8T3ZlcnJpZGUgUGFydE5hbWU9Ii93b3JkL2FmY2h1bmsubWh0IiBDb250ZW50VHlwZT0ibWVzc2FnZS9yZmM4MjIiLz4KPC9UeXBlcz4K","base64"));
zip.folder('_rels').file('.rels', Buffer("PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/Pgo8UmVsYXRpb25zaGlwcyB4bWxucz0iaHR0cDovL3NjaGVtYXMub3BlbnhtbGZvcm1hdHMub3JnL3BhY2thZ2UvMjAwNi9yZWxhdGlvbnNoaXBzIj4KICA8UmVsYXRpb25zaGlwCiAgICAgIFR5cGU9Imh0dHA6Ly9zY2hlbWFzLm9wZW54bWxmb3JtYXRzLm9yZy9vZmZpY2VEb2N1bWVudC8yMDA2L3JlbGF0aW9uc2hpcHMvb2ZmaWNlRG9jdW1lbnQiCiAgICAgIFRhcmdldD0iL3dvcmQvZG9jdW1lbnQueG1sIiBJZD0iUjA5YzgzZmFmYzA2NzQ4OGUiIC8+CjwvUmVsYXRpb25zaGlwcz4K","base64"));
return zip.folder('word').file('document.xml', this.renderDocumentFile(documentOptions)).file('afchunk.mht', utils.getMHTdocument(htmlSource)).folder('_rels').file('document.xml.rels', Buffer("PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/Pgo8UmVsYXRpb25zaGlwcyB4bWxucz0iaHR0cDovL3NjaGVtYXMub3BlbnhtbGZvcm1hdHMub3JnL3BhY2thZ2UvMjAwNi9yZWxhdGlvbnNoaXBzIj4KICA8UmVsYXRpb25zaGlwIFR5cGU9Imh0dHA6Ly9zY2hlbWFzLm9wZW54bWxmb3JtYXRzLm9yZy9vZmZpY2VEb2N1bWVudC8yMDA2L3JlbGF0aW9uc2hpcHMvYUZDaHVuayIKICAgIFRhcmdldD0iL3dvcmQvYWZjaHVuay5taHQiIElkPSJodG1sQ2h1bmsiIC8+CjwvUmVsYXRpb25zaGlwcz4K","base64"));
}
};
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("buffer").Buffer)
},{"./templates/document":66,"./utils":69,"buffer":1,"lodash.merge":47}],66:[function(_dereq_,module,exports){
var _ = {escape: _dereq_("lodash.escape")};
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document\n  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"\n  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"\n  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"\n  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"\n  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"\n  xmlns:ns6="http://schemas.openxmlformats.org/schemaLibrary/2006/main"\n  xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart"\n  xmlns:ns8="http://schemas.openxmlformats.org/drawingml/2006/chartDrawing"\n  xmlns:dgm="http://schemas.openxmlformats.org/drawingml/2006/diagram"\n  xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"\n  xmlns:ns11="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing"\n  xmlns:dsp="http://schemas.microsoft.com/office/drawing/2008/diagram"\n  xmlns:ns13="urn:schemas-microsoft-com:office:excel"\n  xmlns:o="urn:schemas-microsoft-com:office:office"\n  xmlns:v="urn:schemas-microsoft-com:vml"\n  xmlns:w10="urn:schemas-microsoft-com:office:word"\n  xmlns:ns17="urn:schemas-microsoft-com:office:powerpoint"\n  xmlns:odx="http://opendope.org/xpaths"\n  xmlns:odc="http://opendope.org/conditions"\n  xmlns:odq="http://opendope.org/questions"\n  xmlns:odi="http://opendope.org/components"\n  xmlns:odgm="http://opendope.org/SmartArt/DataHierarchy"\n  xmlns:ns24="http://schemas.openxmlformats.org/officeDocument/2006/bibliography"\n  xmlns:ns25="http://schemas.openxmlformats.org/drawingml/2006/compatibility"\n  xmlns:ns26="http://schemas.openxmlformats.org/drawingml/2006/lockedCanvas">\n  <w:body>\n    <w:altChunk r:id="htmlChunk" />\n    <w:sectPr>\n      <w:pgSz w:w="'+
((__t=( width ))==null?'':__t)+
'" w:h="'+
((__t=( height ))==null?'':__t)+
'" w:orient="'+
((__t=( orient ))==null?'':__t)+
'" />\n      <w:pgMar w:top="'+
((__t=( margins.top ))==null?'':__t)+
'"\n               w:right="'+
((__t=( margins.right ))==null?'':__t)+
'"\n               w:bottom="'+
((__t=( margins.bottom ))==null?'':__t)+
'"\n               w:left="'+
((__t=( margins.left ))==null?'':__t)+
'"\n               w:header="'+
((__t=( margins.header ))==null?'':__t)+
'"\n               w:footer="'+
((__t=( margins.footer ))==null?'':__t)+
'"\n               w:gutter="'+
((__t=( margins.gutter ))==null?'':__t)+
'"/>\n    </w:sectPr>\n  </w:body>\n</w:document>\n';
}
return __p;
};
},{"lodash.escape":45}],67:[function(_dereq_,module,exports){
var _ = {escape: _dereq_("lodash.escape")};
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='MIME-Version: 1.0\nContent-Type: multipart/related;\n    type="text/html";\n    boundary="----=mhtDocumentPart"\n\n\n------=mhtDocumentPart\nContent-Type: text/html;\n    charset="utf-8"\nContent-Transfer-Encoding: quoted-printable\nContent-Location: file:///C:/fake/document.html\n\n'+
((__t=( htmlSource ))==null?'':__t)+
'\n\n'+
((__t=( contentParts ))==null?'':__t)+
'\n\n------=mhtDocumentPart--\n';
}
return __p;
};
},{"lodash.escape":45}],68:[function(_dereq_,module,exports){
var _ = {escape: _dereq_("lodash.escape")};
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='------=mhtDocumentPart\nContent-Type: '+
((__t=( contentType ))==null?'':__t)+
'\nContent-Transfer-Encoding: '+
((__t=( contentEncoding ))==null?'':__t)+
'\nContent-Location: '+
((__t=( contentLocation ))==null?'':__t)+
'\n\n'+
((__t=( encodedContent ))==null?'':__t)+
'\n';
}
return __p;
};
},{"lodash.escape":45}],69:[function(_dereq_,module,exports){
var mhtDocumentTemplate, mhtPartTemplate;
mhtDocumentTemplate = _dereq_('./templates/mht_document');
mhtPartTemplate = _dereq_('./templates/mht_part');
module.exports = {
getMHTdocument: function(htmlSource) {
var imageContentParts, _ref;
_ref = this._prepareImageParts(htmlSource), htmlSource = _ref.htmlSource, imageContentParts = _ref.imageContentParts;
htmlSource = htmlSource.replace(/\=/g, '=3D');
return mhtDocumentTemplate({
htmlSource: htmlSource,
contentParts: imageContentParts.join('\n')
});
},
_prepareImageParts: function(htmlSource) {
var imageContentParts, inlinedReplacer, inlinedSrcPattern;
imageContentParts = [];
inlinedSrcPattern = /"data:(\w+\/\w+);(\w+),(\S+)"/g;
inlinedReplacer = function(match, contentType, contentEncoding, encodedContent) {
var contentLocation, extension, index;
index = imageContentParts.length;
extension = contentType.split('/')[1];
contentLocation = "file:///C:/fake/image" + index + "." + extension;
imageContentParts.push(mhtPartTemplate({
contentType: contentType,
contentEncoding: contentEncoding,
contentLocation: contentLocation,
encodedContent: encodedContent
}));
return "\"" + contentLocation + "\"";
};
if (typeof htmlSource === 'string') {
if (!/<img/g.test(htmlSource)) {
return {
htmlSource: htmlSource,
imageContentParts: imageContentParts
};
}
htmlSource = htmlSource.replace(inlinedSrcPattern, inlinedReplacer);
return {
htmlSource: htmlSource,
imageContentParts: imageContentParts
};
} else {
throw new Error("Not a valid source provided!");
}
}
};
},{"./templates/mht_document":67,"./templates/mht_part":68}]},{},[64])
(64)
});
/*! RESOURCE: ValidateStartEndDates */
function validateStartEndDate(startDateField, endDateField, processErrorMsg){
var startDate = g_form.getValue(startDateField);
var endDate = g_form.getValue(endDateField);
var format = g_user_date_format;
if (startDate === "" || endDate === "")
return true;
var startDateFormat = getDateFromFormat(startDate, format);
var endDateFormat = getDateFromFormat(endDate, format);
if (startDateFormat < endDateFormat)
return true;
if (startDateFormat === 0 || endDateFormat === 0){
processErrorMsg(new GwtMessage().getMessage("{0} is invalid", g_form.getLabelOf(startDate === 0? startDateField : endDateField)));
return false;
}
if (startDateFormat > endDateFormat){
processErrorMsg(new GwtMessage().getMessage("{0} must be after {1}", g_form.getLabelOf(endDateField), g_form.getLabelOf(startDateField)));
return false;
}
return true;
}
/*! RESOURCE: ntt.serviceportal.customlib */
(function ( window, angular, undefined ) {
angular.module('ntt.serviceportal.customlib',[]).directive('customDatePicker', function(dateUtils, $rootScope) {
var dateFormat = g_user_date_format || dateUtils.SYS_DATE_FORMAT;
console.log("DATE_UTILS="+dateFormat);
if ($rootScope.user && $rootScope.user.date_format)
dateFormat = $rootScope.user.date_format;
console.log("DATE_UTILS="+dateFormat);
function isValidDate(value, format){
if (value === '')
return true;
return dateUtils.getDateFromFormat(value, format) != 0;
}
return {
template:
'<div ng-class="{\'input-group\': !snDisabled, \'has-error\': isInvalid}" style="width: 100%;">' +
'<input type="text" name="{{field.name}}" aria-label="{{field.ariaLabel}}" class="form-control" placeholder="{{field.placeholder}}" ng-model="formattedDate" ng-model-options="{updateOn: \'blur\', getterSetter: true}" ng-disabled="snDisabled" ng-readonly="snReadonly"/>' +
'<span class="input-group-btn" ng-hide="snDisabled">' +
'<input type="hidden" class="datepickerinput" ng-model="formattedDate" ng-readonly="true" />' +
'<button aria-hidden="true" tabindex="-1" class="btn btn-default" type="button">' +
'<glyph sn-char="calendar" />' +
'</button>' +
'</span>' +
'</div>',
restrict: 'E',
replace: true,
require: '?ngModel',
scope: {
field: '=',
snDisabled: '=',
snReadonly: '=',
snIncludeTime: '=',
snChange: '&'
},
link: function(scope, element, attrs, ngModel) {
var includeTime = scope.snIncludeTime;
var format = includeTime ? dateFormat.trim() + ' ' + dateUtils.SYS_TIME_FORMAT : dateFormat;
var dp = element.find('.input-group-btn').datetimepicker({
keepInvalid: true,
pickTime: scope.snIncludeTime === true,
format: "X"
}).on('dp.change', onDpChange);
function onDpChange(e) {
var value = new Date(e.date._d);
scope.formattedDate(dateUtils.formatDate(value, format));
if (!scope.$root.$$phase)
scope.$apply();
}
function validate(formattedDate) {
scope.isInvalid = false;
if (formattedDate == null || formattedDate == '') {
dp.data('DateTimePicker').setValue(new Date());
return '';
}
if (isValidDate(formattedDate, format)) {
var d = dateUtils.getDateFromFormat(formattedDate, format);
dp.data('DateTimePicker').setValue(new Date(d));
}
else {
scope.isInvalid = true;
}
return formattedDate;
}
if (ngModel) {
ngModel.$parsers.push(validate);
ngModel.$render = function() {
validate(ngModel.$viewValue);
};
scope.formattedDate = function(formattedValue) {
if (angular.isDefined(formattedValue)) {
ngModel.$setViewValue(formattedValue);
if (scope.snChange) scope.snChange({newValue: formattedValue});
}
return ngModel.$viewValue;
};
} else {
scope.formattedDate = function(formattedValue) {
if (angular.isDefined(formattedValue)) {
scope.field.value = validate(formattedValue);
if (scope.snChange) scope.snChange({newValue: formattedValue});
}
return scope.field.value;
};
scope.$watch('field.value', function(newValue, oldValue){
if (newValue != oldValue)
validate(newValue);
});
}
scope.$on('$destroy', function() {
dp.off('dp.change', onDpChange);
});
}
}
});
;
})( window, window.angular );
/*! RESOURCE: Chartjs.2.7.2.min.js */
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).Chart=t()}}(function(){return function t(e,i,n){function a(o,s){if(!i[o]){if(!e[o]){var l="function"==typeof require&&require;if(!s&&l)return l(o,!0);if(r)return r(o,!0);var u=new Error("Cannot find module '"+o+"'");throw u.code="MODULE_NOT_FOUND",u}var d=i[o]={exports:{}};e[o][0].call(d.exports,function(t){var i=e[o][1][t];return a(i||t)},d,d.exports,t,e,i,n)}return i[o].exports}for(var r="function"==typeof require&&require,o=0;o<n.length;o++)a(n[o]);return a}({1:[function(t,e,i){var n=t(5);function a(t){if(t){var e=[0,0,0],i=1,a=t.match(/^#([a-fA-F0-9]{3})$/i);if(a){a=a[1];for(var r=0;r<e.length;r++)e[r]=parseInt(a[r]+a[r],16)}else if(a=t.match(/^#([a-fA-F0-9]{6})$/i)){a=a[1];for(r=0;r<e.length;r++)e[r]=parseInt(a.slice(2*r,2*r+2),16)}else if(a=t.match(/^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/i)){for(r=0;r<e.length;r++)e[r]=parseInt(a[r+1]);i=parseFloat(a[4])}else if(a=t.match(/^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/i)){for(r=0;r<e.length;r++)e[r]=Math.round(2.55*parseFloat(a[r+1]));i=parseFloat(a[4])}else if(a=t.match(/(\w+)/)){if("transparent"==a[1])return[0,0,0,0];if(!(e=n[a[1]]))return}for(r=0;r<e.length;r++)e[r]=d(e[r],0,255);return i=i||0==i?d(i,0,1):1,e[3]=i,e}}function r(t){if(t){var e=t.match(/^hsla?\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/);if(e){var i=parseFloat(e[4]);return[d(parseInt(e[1]),0,360),d(parseFloat(e[2]),0,100),d(parseFloat(e[3]),0,100),d(isNaN(i)?1:i,0,1)]}}}function o(t){if(t){var e=t.match(/^hwb\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/);if(e){var i=parseFloat(e[4]);return[d(parseInt(e[1]),0,360),d(parseFloat(e[2]),0,100),d(parseFloat(e[3]),0,100),d(isNaN(i)?1:i,0,1)]}}}function s(t,e){return void 0===e&&(e=void 0!==t[3]?t[3]:1),"rgba("+t[0]+", "+t[1]+", "+t[2]+", "+e+")"}function l(t,e){return"rgba("+Math.round(t[0]/255*100)+"%, "+Math.round(t[1]/255*100)+"%, "+Math.round(t[2]/255*100)+"%, "+(e||t[3]||1)+")"}function u(t,e){return void 0===e&&(e=void 0!==t[3]?t[3]:1),"hsla("+t[0]+", "+t[1]+"%, "+t[2]+"%, "+e+")"}function d(t,e,i){return Math.min(Math.max(e,t),i)}function h(t){var e=t.toString(16).toUpperCase();return e.length<2?"0"+e:e}e.exports={getRgba:a,getHsla:r,getRgb:function(t){var e=a(t);return e&&e.slice(0,3)},getHsl:function(t){var e=r(t);return e&&e.slice(0,3)},getHwb:o,getAlpha:function(t){var e=a(t);{if(e)return e[3];if(e=r(t))return e[3];if(e=o(t))return e[3]}},hexString:function(t){return"#"+h(t[0])+h(t[1])+h(t[2])},rgbString:function(t,e){if(e<1||t[3]&&t[3]<1)return s(t,e);return"rgb("+t[0]+", "+t[1]+", "+t[2]+")"},rgbaString:s,percentString:function(t,e){if(e<1||t[3]&&t[3]<1)return l(t,e);var i=Math.round(t[0]/255*100),n=Math.round(t[1]/255*100),a=Math.round(t[2]/255*100);return"rgb("+i+"%, "+n+"%, "+a+"%)"},percentaString:l,hslString:function(t,e){if(e<1||t[3]&&t[3]<1)return u(t,e);return"hsl("+t[0]+", "+t[1]+"%, "+t[2]+"%)"},hslaString:u,hwbString:function(t,e){void 0===e&&(e=void 0!==t[3]?t[3]:1);return"hwb("+t[0]+", "+t[1]+"%, "+t[2]+"%"+(void 0!==e&&1!==e?", "+e:"")+")"},keyword:function(t){return c[t.slice(0,3)]}};var c={};for(var f in n)c[n[f]]=f},{5:5}],2:[function(t,e,i){var n=t(4),a=t(1),r=function(t){return t instanceof r?t:this instanceof r?(this.valid=!1,this.values={rgb:[0,0,0],hsl:[0,0,0],hsv:[0,0,0],hwb:[0,0,0],cmyk:[0,0,0,0],alpha:1},void("string"==typeof t?(e=a.getRgba(t))?this.setValues("rgb",e):(e=a.getHsla(t))?this.setValues("hsl",e):(e=a.getHwb(t))&&this.setValues("hwb",e):"object"==typeof t&&(void 0!==(e=t).r||void 0!==e.red?this.setValues("rgb",e):void 0!==e.l||void 0!==e.lightness?this.setValues("hsl",e):void 0!==e.v||void 0!==e.value?this.setValues("hsv",e):void 0!==e.w||void 0!==e.whiteness?this.setValues("hwb",e):void 0===e.c&&void 0===e.cyan||this.setValues("cmyk",e)))):new r(t);var e};r.prototype={isValid:function(){return this.valid},rgb:function(){return this.setSpace("rgb",arguments)},hsl:function(){return this.setSpace("hsl",arguments)},hsv:function(){return this.setSpace("hsv",arguments)},hwb:function(){return this.setSpace("hwb",arguments)},cmyk:function(){return this.setSpace("cmyk",arguments)},rgbArray:function(){return this.values.rgb},hslArray:function(){return this.values.hsl},hsvArray:function(){return this.values.hsv},hwbArray:function(){var t=this.values;return 1!==t.alpha?t.hwb.concat([t.alpha]):t.hwb},cmykArray:function(){return this.values.cmyk},rgbaArray:function(){var t=this.values;return t.rgb.concat([t.alpha])},hslaArray:function(){var t=this.values;return t.hsl.concat([t.alpha])},alpha:function(t){return void 0===t?this.values.alpha:(this.setValues("alpha",t),this)},red:function(t){return this.setChannel("rgb",0,t)},green:function(t){return this.setChannel("rgb",1,t)},blue:function(t){return this.setChannel("rgb",2,t)},hue:function(t){return t&&(t=(t%=360)<0?360+t:t),this.setChannel("hsl",0,t)},saturation:function(t){return this.setChannel("hsl",1,t)},lightness:function(t){return this.setChannel("hsl",2,t)},saturationv:function(t){return this.setChannel("hsv",1,t)},whiteness:function(t){return this.setChannel("hwb",1,t)},blackness:function(t){return this.setChannel("hwb",2,t)},value:function(t){return this.setChannel("hsv",2,t)},cyan:function(t){return this.setChannel("cmyk",0,t)},magenta:function(t){return this.setChannel("cmyk",1,t)},yellow:function(t){return this.setChannel("cmyk",2,t)},black:function(t){return this.setChannel("cmyk",3,t)},hexString:function(){return a.hexString(this.values.rgb)},rgbString:function(){return a.rgbString(this.values.rgb,this.values.alpha)},rgbaString:function(){return a.rgbaString(this.values.rgb,this.values.alpha)},percentString:function(){return a.percentString(this.values.rgb,this.values.alpha)},hslString:function(){return a.hslString(this.values.hsl,this.values.alpha)},hslaString:function(){return a.hslaString(this.values.hsl,this.values.alpha)},hwbString:function(){return a.hwbString(this.values.hwb,this.values.alpha)},keyword:function(){return a.keyword(this.values.rgb,this.values.alpha)},rgbNumber:function(){var t=this.values.rgb;return t[0]<<16|t[1]<<8|t[2]},luminosity:function(){for(var t=this.values.rgb,e=[],i=0;i<t.length;i++){var n=t[i]/255;e[i]=n<=.03928?n/12.92:Math.pow((n+.055)/1.055,2.4)}return.2126*e[0]+.7152*e[1]+.0722*e[2]},contrast:function(t){var e=this.luminosity(),i=t.luminosity();return e>i?(e+.05)/(i+.05):(i+.05)/(e+.05)},level:function(t){var e=this.contrast(t);return e>=7.1?"AAA":e>=4.5?"AA":""},dark:function(){var t=this.values.rgb;return(299*t[0]+587*t[1]+114*t[2])/1e3<128},light:function(){return!this.dark()},negate:function(){for(var t=[],e=0;e<3;e++)t[e]=255-this.values.rgb[e];return this.setValues("rgb",t),this},lighten:function(t){var e=this.values.hsl;return e[2]+=e[2]*t,this.setValues("hsl",e),this},darken:function(t){var e=this.values.hsl;return e[2]-=e[2]*t,this.setValues("hsl",e),this},saturate:function(t){var e=this.values.hsl;return e[1]+=e[1]*t,this.setValues("hsl",e),this},desaturate:function(t){var e=this.values.hsl;return e[1]-=e[1]*t,this.setValues("hsl",e),this},whiten:function(t){var e=this.values.hwb;return e[1]+=e[1]*t,this.setValues("hwb",e),this},blacken:function(t){var e=this.values.hwb;return e[2]+=e[2]*t,this.setValues("hwb",e),this},greyscale:function(){var t=this.values.rgb,e=.3*t[0]+.59*t[1]+.11*t[2];return this.setValues("rgb",[e,e,e]),this},clearer:function(t){var e=this.values.alpha;return this.setValues("alpha",e-e*t),this},opaquer:function(t){var e=this.values.alpha;return this.setValues("alpha",e+e*t),this},rotate:function(t){var e=this.values.hsl,i=(e[0]+t)%360;return e[0]=i<0?360+i:i,this.setValues("hsl",e),this},mix:function(t,e){var i=this,n=t,a=void 0===e?.5:e,r=2*a-1,o=i.alpha()-n.alpha(),s=((r*o==-1?r:(r+o)/(1+r*o))+1)/2,l=1-s;return this.rgb(s*i.red()+l*n.red(),s*i.green()+l*n.green(),s*i.blue()+l*n.blue()).alpha(i.alpha()*a+n.alpha()*(1-a))},toJSON:function(){return this.rgb()},clone:function(){var t,e,i=new r,n=this.values,a=i.values;for(var o in n)n.hasOwnProperty(o)&&(t=n[o],"[object Array]"===(e={}.toString.call(t))?a[o]=t.slice(0):"[object Number]"===e?a[o]=t:console.error("unexpected color value:",t));return i}},r.prototype.spaces={rgb:["red","green","blue"],hsl:["hue","saturation","lightness"],hsv:["hue","saturation","value"],hwb:["hue","whiteness","blackness"],cmyk:["cyan","magenta","yellow","black"]},r.prototype.maxes={rgb:[255,255,255],hsl:[360,100,100],hsv:[360,100,100],hwb:[360,100,100],cmyk:[100,100,100,100]},r.prototype.getValues=function(t){for(var e=this.values,i={},n=0;n<t.length;n++)i[t.charAt(n)]=e[t][n];return 1!==e.alpha&&(i.a=e.alpha),i},r.prototype.setValues=function(t,e){var i,a,r=this.values,o=this.spaces,s=this.maxes,l=1;if(this.valid=!0,"alpha"===t)l=e;else if(e.length)r[t]=e.slice(0,t.length),l=e[t.length];else if(void 0!==e[t.charAt(0)]){for(i=0;i<t.length;i++)r[t][i]=e[t.charAt(i)];l=e.a}else if(void 0!==e[o[t][0]]){var u=o[t];for(i=0;i<t.length;i++)r[t][i]=e[u[i]];l=e.alpha}if(r.alpha=Math.max(0,Math.min(1,void 0===l?r.alpha:l)),"alpha"===t)return!1;for(i=0;i<t.length;i++)a=Math.max(0,Math.min(s[t][i],r[t][i])),r[t][i]=Math.round(a);for(var d in o)d!==t&&(r[d]=n[t][d](r[t]));return!0},r.prototype.setSpace=function(t,e){var i=e[0];return void 0===i?this.getValues(t):("number"==typeof i&&(i=Array.prototype.slice.call(e)),this.setValues(t,i),this)},r.prototype.setChannel=function(t,e,i){var n=this.values[t];return void 0===i?n[e]:i===n[e]?this:(n[e]=i,this.setValues(t,n),this)},"undefined"!=typeof window&&(window.Color=r),e.exports=r},{1:1,4:4}],3:[function(t,e,i){function n(t){var e,i,n=t[0]/255,a=t[1]/255,r=t[2]/255,o=Math.min(n,a,r),s=Math.max(n,a,r),l=s-o;return s==o?e=0:n==s?e=(a-r)/l:a==s?e=2+(r-n)/l:r==s&&(e=4+(n-a)/l),(e=Math.min(60*e,360))<0&&(e+=360),i=(o+s)/2,[e,100*(s==o?0:i<=.5?l/(s+o):l/(2-s-o)),100*i]}function a(t){var e,i,n=t[0],a=t[1],r=t[2],o=Math.min(n,a,r),s=Math.max(n,a,r),l=s-o;return i=0==s?0:l/s*1e3/10,s==o?e=0:n==s?e=(a-r)/l:a==s?e=2+(r-n)/l:r==s&&(e=4+(n-a)/l),(e=Math.min(60*e,360))<0&&(e+=360),[e,i,s/255*1e3/10]}function o(t){var e=t[0],i=t[1],a=t[2];return[n(t)[0],100*(1/255*Math.min(e,Math.min(i,a))),100*(a=1-1/255*Math.max(e,Math.max(i,a)))]}function s(t){var e,i=t[0]/255,n=t[1]/255,a=t[2]/255;return[100*((1-i-(e=Math.min(1-i,1-n,1-a)))/(1-e)||0),100*((1-n-e)/(1-e)||0),100*((1-a-e)/(1-e)||0),100*e]}function l(t){return S[JSON.stringify(t)]}function u(t){var e=t[0]/255,i=t[1]/255,n=t[2]/255;return[100*(.4124*(e=e>.04045?Math.pow((e+.055)/1.055,2.4):e/12.92)+.3576*(i=i>.04045?Math.pow((i+.055)/1.055,2.4):i/12.92)+.1805*(n=n>.04045?Math.pow((n+.055)/1.055,2.4):n/12.92)),100*(.2126*e+.7152*i+.0722*n),100*(.0193*e+.1192*i+.9505*n)]}function d(t){var e=u(t),i=e[0],n=e[1],a=e[2];return n/=100,a/=108.883,i=(i/=95.047)>.008856?Math.pow(i,1/3):7.787*i+16/116,[116*(n=n>.008856?Math.pow(n,1/3):7.787*n+16/116)-16,500*(i-n),200*(n-(a=a>.008856?Math.pow(a,1/3):7.787*a+16/116))]}function h(t){var e,i,n,a,r,o=t[0]/360,s=t[1]/100,l=t[2]/100;if(0==s)return[r=255*l,r,r];e=2*l-(i=l<.5?l*(1+s):l+s-l*s),a=[0,0,0];for(var u=0;u<3;u++)(n=o+1/3*-(u-1))<0&&n++,n>1&&n--,r=6*n<1?e+6*(i-e)*n:2*n<1?i:3*n<2?e+(i-e)*(2/3-n)*6:e,a[u]=255*r;return a}function c(t){var e=t[0]/60,i=t[1]/100,n=t[2]/100,a=Math.floor(e)%6,r=e-Math.floor(e),o=255*n*(1-i),s=255*n*(1-i*r),l=255*n*(1-i*(1-r));n*=255;switch(a){case 0:return[n,l,o];case 1:return[s,n,o];case 2:return[o,n,l];case 3:return[o,s,n];case 4:return[l,o,n];case 5:return[n,o,s]}}function f(t){var e,i,n,a,o=t[0]/360,s=t[1]/100,l=t[2]/100,u=s+l;switch(u>1&&(s/=u,l/=u),n=6*o-(e=Math.floor(6*o)),0!=(1&e)&&(n=1-n),a=s+n*((i=1-l)-s),e){default:case 6:case 0:r=i,g=a,b=s;break;case 1:r=a,g=i,b=s;break;case 2:r=s,g=i,b=a;break;case 3:r=s,g=a,b=i;break;case 4:r=a,g=s,b=i;break;case 5:r=i,g=s,b=a}return[255*r,255*g,255*b]}function m(t){var e=t[0]/100,i=t[1]/100,n=t[2]/100,a=t[3]/100;return[255*(1-Math.min(1,e*(1-a)+a)),255*(1-Math.min(1,i*(1-a)+a)),255*(1-Math.min(1,n*(1-a)+a))]}function p(t){var e,i,n,a=t[0]/100,r=t[1]/100,o=t[2]/100;return i=-.9689*a+1.8758*r+.0415*o,n=.0557*a+-.204*r+1.057*o,e=(e=3.2406*a+-1.5372*r+-.4986*o)>.0031308?1.055*Math.pow(e,1/2.4)-.055:e*=12.92,i=i>.0031308?1.055*Math.pow(i,1/2.4)-.055:i*=12.92,n=n>.0031308?1.055*Math.pow(n,1/2.4)-.055:n*=12.92,[255*(e=Math.min(Math.max(0,e),1)),255*(i=Math.min(Math.max(0,i),1)),255*(n=Math.min(Math.max(0,n),1))]}function v(t){var e=t[0],i=t[1],n=t[2];return i/=100,n/=108.883,e=(e/=95.047)>.008856?Math.pow(e,1/3):7.787*e+16/116,[116*(i=i>.008856?Math.pow(i,1/3):7.787*i+16/116)-16,500*(e-i),200*(i-(n=n>.008856?Math.pow(n,1/3):7.787*n+16/116))]}function y(t){var e,i,n,a,r=t[0],o=t[1],s=t[2];return r<=8?a=(i=100*r/903.3)/100*7.787+16/116:(i=100*Math.pow((r+16)/116,3),a=Math.pow(i/100,1/3)),[e=e/95.047<=.008856?e=95.047*(o/500+a-16/116)/7.787:95.047*Math.pow(o/500+a,3),i,n=n/108.883<=.008859?n=108.883*(a-s/200-16/116)/7.787:108.883*Math.pow(a-s/200,3)]}function x(t){var e,i=t[0],n=t[1],a=t[2];return(e=360*Math.atan2(a,n)/2/Math.PI)<0&&(e+=360),[i,Math.sqrt(n*n+a*a),e]}function _(t){return p(y(t))}function k(t){var e,i=t[0],n=t[1];return e=t[2]/360*2*Math.PI,[i,n*Math.cos(e),n*Math.sin(e)]}function w(t){return M[t]}e.exports={rgb2hsl:n,rgb2hsv:a,rgb2hwb:o,rgb2cmyk:s,rgb2keyword:l,rgb2xyz:u,rgb2lab:d,rgb2lch:function(t){return x(d(t))},hsl2rgb:h,hsl2hsv:function(t){var e=t[0],i=t[1]/100,n=t[2]/100;if(0===n)return[0,0,0];return[e,100*(2*(i*=(n*=2)<=1?n:2-n)/(n+i)),100*((n+i)/2)]},hsl2hwb:function(t){return o(h(t))},hsl2cmyk:function(t){return s(h(t))},hsl2keyword:function(t){return l(h(t))},hsv2rgb:c,hsv2hsl:function(t){var e,i,n=t[0],a=t[1]/100,r=t[2]/100;return e=a*r,[n,100*(e=(e/=(i=(2-a)*r)<=1?i:2-i)||0),100*(i/=2)]},hsv2hwb:function(t){return o(c(t))},hsv2cmyk:function(t){return s(c(t))},hsv2keyword:function(t){return l(c(t))},hwb2rgb:f,hwb2hsl:function(t){return n(f(t))},hwb2hsv:function(t){return a(f(t))},hwb2cmyk:function(t){return s(f(t))},hwb2keyword:function(t){return l(f(t))},cmyk2rgb:m,cmyk2hsl:function(t){return n(m(t))},cmyk2hsv:function(t){return a(m(t))},cmyk2hwb:function(t){return o(m(t))},cmyk2keyword:function(t){return l(m(t))},keyword2rgb:w,keyword2hsl:function(t){return n(w(t))},keyword2hsv:function(t){return a(w(t))},keyword2hwb:function(t){return o(w(t))},keyword2cmyk:function(t){return s(w(t))},keyword2lab:function(t){return d(w(t))},keyword2xyz:function(t){return u(w(t))},xyz2rgb:p,xyz2lab:v,xyz2lch:function(t){return x(v(t))},lab2xyz:y,lab2rgb:_,lab2lch:x,lch2lab:k,lch2xyz:function(t){return y(k(t))},lch2rgb:function(t){return _(k(t))}};var M={aliceblue:[240,248,255],antiquewhite:[250,235,215],aqua:[0,255,255],aquamarine:[127,255,212],azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],black:[0,0,0],blanchedalmond:[255,235,205],blue:[0,0,255],blueviolet:[138,43,226],brown:[165,42,42],burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],fuchsia:[255,0,255],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],goldenrod:[218,165,32],gray:[128,128,128],green:[0,128,0],greenyellow:[173,255,47],grey:[128,128,128],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],lightsteelblue:[176,196,222],lightyellow:[255,255,224],lime:[0,255,0],limegreen:[50,205,50],linen:[250,240,230],magenta:[255,0,255],maroon:[128,0,0],mediumaquamarine:[102,205,170],mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,219],mediumseagreen:[60,179,113],mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],navajowhite:[255,222,173],navy:[0,0,128],oldlace:[253,245,230],olive:[128,128,0],olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[219,112,147],papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],plum:[221,160,221],powderblue:[176,224,230],purple:[128,0,128],rebeccapurple:[102,51,153],red:[255,0,0],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],sienna:[160,82,45],silver:[192,192,192],skyblue:[135,206,235],slateblue:[106,90,205],slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],steelblue:[70,130,180],tan:[210,180,140],teal:[0,128,128],thistle:[216,191,216],tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],white:[255,255,255],whitesmoke:[245,245,245],yellow:[255,255,0],yellowgreen:[154,205,50]},S={};for(var D in M)S[JSON.stringify(M[D])]=D},{}],4:[function(t,e,i){var n=t(3),a=function(){return new u};for(var r in n){a[r+"Raw"]=function(t){return function(e){return"number"==typeof e&&(e=Array.prototype.slice.call(arguments)),n[t](e)}}(r);var o=/(\w+)2(\w+)/.exec(r),s=o[1],l=o[2];(a[s]=a[s]||{})[l]=a[r]=function(t){return function(e){"number"==typeof e&&(e=Array.prototype.slice.call(arguments));var i=n[t](e);if("string"==typeof i||void 0===i)return i;for(var a=0;a<i.length;a++)i[a]=Math.round(i[a]);return i}}(r)}var u=function(){this.convs={}};u.prototype.routeSpace=function(t,e){var i=e[0];return void 0===i?this.getValues(t):("number"==typeof i&&(i=Array.prototype.slice.call(e)),this.setValues(t,i))},u.prototype.setValues=function(t,e){return this.space=t,this.convs={},this.convs[t]=e,this},u.prototype.getValues=function(t){var e=this.convs[t];if(!e){var i=this.space,n=this.convs[i];e=a[i][t](n),this.convs[t]=e}return e},["rgb","hsl","hsv","cmyk","keyword"].forEach(function(t){u.prototype[t]=function(e){return this.routeSpace(t,arguments)}}),e.exports=a},{3:3}],5:[function(t,e,i){"use strict";e.exports={aliceblue:[240,248,255],antiquewhite:[250,235,215],aqua:[0,255,255],aquamarine:[127,255,212],azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],black:[0,0,0],blanchedalmond:[255,235,205],blue:[0,0,255],blueviolet:[138,43,226],brown:[165,42,42],burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],fuchsia:[255,0,255],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],goldenrod:[218,165,32],gray:[128,128,128],green:[0,128,0],greenyellow:[173,255,47],grey:[128,128,128],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],lightsteelblue:[176,196,222],lightyellow:[255,255,224],lime:[0,255,0],limegreen:[50,205,50],linen:[250,240,230],magenta:[255,0,255],maroon:[128,0,0],mediumaquamarine:[102,205,170],mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,219],mediumseagreen:[60,179,113],mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],navajowhite:[255,222,173],navy:[0,0,128],oldlace:[253,245,230],olive:[128,128,0],olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[219,112,147],papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],plum:[221,160,221],powderblue:[176,224,230],purple:[128,0,128],rebeccapurple:[102,51,153],red:[255,0,0],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],sienna:[160,82,45],silver:[192,192,192],skyblue:[135,206,235],slateblue:[106,90,205],slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],steelblue:[70,130,180],tan:[210,180,140],teal:[0,128,128],thistle:[216,191,216],tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],white:[255,255,255],whitesmoke:[245,245,245],yellow:[255,255,0],yellowgreen:[154,205,50]}},{}],6:[function(t,e,i){var n,a;n=this,a=function(){"use strict";var i,n;function a(){return i.apply(null,arguments)}function r(t){return t instanceof Array||"[object Array]"===Object.prototype.toString.call(t)}function o(t){return null!=t&&"[object Object]"===Object.prototype.toString.call(t)}function s(t){return void 0===t}function l(t){return"number"==typeof t||"[object Number]"===Object.prototype.toString.call(t)}function u(t){return t instanceof Date||"[object Date]"===Object.prototype.toString.call(t)}function d(t,e){var i,n=[];for(i=0;i<t.length;++i)n.push(e(t[i],i));return n}function h(t,e){return Object.prototype.hasOwnProperty.call(t,e)}function c(t,e){for(var i in e)h(e,i)&&(t[i]=e[i]);return h(e,"toString")&&(t.toString=e.toString),h(e,"valueOf")&&(t.valueOf=e.valueOf),t}function f(t,e,i,n){return Pe(t,e,i,n,!0).utc()}function g(t){return null==t._pf&&(t._pf={empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1,parsedDateParts:[],meridiem:null,rfc2822:!1,weekdayMismatch:!1}),t._pf}function m(t){if(null==t._isValid){var e=g(t),i=n.call(e.parsedDateParts,function(t){return null!=t}),a=!isNaN(t._d.getTime())&&e.overflow<0&&!e.empty&&!e.invalidMonth&&!e.invalidWeekday&&!e.weekdayMismatch&&!e.nullInput&&!e.invalidFormat&&!e.userInvalidated&&(!e.meridiem||e.meridiem&&i);if(t._strict&&(a=a&&0===e.charsLeftOver&&0===e.unusedTokens.length&&void 0===e.bigHour),null!=Object.isFrozen&&Object.isFrozen(t))return a;t._isValid=a}return t._isValid}function p(t){var e=f(NaN);return null!=t?c(g(e),t):g(e).userInvalidated=!0,e}n=Array.prototype.some?Array.prototype.some:function(t){for(var e=Object(this),i=e.length>>>0,n=0;n<i;n++)if(n in e&&t.call(this,e[n],n,e))return!0;return!1};var v=a.momentProperties=[];function y(t,e){var i,n,a;if(s(e._isAMomentObject)||(t._isAMomentObject=e._isAMomentObject),s(e._i)||(t._i=e._i),s(e._f)||(t._f=e._f),s(e._l)||(t._l=e._l),s(e._strict)||(t._strict=e._strict),s(e._tzm)||(t._tzm=e._tzm),s(e._isUTC)||(t._isUTC=e._isUTC),s(e._offset)||(t._offset=e._offset),s(e._pf)||(t._pf=g(e)),s(e._locale)||(t._locale=e._locale),v.length>0)for(i=0;i<v.length;i++)s(a=e[n=v[i]])||(t[n]=a);return t}var b=!1;function x(t){y(this,t),this._d=new Date(null!=t._d?t._d.getTime():NaN),this.isValid()||(this._d=new Date(NaN)),!1===b&&(b=!0,a.updateOffset(this),b=!1)}function _(t){return t instanceof x||null!=t&&null!=t._isAMomentObject}function k(t){return t<0?Math.ceil(t)||0:Math.floor(t)}function w(t){var e=+t,i=0;return 0!==e&&isFinite(e)&&(i=k(e)),i}function M(t,e,i){var n,a=Math.min(t.length,e.length),r=Math.abs(t.length-e.length),o=0;for(n=0;n<a;n++)(i&&t[n]!==e[n]||!i&&w(t[n])!==w(e[n]))&&o++;return o+r}function S(t){!1===a.suppressDeprecationWarnings&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+t)}function D(t,e){var i=!0;return c(function(){if(null!=a.deprecationHandler&&a.deprecationHandler(null,t),i){for(var n,r=[],o=0;o<arguments.length;o++){if(n="","object"==typeof arguments[o]){for(var s in n+="\n["+o+"] ",arguments[0])n+=s+": "+arguments[0][s]+", ";n=n.slice(0,-2)}else n=arguments[o];r.push(n)}S(t+"\nArguments: "+Array.prototype.slice.call(r).join("")+"\n"+(new Error).stack),i=!1}return e.apply(this,arguments)},e)}var C,P={};function T(t,e){null!=a.deprecationHandler&&a.deprecationHandler(t,e),P[t]||(S(e),P[t]=!0)}function O(t){return t instanceof Function||"[object Function]"===Object.prototype.toString.call(t)}function I(t,e){var i,n=c({},t);for(i in e)h(e,i)&&(o(t[i])&&o(e[i])?(n[i]={},c(n[i],t[i]),c(n[i],e[i])):null!=e[i]?n[i]=e[i]:delete n[i]);for(i in t)h(t,i)&&!h(e,i)&&o(t[i])&&(n[i]=c({},n[i]));return n}function A(t){null!=t&&this.set(t)}a.suppressDeprecationWarnings=!1,a.deprecationHandler=null,C=Object.keys?Object.keys:function(t){var e,i=[];for(e in t)h(t,e)&&i.push(e);return i};var F={};function R(t,e){var i=t.toLowerCase();F[i]=F[i+"s"]=F[e]=t}function L(t){return"string"==typeof t?F[t]||F[t.toLowerCase()]:void 0}function W(t){var e,i,n={};for(i in t)h(t,i)&&(e=L(i))&&(n[e]=t[i]);return n}var Y={};function N(t,e){Y[t]=e}function z(t,e,i){var n=""+Math.abs(t),a=e-n.length;return(t>=0?i?"+":"":"-")+Math.pow(10,Math.max(0,a)).toString().substr(1)+n}var H=/(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,V=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,B={},E={};function j(t,e,i,n){var a=n;"string"==typeof n&&(a=function(){return this[n]()}),t&&(E[t]=a),e&&(E[e[0]]=function(){return z(a.apply(this,arguments),e[1],e[2])}),i&&(E[i]=function(){return this.localeData().ordinal(a.apply(this,arguments),t)})}function U(t,e){return t.isValid()?(e=q(e,t.localeData()),B[e]=B[e]||function(t){var e,i,n,a=t.match(H);for(e=0,i=a.length;e<i;e++)E[a[e]]?a[e]=E[a[e]]:a[e]=(n=a[e]).match(/\[[\s\S]/)?n.replace(/^\[|\]$/g,""):n.replace(/\\/g,"");return function(e){var n,r="";for(n=0;n<i;n++)r+=O(a[n])?a[n].call(e,t):a[n];return r}}(e),B[e](t)):t.localeData().invalidDate()}function q(t,e){var i=5;function n(t){return e.longDateFormat(t)||t}for(V.lastIndex=0;i>=0&&V.test(t);)t=t.replace(V,n),V.lastIndex=0,i-=1;return t}var G=/\d/,Z=/\d\d/,X=/\d{3}/,J=/\d{4}/,K=/[+-]?\d{6}/,$=/\d\d?/,Q=/\d\d\d\d?/,tt=/\d\d\d\d\d\d?/,et=/\d{1,3}/,it=/\d{1,4}/,nt=/[+-]?\d{1,6}/,at=/\d+/,rt=/[+-]?\d+/,ot=/Z|[+-]\d\d:?\d\d/gi,st=/Z|[+-]\d\d(?::?\d\d)?/gi,lt=/[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,ut={};function dt(t,e,i){ut[t]=O(e)?e:function(t,n){return t&&i?i:e}}function ht(t,e){return h(ut,t)?ut[t](e._strict,e._locale):new RegExp(ct(t.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(t,e,i,n,a){return e||i||n||a})))}function ct(t){return t.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}var ft={};function gt(t,e){var i,n=e;for("string"==typeof t&&(t=[t]),l(e)&&(n=function(t,i){i[e]=w(t)}),i=0;i<t.length;i++)ft[t[i]]=n}function mt(t,e){gt(t,function(t,i,n,a){n._w=n._w||{},e(t,n._w,n,a)})}var pt=0,vt=1,yt=2,bt=3,xt=4,_t=5,kt=6,wt=7,Mt=8;function St(t){return Dt(t)?366:365}function Dt(t){return t%4==0&&t%100!=0||t%400==0}j("Y",0,0,function(){var t=this.year();return t<=9999?""+t:"+"+t}),j(0,["YY",2],0,function(){return this.year()%100}),j(0,["YYYY",4],0,"year"),j(0,["YYYYY",5],0,"year"),j(0,["YYYYYY",6,!0],0,"year"),R("year","y"),N("year",1),dt("Y",rt),dt("YY",$,Z),dt("YYYY",it,J),dt("YYYYY",nt,K),dt("YYYYYY",nt,K),gt(["YYYYY","YYYYYY"],pt),gt("YYYY",function(t,e){e[pt]=2===t.length?a.parseTwoDigitYear(t):w(t)}),gt("YY",function(t,e){e[pt]=a.parseTwoDigitYear(t)}),gt("Y",function(t,e){e[pt]=parseInt(t,10)}),a.parseTwoDigitYear=function(t){return w(t)+(w(t)>68?1900:2e3)};var Ct,Pt=Tt("FullYear",!0);function Tt(t,e){return function(i){return null!=i?(It(this,t,i),a.updateOffset(this,e),this):Ot(this,t)}}function Ot(t,e){return t.isValid()?t._d["get"+(t._isUTC?"UTC":"")+e]():NaN}function It(t,e,i){t.isValid()&&!isNaN(i)&&("FullYear"===e&&Dt(t.year())&&1===t.month()&&29===t.date()?t._d["set"+(t._isUTC?"UTC":"")+e](i,t.month(),At(i,t.month())):t._d["set"+(t._isUTC?"UTC":"")+e](i))}function At(t,e){if(isNaN(t)||isNaN(e))return NaN;var i,n=(e%(i=12)+i)%i;return t+=(e-n)/12,1===n?Dt(t)?29:28:31-n%7%2}Ct=Array.prototype.indexOf?Array.prototype.indexOf:function(t){var e;for(e=0;e<this.length;++e)if(this[e]===t)return e;return-1},j("M",["MM",2],"Mo",function(){return this.month()+1}),j("MMM",0,0,function(t){return this.localeData().monthsShort(this,t)}),j("MMMM",0,0,function(t){return this.localeData().months(this,t)}),R("month","M"),N("month",8),dt("M",$),dt("MM",$,Z),dt("MMM",function(t,e){return e.monthsShortRegex(t)}),dt("MMMM",function(t,e){return e.monthsRegex(t)}),gt(["M","MM"],function(t,e){e[vt]=w(t)-1}),gt(["MMM","MMMM"],function(t,e,i,n){var a=i._locale.monthsParse(t,n,i._strict);null!=a?e[vt]=a:g(i).invalidMonth=t});var Ft=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,Rt="January_February_March_April_May_June_July_August_September_October_November_December".split("_");var Lt="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_");function Wt(t,e){var i;if(!t.isValid())return t;if("string"==typeof e)if(/^\d+$/.test(e))e=w(e);else if(!l(e=t.localeData().monthsParse(e)))return t;return i=Math.min(t.date(),At(t.year(),e)),t._d["set"+(t._isUTC?"UTC":"")+"Month"](e,i),t}function Yt(t){return null!=t?(Wt(this,t),a.updateOffset(this,!0),this):Ot(this,"Month")}var Nt=lt;var zt=lt;function Ht(){function t(t,e){return e.length-t.length}var e,i,n=[],a=[],r=[];for(e=0;e<12;e++)i=f([2e3,e]),n.push(this.monthsShort(i,"")),a.push(this.months(i,"")),r.push(this.months(i,"")),r.push(this.monthsShort(i,""));for(n.sort(t),a.sort(t),r.sort(t),e=0;e<12;e++)n[e]=ct(n[e]),a[e]=ct(a[e]);for(e=0;e<24;e++)r[e]=ct(r[e]);this._monthsRegex=new RegExp("^("+r.join("|")+")","i"),this._monthsShortRegex=this._monthsRegex,this._monthsStrictRegex=new RegExp("^("+a.join("|")+")","i"),this._monthsShortStrictRegex=new RegExp("^("+n.join("|")+")","i")}function Vt(t){var e=new Date(Date.UTC.apply(null,arguments));return t<100&&t>=0&&isFinite(e.getUTCFullYear())&&e.setUTCFullYear(t),e}function Bt(t,e,i){var n=7+e-i;return-((7+Vt(t,0,n).getUTCDay()-e)%7)+n-1}function Et(t,e,i,n,a){var r,o,s=1+7*(e-1)+(7+i-n)%7+Bt(t,n,a);return s<=0?o=St(r=t-1)+s:s>St(t)?(r=t+1,o=s-St(t)):(r=t,o=s),{year:r,dayOfYear:o}}function jt(t,e,i){var n,a,r=Bt(t.year(),e,i),o=Math.floor((t.dayOfYear()-r-1)/7)+1;return o<1?n=o+Ut(a=t.year()-1,e,i):o>Ut(t.year(),e,i)?(n=o-Ut(t.year(),e,i),a=t.year()+1):(a=t.year(),n=o),{week:n,year:a}}function Ut(t,e,i){var n=Bt(t,e,i),a=Bt(t+1,e,i);return(St(t)-n+a)/7}j("w",["ww",2],"wo","week"),j("W",["WW",2],"Wo","isoWeek"),R("week","w"),R("isoWeek","W"),N("week",5),N("isoWeek",5),dt("w",$),dt("ww",$,Z),dt("W",$),dt("WW",$,Z),mt(["w","ww","W","WW"],function(t,e,i,n){e[n.substr(0,1)]=w(t)});j("d",0,"do","day"),j("dd",0,0,function(t){return this.localeData().weekdaysMin(this,t)}),j("ddd",0,0,function(t){return this.localeData().weekdaysShort(this,t)}),j("dddd",0,0,function(t){return this.localeData().weekdays(this,t)}),j("e",0,0,"weekday"),j("E",0,0,"isoWeekday"),R("day","d"),R("weekday","e"),R("isoWeekday","E"),N("day",11),N("weekday",11),N("isoWeekday",11),dt("d",$),dt("e",$),dt("E",$),dt("dd",function(t,e){return e.weekdaysMinRegex(t)}),dt("ddd",function(t,e){return e.weekdaysShortRegex(t)}),dt("dddd",function(t,e){return e.weekdaysRegex(t)}),mt(["dd","ddd","dddd"],function(t,e,i,n){var a=i._locale.weekdaysParse(t,n,i._strict);null!=a?e.d=a:g(i).invalidWeekday=t}),mt(["d","e","E"],function(t,e,i,n){e[n]=w(t)});var qt="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_");var Gt="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_");var Zt="Su_Mo_Tu_We_Th_Fr_Sa".split("_");var Xt=lt;var Jt=lt;var Kt=lt;function $t(){function t(t,e){return e.length-t.length}var e,i,n,a,r,o=[],s=[],l=[],u=[];for(e=0;e<7;e++)i=f([2e3,1]).day(e),n=this.weekdaysMin(i,""),a=this.weekdaysShort(i,""),r=this.weekdays(i,""),o.push(n),s.push(a),l.push(r),u.push(n),u.push(a),u.push(r);for(o.sort(t),s.sort(t),l.sort(t),u.sort(t),e=0;e<7;e++)s[e]=ct(s[e]),l[e]=ct(l[e]),u[e]=ct(u[e]);this._weekdaysRegex=new RegExp("^("+u.join("|")+")","i"),this._weekdaysShortRegex=this._weekdaysRegex,this._weekdaysMinRegex=this._weekdaysRegex,this._weekdaysStrictRegex=new RegExp("^("+l.join("|")+")","i"),this._weekdaysShortStrictRegex=new RegExp("^("+s.join("|")+")","i"),this._weekdaysMinStrictRegex=new RegExp("^("+o.join("|")+")","i")}function Qt(){return this.hours()%12||12}function te(t,e){j(t,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),e)})}function ee(t,e){return e._meridiemParse}j("H",["HH",2],0,"hour"),j("h",["hh",2],0,Qt),j("k",["kk",2],0,function(){return this.hours()||24}),j("hmm",0,0,function(){return""+Qt.apply(this)+z(this.minutes(),2)}),j("hmmss",0,0,function(){return""+Qt.apply(this)+z(this.minutes(),2)+z(this.seconds(),2)}),j("Hmm",0,0,function(){return""+this.hours()+z(this.minutes(),2)}),j("Hmmss",0,0,function(){return""+this.hours()+z(this.minutes(),2)+z(this.seconds(),2)}),te("a",!0),te("A",!1),R("hour","h"),N("hour",13),dt("a",ee),dt("A",ee),dt("H",$),dt("h",$),dt("k",$),dt("HH",$,Z),dt("hh",$,Z),dt("kk",$,Z),dt("hmm",Q),dt("hmmss",tt),dt("Hmm",Q),dt("Hmmss",tt),gt(["H","HH"],bt),gt(["k","kk"],function(t,e,i){var n=w(t);e[bt]=24===n?0:n}),gt(["a","A"],function(t,e,i){i._isPm=i._locale.isPM(t),i._meridiem=t}),gt(["h","hh"],function(t,e,i){e[bt]=w(t),g(i).bigHour=!0}),gt("hmm",function(t,e,i){var n=t.length-2;e[bt]=w(t.substr(0,n)),e[xt]=w(t.substr(n)),g(i).bigHour=!0}),gt("hmmss",function(t,e,i){var n=t.length-4,a=t.length-2;e[bt]=w(t.substr(0,n)),e[xt]=w(t.substr(n,2)),e[_t]=w(t.substr(a)),g(i).bigHour=!0}),gt("Hmm",function(t,e,i){var n=t.length-2;e[bt]=w(t.substr(0,n)),e[xt]=w(t.substr(n))}),gt("Hmmss",function(t,e,i){var n=t.length-4,a=t.length-2;e[bt]=w(t.substr(0,n)),e[xt]=w(t.substr(n,2)),e[_t]=w(t.substr(a))});var ie,ne=Tt("Hours",!0),ae={calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},longDateFormat:{LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},invalidDate:"Invalid date",ordinal:"%d",dayOfMonthOrdinalParse:/\d{1,2}/,relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",ss:"%d seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},months:Rt,monthsShort:Lt,week:{dow:0,doy:6},weekdays:qt,weekdaysMin:Zt,weekdaysShort:Gt,meridiemParse:/[ap]\.?m?\.?/i},re={},oe={};function se(t){return t?t.toLowerCase().replace("_","-"):t}function le(i){var n=null;if(!re[i]&&void 0!==e&&e&&e.exports)try{n=ie._abbr,t("./locale/"+i),ue(n)}catch(t){}return re[i]}function ue(t,e){var i;return t&&(i=s(e)?he(t):de(t,e))&&(ie=i),ie._abbr}function de(t,e){if(null!==e){var i=ae;if(e.abbr=t,null!=re[t])T("defineLocaleOverride","use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."),i=re[t]._config;else if(null!=e.parentLocale){if(null==re[e.parentLocale])return oe[e.parentLocale]||(oe[e.parentLocale]=[]),oe[e.parentLocale].push({name:t,config:e}),null;i=re[e.parentLocale]._config}return re[t]=new A(I(i,e)),oe[t]&&oe[t].forEach(function(t){de(t.name,t.config)}),ue(t),re[t]}return delete re[t],null}function he(t){var e;if(t&&t._locale&&t._locale._abbr&&(t=t._locale._abbr),!t)return ie;if(!r(t)){if(e=le(t))return e;t=[t]}return function(t){for(var e,i,n,a,r=0;r<t.length;){for(e=(a=se(t[r]).split("-")).length,i=(i=se(t[r+1]))?i.split("-"):null;e>0;){if(n=le(a.slice(0,e).join("-")))return n;if(i&&i.length>=e&&M(a,i,!0)>=e-1)break;e--}r++}return null}(t)}function ce(t){var e,i=t._a;return i&&-2===g(t).overflow&&(e=i[vt]<0||i[vt]>11?vt:i[yt]<1||i[yt]>At(i[pt],i[vt])?yt:i[bt]<0||i[bt]>24||24===i[bt]&&(0!==i[xt]||0!==i[_t]||0!==i[kt])?bt:i[xt]<0||i[xt]>59?xt:i[_t]<0||i[_t]>59?_t:i[kt]<0||i[kt]>999?kt:-1,g(t)._overflowDayOfYear&&(e<pt||e>yt)&&(e=yt),g(t)._overflowWeeks&&-1===e&&(e=wt),g(t)._overflowWeekday&&-1===e&&(e=Mt),g(t).overflow=e),t}function fe(t,e,i){return null!=t?t:null!=e?e:i}function ge(t){var e,i,n,r,o,s=[];if(!t._d){var l,u;for(l=t,u=new Date(a.now()),n=l._useUTC?[u.getUTCFullYear(),u.getUTCMonth(),u.getUTCDate()]:[u.getFullYear(),u.getMonth(),u.getDate()],t._w&&null==t._a[yt]&&null==t._a[vt]&&function(t){var e,i,n,a,r,o,s,l;if(null!=(e=t._w).GG||null!=e.W||null!=e.E)r=1,o=4,i=fe(e.GG,t._a[pt],jt(Te(),1,4).year),n=fe(e.W,1),((a=fe(e.E,1))<1||a>7)&&(l=!0);else{r=t._locale._week.dow,o=t._locale._week.doy;var u=jt(Te(),r,o);i=fe(e.gg,t._a[pt],u.year),n=fe(e.w,u.week),null!=e.d?((a=e.d)<0||a>6)&&(l=!0):null!=e.e?(a=e.e+r,(e.e<0||e.e>6)&&(l=!0)):a=r}n<1||n>Ut(i,r,o)?g(t)._overflowWeeks=!0:null!=l?g(t)._overflowWeekday=!0:(s=Et(i,n,a,r,o),t._a[pt]=s.year,t._dayOfYear=s.dayOfYear)}(t),null!=t._dayOfYear&&(o=fe(t._a[pt],n[pt]),(t._dayOfYear>St(o)||0===t._dayOfYear)&&(g(t)._overflowDayOfYear=!0),i=Vt(o,0,t._dayOfYear),t._a[vt]=i.getUTCMonth(),t._a[yt]=i.getUTCDate()),e=0;e<3&&null==t._a[e];++e)t._a[e]=s[e]=n[e];for(;e<7;e++)t._a[e]=s[e]=null==t._a[e]?2===e?1:0:t._a[e];24===t._a[bt]&&0===t._a[xt]&&0===t._a[_t]&&0===t._a[kt]&&(t._nextDay=!0,t._a[bt]=0),t._d=(t._useUTC?Vt:function(t,e,i,n,a,r,o){var s=new Date(t,e,i,n,a,r,o);return t<100&&t>=0&&isFinite(s.getFullYear())&&s.setFullYear(t),s}).apply(null,s),r=t._useUTC?t._d.getUTCDay():t._d.getDay(),null!=t._tzm&&t._d.setUTCMinutes(t._d.getUTCMinutes()-t._tzm),t._nextDay&&(t._a[bt]=24),t._w&&void 0!==t._w.d&&t._w.d!==r&&(g(t).weekdayMismatch=!0)}}var me=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,pe=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,ve=/Z|[+-]\d\d(?::?\d\d)?/,ye=[["YYYYYY-MM-DD",/[+-]\d{6}-\d\d-\d\d/],["YYYY-MM-DD",/\d{4}-\d\d-\d\d/],["GGGG-[W]WW-E",/\d{4}-W\d\d-\d/],["GGGG-[W]WW",/\d{4}-W\d\d/,!1],["YYYY-DDD",/\d{4}-\d{3}/],["YYYY-MM",/\d{4}-\d\d/,!1],["YYYYYYMMDD",/[+-]\d{10}/],["YYYYMMDD",/\d{8}/],["GGGG[W]WWE",/\d{4}W\d{3}/],["GGGG[W]WW",/\d{4}W\d{2}/,!1],["YYYYDDD",/\d{7}/]],be=[["HH:mm:ss.SSSS",/\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss,SSSS",/\d\d:\d\d:\d\d,\d+/],["HH:mm:ss",/\d\d:\d\d:\d\d/],["HH:mm",/\d\d:\d\d/],["HHmmss.SSSS",/\d\d\d\d\d\d\.\d+/],["HHmmss,SSSS",/\d\d\d\d\d\d,\d+/],["HHmmss",/\d\d\d\d\d\d/],["HHmm",/\d\d\d\d/],["HH",/\d\d/]],xe=/^\/?Date\((\-?\d+)/i;function _e(t){var e,i,n,a,r,o,s=t._i,l=me.exec(s)||pe.exec(s);if(l){for(g(t).iso=!0,e=0,i=ye.length;e<i;e++)if(ye[e][1].exec(l[1])){a=ye[e][0],n=!1!==ye[e][2];break}if(null==a)return void(t._isValid=!1);if(l[3]){for(e=0,i=be.length;e<i;e++)if(be[e][1].exec(l[3])){r=(l[2]||" ")+be[e][0];break}if(null==r)return void(t._isValid=!1)}if(!n&&null!=r)return void(t._isValid=!1);if(l[4]){if(!ve.exec(l[4]))return void(t._isValid=!1);o="Z"}t._f=a+(r||"")+(o||""),De(t)}else t._isValid=!1}var ke=/^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;function we(t,e,i,n,a,r){var o=[function(t){var e=parseInt(t,10);{if(e<=49)return 2e3+e;if(e<=999)return 1900+e}return e}(t),Lt.indexOf(e),parseInt(i,10),parseInt(n,10),parseInt(a,10)];return r&&o.push(parseInt(r,10)),o}var Me={UT:0,GMT:0,EDT:-240,EST:-300,CDT:-300,CST:-360,MDT:-360,MST:-420,PDT:-420,PST:-480};function Se(t){var e,i,n,a=ke.exec(t._i.replace(/\([^)]*\)|[\n\t]/g," ").replace(/(\s\s+)/g," ").trim());if(a){var r=we(a[4],a[3],a[2],a[5],a[6],a[7]);if(e=a[1],i=r,n=t,e&&Gt.indexOf(e)!==new Date(i[0],i[1],i[2]).getDay()&&(g(n).weekdayMismatch=!0,n._isValid=!1,1))return;t._a=r,t._tzm=function(t,e,i){if(t)return Me[t];if(e)return 0;var n=parseInt(i,10),a=n%100;return(n-a)/100*60+a}(a[8],a[9],a[10]),t._d=Vt.apply(null,t._a),t._d.setUTCMinutes(t._d.getUTCMinutes()-t._tzm),g(t).rfc2822=!0}else t._isValid=!1}function De(t){if(t._f!==a.ISO_8601)if(t._f!==a.RFC_2822){t._a=[],g(t).empty=!0;var e,i,n,r,o,s,l,u,d=""+t._i,c=d.length,f=0;for(n=q(t._f,t._locale).match(H)||[],e=0;e<n.length;e++)r=n[e],(i=(d.match(ht(r,t))||[])[0])&&((o=d.substr(0,d.indexOf(i))).length>0&&g(t).unusedInput.push(o),d=d.slice(d.indexOf(i)+i.length),f+=i.length),E[r]?(i?g(t).empty=!1:g(t).unusedTokens.push(r),s=r,u=t,null!=(l=i)&&h(ft,s)&&ft[s](l,u._a,u,s)):t._strict&&!i&&g(t).unusedTokens.push(r);g(t).charsLeftOver=c-f,d.length>0&&g(t).unusedInput.push(d),t._a[bt]<=12&&!0===g(t).bigHour&&t._a[bt]>0&&(g(t).bigHour=void 0),g(t).parsedDateParts=t._a.slice(0),g(t).meridiem=t._meridiem,t._a[bt]=function(t,e,i){var n;if(null==i)return e;return null!=t.meridiemHour?t.meridiemHour(e,i):null!=t.isPM?((n=t.isPM(i))&&e<12&&(e+=12),n||12!==e||(e=0),e):e}(t._locale,t._a[bt],t._meridiem),ge(t),ce(t)}else Se(t);else _e(t)}function Ce(t){var e,i,n,h,f=t._i,v=t._f;return t._locale=t._locale||he(t._l),null===f||void 0===v&&""===f?p({nullInput:!0}):("string"==typeof f&&(t._i=f=t._locale.preparse(f)),_(f)?new x(ce(f)):(u(f)?t._d=f:r(v)?function(t){var e,i,n,a,r;if(0===t._f.length)return g(t).invalidFormat=!0,void(t._d=new Date(NaN));for(a=0;a<t._f.length;a++)r=0,e=y({},t),null!=t._useUTC&&(e._useUTC=t._useUTC),e._f=t._f[a],De(e),m(e)&&(r+=g(e).charsLeftOver,r+=10*g(e).unusedTokens.length,g(e).score=r,(null==n||r<n)&&(n=r,i=e));c(t,i||e)}(t):v?De(t):s(i=(e=t)._i)?e._d=new Date(a.now()):u(i)?e._d=new Date(i.valueOf()):"string"==typeof i?(n=e,null===(h=xe.exec(n._i))?(_e(n),!1===n._isValid&&(delete n._isValid,Se(n),!1===n._isValid&&(delete n._isValid,a.createFromInputFallback(n)))):n._d=new Date(+h[1])):r(i)?(e._a=d(i.slice(0),function(t){return parseInt(t,10)}),ge(e)):o(i)?function(t){if(!t._d){var e=W(t._i);t._a=d([e.year,e.month,e.day||e.date,e.hour,e.minute,e.second,e.millisecond],function(t){return t&&parseInt(t,10)}),ge(t)}}(e):l(i)?e._d=new Date(i):a.createFromInputFallback(e),m(t)||(t._d=null),t))}function Pe(t,e,i,n,a){var s,l={};return!0!==i&&!1!==i||(n=i,i=void 0),(o(t)&&function(t){if(Object.getOwnPropertyNames)return 0===Object.getOwnPropertyNames(t).length;var e;for(e in t)if(t.hasOwnProperty(e))return!1;return!0}(t)||r(t)&&0===t.length)&&(t=void 0),l._isAMomentObject=!0,l._useUTC=l._isUTC=a,l._l=i,l._i=t,l._f=e,l._strict=n,(s=new x(ce(Ce(l))))._nextDay&&(s.add(1,"d"),s._nextDay=void 0),s}function Te(t,e,i,n){return Pe(t,e,i,n,!1)}a.createFromInputFallback=D("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged and will be removed in an upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",function(t){t._d=new Date(t._i+(t._useUTC?" UTC":""))}),a.ISO_8601=function(){},a.RFC_2822=function(){};var Oe=D("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var t=Te.apply(null,arguments);return this.isValid()&&t.isValid()?t<this?this:t:p()}),Ie=D("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var t=Te.apply(null,arguments);return this.isValid()&&t.isValid()?t>this?this:t:p()});function Ae(t,e){var i,n;if(1===e.length&&r(e[0])&&(e=e[0]),!e.length)return Te();for(i=e[0],n=1;n<e.length;++n)e[n].isValid()&&!e[n][t](i)||(i=e[n]);return i}var Fe=["year","quarter","month","week","day","hour","minute","second","millisecond"];function Re(t){var e=W(t),i=e.year||0,n=e.quarter||0,a=e.month||0,r=e.week||0,o=e.day||0,s=e.hour||0,l=e.minute||0,u=e.second||0,d=e.millisecond||0;this._isValid=function(t){for(var e in t)if(-1===Ct.call(Fe,e)||null!=t[e]&&isNaN(t[e]))return!1;for(var i=!1,n=0;n<Fe.length;++n)if(t[Fe[n]]){if(i)return!1;parseFloat(t[Fe[n]])!==w(t[Fe[n]])&&(i=!0)}return!0}(e),this._milliseconds=+d+1e3*u+6e4*l+1e3*s*60*60,this._days=+o+7*r,this._months=+a+3*n+12*i,this._data={},this._locale=he(),this._bubble()}function Le(t){return t instanceof Re}function We(t){return t<0?-1*Math.round(-1*t):Math.round(t)}function Ye(t,e){j(t,0,0,function(){var t=this.utcOffset(),i="+";return t<0&&(t=-t,i="-"),i+z(~~(t/60),2)+e+z(~~t%60,2)})}Ye("Z",":"),Ye("ZZ",""),dt("Z",st),dt("ZZ",st),gt(["Z","ZZ"],function(t,e,i){i._useUTC=!0,i._tzm=ze(st,t)});var Ne=/([\+\-]|\d\d)/gi;function ze(t,e){var i=(e||"").match(t);if(null===i)return null;var n=((i[i.length-1]||[])+"").match(Ne)||["-",0,0],a=60*n[1]+w(n[2]);return 0===a?0:"+"===n[0]?a:-a}function He(t,e){var i,n;return e._isUTC?(i=e.clone(),n=(_(t)||u(t)?t.valueOf():Te(t).valueOf())-i.valueOf(),i._d.setTime(i._d.valueOf()+n),a.updateOffset(i,!1),i):Te(t).local()}function Ve(t){return 15*-Math.round(t._d.getTimezoneOffset()/15)}function Be(){return!!this.isValid()&&(this._isUTC&&0===this._offset)}a.updateOffset=function(){};var Ee=/^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/,je=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;function Ue(t,e){var i,n,a,r=t,o=null;return Le(t)?r={ms:t._milliseconds,d:t._days,M:t._months}:l(t)?(r={},e?r[e]=t:r.milliseconds=t):(o=Ee.exec(t))?(i="-"===o[1]?-1:1,r={y:0,d:w(o[yt])*i,h:w(o[bt])*i,m:w(o[xt])*i,s:w(o[_t])*i,ms:w(We(1e3*o[kt]))*i}):(o=je.exec(t))?(i="-"===o[1]?-1:(o[1],1),r={y:qe(o[2],i),M:qe(o[3],i),w:qe(o[4],i),d:qe(o[5],i),h:qe(o[6],i),m:qe(o[7],i),s:qe(o[8],i)}):null==r?r={}:"object"==typeof r&&("from"in r||"to"in r)&&(a=function(t,e){var i;if(!t.isValid()||!e.isValid())return{milliseconds:0,months:0};e=He(e,t),t.isBefore(e)?i=Ge(t,e):((i=Ge(e,t)).milliseconds=-i.milliseconds,i.months=-i.months);return i}(Te(r.from),Te(r.to)),(r={}).ms=a.milliseconds,r.M=a.months),n=new Re(r),Le(t)&&h(t,"_locale")&&(n._locale=t._locale),n}function qe(t,e){var i=t&&parseFloat(t.replace(",","."));return(isNaN(i)?0:i)*e}function Ge(t,e){var i={milliseconds:0,months:0};return i.months=e.month()-t.month()+12*(e.year()-t.year()),t.clone().add(i.months,"M").isAfter(e)&&--i.months,i.milliseconds=+e-+t.clone().add(i.months,"M"),i}function Ze(t,e){return function(i,n){var a;return null===n||isNaN(+n)||(T(e,"moment()."+e+"(period, number) is deprecated. Please use moment()."+e+"(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."),a=i,i=n,n=a),Xe(this,Ue(i="string"==typeof i?+i:i,n),t),this}}function Xe(t,e,i,n){var r=e._milliseconds,o=We(e._days),s=We(e._months);t.isValid()&&(n=null==n||n,s&&Wt(t,Ot(t,"Month")+s*i),o&&It(t,"Date",Ot(t,"Date")+o*i),r&&t._d.setTime(t._d.valueOf()+r*i),n&&a.updateOffset(t,o||s))}Ue.fn=Re.prototype,Ue.invalid=function(){return Ue(NaN)};var Je=Ze(1,"add"),Ke=Ze(-1,"subtract");function $e(t,e){var i=12*(e.year()-t.year())+(e.month()-t.month()),n=t.clone().add(i,"months");return-(i+(e-n<0?(e-n)/(n-t.clone().add(i-1,"months")):(e-n)/(t.clone().add(i+1,"months")-n)))||0}function Qe(t){var e;return void 0===t?this._locale._abbr:(null!=(e=he(t))&&(this._locale=e),this)}a.defaultFormat="YYYY-MM-DDTHH:mm:ssZ",a.defaultFormatUtc="YYYY-MM-DDTHH:mm:ss[Z]";var ti=D("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(t){return void 0===t?this.localeData():this.locale(t)});function ei(){return this._locale}function ii(t,e){j(0,[t,t.length],0,e)}function ni(t,e,i,n,a){var r;return null==t?jt(this,n,a).year:(e>(r=Ut(t,n,a))&&(e=r),function(t,e,i,n,a){var r=Et(t,e,i,n,a),o=Vt(r.year,0,r.dayOfYear);return this.year(o.getUTCFullYear()),this.month(o.getUTCMonth()),this.date(o.getUTCDate()),this}.call(this,t,e,i,n,a))}j(0,["gg",2],0,function(){return this.weekYear()%100}),j(0,["GG",2],0,function(){return this.isoWeekYear()%100}),ii("gggg","weekYear"),ii("ggggg","weekYear"),ii("GGGG","isoWeekYear"),ii("GGGGG","isoWeekYear"),R("weekYear","gg"),R("isoWeekYear","GG"),N("weekYear",1),N("isoWeekYear",1),dt("G",rt),dt("g",rt),dt("GG",$,Z),dt("gg",$,Z),dt("GGGG",it,J),dt("gggg",it,J),dt("GGGGG",nt,K),dt("ggggg",nt,K),mt(["gggg","ggggg","GGGG","GGGGG"],function(t,e,i,n){e[n.substr(0,2)]=w(t)}),mt(["gg","GG"],function(t,e,i,n){e[n]=a.parseTwoDigitYear(t)}),j("Q",0,"Qo","quarter"),R("quarter","Q"),N("quarter",7),dt("Q",G),gt("Q",function(t,e){e[vt]=3*(w(t)-1)}),j("D",["DD",2],"Do","date"),R("date","D"),N("date",9),dt("D",$),dt("DD",$,Z),dt("Do",function(t,e){return t?e._dayOfMonthOrdinalParse||e._ordinalParse:e._dayOfMonthOrdinalParseLenient}),gt(["D","DD"],yt),gt("Do",function(t,e){e[yt]=w(t.match($)[0])});var ai=Tt("Date",!0);j("DDD",["DDDD",3],"DDDo","dayOfYear"),R("dayOfYear","DDD"),N("dayOfYear",4),dt("DDD",et),dt("DDDD",X),gt(["DDD","DDDD"],function(t,e,i){i._dayOfYear=w(t)}),j("m",["mm",2],0,"minute"),R("minute","m"),N("minute",14),dt("m",$),dt("mm",$,Z),gt(["m","mm"],xt);var ri=Tt("Minutes",!1);j("s",["ss",2],0,"second"),R("second","s"),N("second",15),dt("s",$),dt("ss",$,Z),gt(["s","ss"],_t);var oi,si=Tt("Seconds",!1);for(j("S",0,0,function(){return~~(this.millisecond()/100)}),j(0,["SS",2],0,function(){return~~(this.millisecond()/10)}),j(0,["SSS",3],0,"millisecond"),j(0,["SSSS",4],0,function(){return 10*this.millisecond()}),j(0,["SSSSS",5],0,function(){return 100*this.millisecond()}),j(0,["SSSSSS",6],0,function(){return 1e3*this.millisecond()}),j(0,["SSSSSSS",7],0,function(){return 1e4*this.millisecond()}),j(0,["SSSSSSSS",8],0,function(){return 1e5*this.millisecond()}),j(0,["SSSSSSSSS",9],0,function(){return 1e6*this.millisecond()}),R("millisecond","ms"),N("millisecond",16),dt("S",et,G),dt("SS",et,Z),dt("SSS",et,X),oi="SSSS";oi.length<=9;oi+="S")dt(oi,at);function li(t,e){e[kt]=w(1e3*("0."+t))}for(oi="S";oi.length<=9;oi+="S")gt(oi,li);var ui=Tt("Milliseconds",!1);j("z",0,0,"zoneAbbr"),j("zz",0,0,"zoneName");var di=x.prototype;function hi(t){return t}di.add=Je,di.calendar=function(t,e){var i=t||Te(),n=He(i,this).startOf("day"),r=a.calendarFormat(this,n)||"sameElse",o=e&&(O(e[r])?e[r].call(this,i):e[r]);return this.format(o||this.localeData().calendar(r,this,Te(i)))},di.clone=function(){return new x(this)},di.diff=function(t,e,i){var n,a,r;if(!this.isValid())return NaN;if(!(n=He(t,this)).isValid())return NaN;switch(a=6e4*(n.utcOffset()-this.utcOffset()),e=L(e)){case"year":r=$e(this,n)/12;break;case"month":r=$e(this,n);break;case"quarter":r=$e(this,n)/3;break;case"second":r=(this-n)/1e3;break;case"minute":r=(this-n)/6e4;break;case"hour":r=(this-n)/36e5;break;case"day":r=(this-n-a)/864e5;break;case"week":r=(this-n-a)/6048e5;break;default:r=this-n}return i?r:k(r)},di.endOf=function(t){return void 0===(t=L(t))||"millisecond"===t?this:("date"===t&&(t="day"),this.startOf(t).add(1,"isoWeek"===t?"week":t).subtract(1,"ms"))},di.format=function(t){t||(t=this.isUtc()?a.defaultFormatUtc:a.defaultFormat);var e=U(this,t);return this.localeData().postformat(e)},di.from=function(t,e){return this.isValid()&&(_(t)&&t.isValid()||Te(t).isValid())?Ue({to:this,from:t}).locale(this.locale()).humanize(!e):this.localeData().invalidDate()},di.fromNow=function(t){return this.from(Te(),t)},di.to=function(t,e){return this.isValid()&&(_(t)&&t.isValid()||Te(t).isValid())?Ue({from:this,to:t}).locale(this.locale()).humanize(!e):this.localeData().invalidDate()},di.toNow=function(t){return this.to(Te(),t)},di.get=function(t){return O(this[t=L(t)])?this[t]():this},di.invalidAt=function(){return g(this).overflow},di.isAfter=function(t,e){var i=_(t)?t:Te(t);return!(!this.isValid()||!i.isValid())&&("millisecond"===(e=L(s(e)?"millisecond":e))?this.valueOf()>i.valueOf():i.valueOf()<this.clone().startOf(e).valueOf())},di.isBefore=function(t,e){var i=_(t)?t:Te(t);return!(!this.isValid()||!i.isValid())&&("millisecond"===(e=L(s(e)?"millisecond":e))?this.valueOf()<i.valueOf():this.clone().endOf(e).valueOf()<i.valueOf())},di.isBetween=function(t,e,i,n){return("("===(n=n||"()")[0]?this.isAfter(t,i):!this.isBefore(t,i))&&(")"===n[1]?this.isBefore(e,i):!this.isAfter(e,i))},di.isSame=function(t,e){var i,n=_(t)?t:Te(t);return!(!this.isValid()||!n.isValid())&&("millisecond"===(e=L(e||"millisecond"))?this.valueOf()===n.valueOf():(i=n.valueOf(),this.clone().startOf(e).valueOf()<=i&&i<=this.clone().endOf(e).valueOf()))},di.isSameOrAfter=function(t,e){return this.isSame(t,e)||this.isAfter(t,e)},di.isSameOrBefore=function(t,e){return this.isSame(t,e)||this.isBefore(t,e)},di.isValid=function(){return m(this)},di.lang=ti,di.locale=Qe,di.localeData=ei,di.max=Ie,di.min=Oe,di.parsingFlags=function(){return c({},g(this))},di.set=function(t,e){if("object"==typeof t)for(var i=function(t){var e=[];for(var i in t)e.push({unit:i,priority:Y[i]});return e.sort(function(t,e){return t.priority-e.priority}),e}(t=W(t)),n=0;n<i.length;n++)this[i[n].unit](t[i[n].unit]);else if(O(this[t=L(t)]))return this[t](e);return this},di.startOf=function(t){switch(t=L(t)){case"year":this.month(0);case"quarter":case"month":this.date(1);case"week":case"isoWeek":case"day":case"date":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===t&&this.weekday(0),"isoWeek"===t&&this.isoWeekday(1),"quarter"===t&&this.month(3*Math.floor(this.month()/3)),this},di.subtract=Ke,di.toArray=function(){var t=this;return[t.year(),t.month(),t.date(),t.hour(),t.minute(),t.second(),t.millisecond()]},di.toObject=function(){var t=this;return{years:t.year(),months:t.month(),date:t.date(),hours:t.hours(),minutes:t.minutes(),seconds:t.seconds(),milliseconds:t.milliseconds()}},di.toDate=function(){return new Date(this.valueOf())},di.toISOString=function(t){if(!this.isValid())return null;var e=!0!==t,i=e?this.clone().utc():this;return i.year()<0||i.year()>9999?U(i,e?"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]":"YYYYYY-MM-DD[T]HH:mm:ss.SSSZ"):O(Date.prototype.toISOString)?e?this.toDate().toISOString():new Date(this._d.valueOf()).toISOString().replace("Z",U(i,"Z")):U(i,e?"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]":"YYYY-MM-DD[T]HH:mm:ss.SSSZ")},di.inspect=function(){if(!this.isValid())return"moment.invalid(/* "+this._i+" */)";var t="moment",e="";this.isLocal()||(t=0===this.utcOffset()?"moment.utc":"moment.parseZone",e="Z");var i="["+t+'("]',n=0<=this.year()&&this.year()<=9999?"YYYY":"YYYYYY",a=e+'[")]';return this.format(i+n+"-MM-DD[T]HH:mm:ss.SSS"+a)},di.toJSON=function(){return this.isValid()?this.toISOString():null},di.toString=function(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")},di.unix=function(){return Math.floor(this.valueOf()/1e3)},di.valueOf=function(){return this._d.valueOf()-6e4*(this._offset||0)},di.creationData=function(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict}},di.year=Pt,di.isLeapYear=function(){return Dt(this.year())},di.weekYear=function(t){return ni.call(this,t,this.week(),this.weekday(),this.localeData()._week.dow,this.localeData()._week.doy)},di.isoWeekYear=function(t){return ni.call(this,t,this.isoWeek(),this.isoWeekday(),1,4)},di.quarter=di.quarters=function(t){return null==t?Math.ceil((this.month()+1)/3):this.month(3*(t-1)+this.month()%3)},di.month=Yt,di.daysInMonth=function(){return At(this.year(),this.month())},di.week=di.weeks=function(t){var e=this.localeData().week(this);return null==t?e:this.add(7*(t-e),"d")},di.isoWeek=di.isoWeeks=function(t){var e=jt(this,1,4).week;return null==t?e:this.add(7*(t-e),"d")},di.weeksInYear=function(){var t=this.localeData()._week;return Ut(this.year(),t.dow,t.doy)},di.isoWeeksInYear=function(){return Ut(this.year(),1,4)},di.date=ai,di.day=di.days=function(t){if(!this.isValid())return null!=t?this:NaN;var e,i,n=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=t?(e=t,i=this.localeData(),t="string"!=typeof e?e:isNaN(e)?"number"==typeof(e=i.weekdaysParse(e))?e:null:parseInt(e,10),this.add(t-n,"d")):n},di.weekday=function(t){if(!this.isValid())return null!=t?this:NaN;var e=(this.day()+7-this.localeData()._week.dow)%7;return null==t?e:this.add(t-e,"d")},di.isoWeekday=function(t){if(!this.isValid())return null!=t?this:NaN;if(null!=t){var e=(i=t,n=this.localeData(),"string"==typeof i?n.weekdaysParse(i)%7||7:isNaN(i)?null:i);return this.day(this.day()%7?e:e-7)}return this.day()||7;var i,n},di.dayOfYear=function(t){var e=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==t?e:this.add(t-e,"d")},di.hour=di.hours=ne,di.minute=di.minutes=ri,di.second=di.seconds=si,di.millisecond=di.milliseconds=ui,di.utcOffset=function(t,e,i){var n,r=this._offset||0;if(!this.isValid())return null!=t?this:NaN;if(null!=t){if("string"==typeof t){if(null===(t=ze(st,t)))return this}else Math.abs(t)<16&&!i&&(t*=60);return!this._isUTC&&e&&(n=Ve(this)),this._offset=t,this._isUTC=!0,null!=n&&this.add(n,"m"),r!==t&&(!e||this._changeInProgress?Xe(this,Ue(t-r,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,a.updateOffset(this,!0),this._changeInProgress=null)),this}return this._isUTC?r:Ve(this)},di.utc=function(t){return this.utcOffset(0,t)},di.local=function(t){return this._isUTC&&(this.utcOffset(0,t),this._isUTC=!1,t&&this.subtract(Ve(this),"m")),this},di.parseZone=function(){if(null!=this._tzm)this.utcOffset(this._tzm,!1,!0);else if("string"==typeof this._i){var t=ze(ot,this._i);null!=t?this.utcOffset(t):this.utcOffset(0,!0)}return this},di.hasAlignedHourOffset=function(t){return!!this.isValid()&&(t=t?Te(t).utcOffset():0,(this.utcOffset()-t)%60==0)},di.isDST=function(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()},di.isLocal=function(){return!!this.isValid()&&!this._isUTC},di.isUtcOffset=function(){return!!this.isValid()&&this._isUTC},di.isUtc=Be,di.isUTC=Be,di.zoneAbbr=function(){return this._isUTC?"UTC":""},di.zoneName=function(){return this._isUTC?"Coordinated Universal Time":""},di.dates=D("dates accessor is deprecated. Use date instead.",ai),di.months=D("months accessor is deprecated. Use month instead",Yt),di.years=D("years accessor is deprecated. Use year instead",Pt),di.zone=D("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",function(t,e){return null!=t?("string"!=typeof t&&(t=-t),this.utcOffset(t,e),this):-this.utcOffset()}),di.isDSTShifted=D("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",function(){if(!s(this._isDSTShifted))return this._isDSTShifted;var t={};if(y(t,this),(t=Ce(t))._a){var e=t._isUTC?f(t._a):Te(t._a);this._isDSTShifted=this.isValid()&&M(t._a,e.toArray())>0}else this._isDSTShifted=!1;return this._isDSTShifted});var ci=A.prototype;function fi(t,e,i,n){var a=he(),r=f().set(n,e);return a[i](r,t)}function gi(t,e,i){if(l(t)&&(e=t,t=void 0),t=t||"",null!=e)return fi(t,e,i,"month");var n,a=[];for(n=0;n<12;n++)a[n]=fi(t,n,i,"month");return a}function mi(t,e,i,n){"boolean"==typeof t?(l(e)&&(i=e,e=void 0),e=e||""):(i=e=t,t=!1,l(e)&&(i=e,e=void 0),e=e||"");var a,r=he(),o=t?r._week.dow:0;if(null!=i)return fi(e,(i+o)%7,n,"day");var s=[];for(a=0;a<7;a++)s[a]=fi(e,(a+o)%7,n,"day");return s}ci.calendar=function(t,e,i){var n=this._calendar[t]||this._calendar.sameElse;return O(n)?n.call(e,i):n},ci.longDateFormat=function(t){var e=this._longDateFormat[t],i=this._longDateFormat[t.toUpperCase()];return e||!i?e:(this._longDateFormat[t]=i.replace(/MMMM|MM|DD|dddd/g,function(t){return t.slice(1)}),this._longDateFormat[t])},ci.invalidDate=function(){return this._invalidDate},ci.ordinal=function(t){return this._ordinal.replace("%d",t)},ci.preparse=hi,ci.postformat=hi,ci.relativeTime=function(t,e,i,n){var a=this._relativeTime[i];return O(a)?a(t,e,i,n):a.replace(/%d/i,t)},ci.pastFuture=function(t,e){var i=this._relativeTime[t>0?"future":"past"];return O(i)?i(e):i.replace(/%s/i,e)},ci.set=function(t){var e,i;for(i in t)O(e=t[i])?this[i]=e:this["_"+i]=e;this._config=t,this._dayOfMonthOrdinalParseLenient=new RegExp((this._dayOfMonthOrdinalParse.source||this._ordinalParse.source)+"|"+/\d{1,2}/.source)},ci.months=function(t,e){return t?r(this._months)?this._months[t.month()]:this._months[(this._months.isFormat||Ft).test(e)?"format":"standalone"][t.month()]:r(this._months)?this._months:this._months.standalone},ci.monthsShort=function(t,e){return t?r(this._monthsShort)?this._monthsShort[t.month()]:this._monthsShort[Ft.test(e)?"format":"standalone"][t.month()]:r(this._monthsShort)?this._monthsShort:this._monthsShort.standalone},ci.monthsParse=function(t,e,i){var n,a,r;if(this._monthsParseExact)return function(t,e,i){var n,a,r,o=t.toLocaleLowerCase();if(!this._monthsParse)for(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[],n=0;n<12;++n)r=f([2e3,n]),this._shortMonthsParse[n]=this.monthsShort(r,"").toLocaleLowerCase(),this._longMonthsParse[n]=this.months(r,"").toLocaleLowerCase();return i?"MMM"===e?-1!==(a=Ct.call(this._shortMonthsParse,o))?a:null:-1!==(a=Ct.call(this._longMonthsParse,o))?a:null:"MMM"===e?-1!==(a=Ct.call(this._shortMonthsParse,o))?a:-1!==(a=Ct.call(this._longMonthsParse,o))?a:null:-1!==(a=Ct.call(this._longMonthsParse,o))?a:-1!==(a=Ct.call(this._shortMonthsParse,o))?a:null}.call(this,t,e,i);for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),n=0;n<12;n++){if(a=f([2e3,n]),i&&!this._longMonthsParse[n]&&(this._longMonthsParse[n]=new RegExp("^"+this.months(a,"").replace(".","")+"$","i"),this._shortMonthsParse[n]=new RegExp("^"+this.monthsShort(a,"").replace(".","")+"$","i")),i||this._monthsParse[n]||(r="^"+this.months(a,"")+"|^"+this.monthsShort(a,""),this._monthsParse[n]=new RegExp(r.replace(".",""),"i")),i&&"MMMM"===e&&this._longMonthsParse[n].test(t))return n;if(i&&"MMM"===e&&this._shortMonthsParse[n].test(t))return n;if(!i&&this._monthsParse[n].test(t))return n}},ci.monthsRegex=function(t){return this._monthsParseExact?(h(this,"_monthsRegex")||Ht.call(this),t?this._monthsStrictRegex:this._monthsRegex):(h(this,"_monthsRegex")||(this._monthsRegex=zt),this._monthsStrictRegex&&t?this._monthsStrictRegex:this._monthsRegex)},ci.monthsShortRegex=function(t){return this._monthsParseExact?(h(this,"_monthsRegex")||Ht.call(this),t?this._monthsShortStrictRegex:this._monthsShortRegex):(h(this,"_monthsShortRegex")||(this._monthsShortRegex=Nt),this._monthsShortStrictRegex&&t?this._monthsShortStrictRegex:this._monthsShortRegex)},ci.week=function(t){return jt(t,this._week.dow,this._week.doy).week},ci.firstDayOfYear=function(){return this._week.doy},ci.firstDayOfWeek=function(){return this._week.dow},ci.weekdays=function(t,e){return t?r(this._weekdays)?this._weekdays[t.day()]:this._weekdays[this._weekdays.isFormat.test(e)?"format":"standalone"][t.day()]:r(this._weekdays)?this._weekdays:this._weekdays.standalone},ci.weekdaysMin=function(t){return t?this._weekdaysMin[t.day()]:this._weekdaysMin},ci.weekdaysShort=function(t){return t?this._weekdaysShort[t.day()]:this._weekdaysShort},ci.weekdaysParse=function(t,e,i){var n,a,r;if(this._weekdaysParseExact)return function(t,e,i){var n,a,r,o=t.toLocaleLowerCase();if(!this._weekdaysParse)for(this._weekdaysParse=[],this._shortWeekdaysParse=[],this._minWeekdaysParse=[],n=0;n<7;++n)r=f([2e3,1]).day(n),this._minWeekdaysParse[n]=this.weekdaysMin(r,"").toLocaleLowerCase(),this._shortWeekdaysParse[n]=this.weekdaysShort(r,"").toLocaleLowerCase(),this._weekdaysParse[n]=this.weekdays(r,"").toLocaleLowerCase();return i?"dddd"===e?-1!==(a=Ct.call(this._weekdaysParse,o))?a:null:"ddd"===e?-1!==(a=Ct.call(this._shortWeekdaysParse,o))?a:null:-1!==(a=Ct.call(this._minWeekdaysParse,o))?a:null:"dddd"===e?-1!==(a=Ct.call(this._weekdaysParse,o))?a:-1!==(a=Ct.call(this._shortWeekdaysParse,o))?a:-1!==(a=Ct.call(this._minWeekdaysParse,o))?a:null:"ddd"===e?-1!==(a=Ct.call(this._shortWeekdaysParse,o))?a:-1!==(a=Ct.call(this._weekdaysParse,o))?a:-1!==(a=Ct.call(this._minWeekdaysParse,o))?a:null:-1!==(a=Ct.call(this._minWeekdaysParse,o))?a:-1!==(a=Ct.call(this._weekdaysParse,o))?a:-1!==(a=Ct.call(this._shortWeekdaysParse,o))?a:null}.call(this,t,e,i);for(this._weekdaysParse||(this._weekdaysParse=[],this._minWeekdaysParse=[],this._shortWeekdaysParse=[],this._fullWeekdaysParse=[]),n=0;n<7;n++){if(a=f([2e3,1]).day(n),i&&!this._fullWeekdaysParse[n]&&(this._fullWeekdaysParse[n]=new RegExp("^"+this.weekdays(a,"").replace(".",".?")+"$","i"),this._shortWeekdaysParse[n]=new RegExp("^"+this.weekdaysShort(a,"").replace(".",".?")+"$","i"),this._minWeekdaysParse[n]=new RegExp("^"+this.weekdaysMin(a,"").replace(".",".?")+"$","i")),this._weekdaysParse[n]||(r="^"+this.weekdays(a,"")+"|^"+this.weekdaysShort(a,"")+"|^"+this.weekdaysMin(a,""),this._weekdaysParse[n]=new RegExp(r.replace(".",""),"i")),i&&"dddd"===e&&this._fullWeekdaysParse[n].test(t))return n;if(i&&"ddd"===e&&this._shortWeekdaysParse[n].test(t))return n;if(i&&"dd"===e&&this._minWeekdaysParse[n].test(t))return n;if(!i&&this._weekdaysParse[n].test(t))return n}},ci.weekdaysRegex=function(t){return this._weekdaysParseExact?(h(this,"_weekdaysRegex")||$t.call(this),t?this._weekdaysStrictRegex:this._weekdaysRegex):(h(this,"_weekdaysRegex")||(this._weekdaysRegex=Xt),this._weekdaysStrictRegex&&t?this._weekdaysStrictRegex:this._weekdaysRegex)},ci.weekdaysShortRegex=function(t){return this._weekdaysParseExact?(h(this,"_weekdaysRegex")||$t.call(this),t?this._weekdaysShortStrictRegex:this._weekdaysShortRegex):(h(this,"_weekdaysShortRegex")||(this._weekdaysShortRegex=Jt),this._weekdaysShortStrictRegex&&t?this._weekdaysShortStrictRegex:this._weekdaysShortRegex)},ci.weekdaysMinRegex=function(t){return this._weekdaysParseExact?(h(this,"_weekdaysRegex")||$t.call(this),t?this._weekdaysMinStrictRegex:this._weekdaysMinRegex):(h(this,"_weekdaysMinRegex")||(this._weekdaysMinRegex=Kt),this._weekdaysMinStrictRegex&&t?this._weekdaysMinStrictRegex:this._weekdaysMinRegex)},ci.isPM=function(t){return"p"===(t+"").toLowerCase().charAt(0)},ci.meridiem=function(t,e,i){return t>11?i?"pm":"PM":i?"am":"AM"},ue("en",{dayOfMonthOrdinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(t){var e=t%10;return t+(1===w(t%100/10)?"th":1===e?"st":2===e?"nd":3===e?"rd":"th")}}),a.lang=D("moment.lang is deprecated. Use moment.locale instead.",ue),a.langData=D("moment.langData is deprecated. Use moment.localeData instead.",he);var pi=Math.abs;function vi(t,e,i,n){var a=Ue(e,i);return t._milliseconds+=n*a._milliseconds,t._days+=n*a._days,t._months+=n*a._months,t._bubble()}function yi(t){return t<0?Math.floor(t):Math.ceil(t)}function bi(t){return 4800*t/146097}function xi(t){return 146097*t/4800}function _i(t){return function(){return this.as(t)}}var ki=_i("ms"),wi=_i("s"),Mi=_i("m"),Si=_i("h"),Di=_i("d"),Ci=_i("w"),Pi=_i("M"),Ti=_i("y");function Oi(t){return function(){return this.isValid()?this._data[t]:NaN}}var Ii=Oi("milliseconds"),Ai=Oi("seconds"),Fi=Oi("minutes"),Ri=Oi("hours"),Li=Oi("days"),Wi=Oi("months"),Yi=Oi("years");var Ni=Math.round,zi={ss:44,s:45,m:45,h:22,d:26,M:11};var Hi=Math.abs;function Vi(t){return(t>0)-(t<0)||+t}function Bi(){if(!this.isValid())return this.localeData().invalidDate();var t,e,i=Hi(this._milliseconds)/1e3,n=Hi(this._days),a=Hi(this._months);e=k((t=k(i/60))/60),i%=60,t%=60;var r=k(a/12),o=a%=12,s=n,l=e,u=t,d=i?i.toFixed(3).replace(/\.?0+$/,""):"",h=this.asSeconds();if(!h)return"P0D";var c=h<0?"-":"",f=Vi(this._months)!==Vi(h)?"-":"",g=Vi(this._days)!==Vi(h)?"-":"",m=Vi(this._milliseconds)!==Vi(h)?"-":"";return c+"P"+(r?f+r+"Y":"")+(o?f+o+"M":"")+(s?g+s+"D":"")+(l||u||d?"T":"")+(l?m+l+"H":"")+(u?m+u+"M":"")+(d?m+d+"S":"")}var Ei=Re.prototype;return Ei.isValid=function(){return this._isValid},Ei.abs=function(){var t=this._data;return this._milliseconds=pi(this._milliseconds),this._days=pi(this._days),this._months=pi(this._months),t.milliseconds=pi(t.milliseconds),t.seconds=pi(t.seconds),t.minutes=pi(t.minutes),t.hours=pi(t.hours),t.months=pi(t.months),t.years=pi(t.years),this},Ei.add=function(t,e){return vi(this,t,e,1)},Ei.subtract=function(t,e){return vi(this,t,e,-1)},Ei.as=function(t){if(!this.isValid())return NaN;var e,i,n=this._milliseconds;if("month"===(t=L(t))||"year"===t)return e=this._days+n/864e5,i=this._months+bi(e),"month"===t?i:i/12;switch(e=this._days+Math.round(xi(this._months)),t){case"week":return e/7+n/6048e5;case"day":return e+n/864e5;case"hour":return 24*e+n/36e5;case"minute":return 1440*e+n/6e4;case"second":return 86400*e+n/1e3;case"millisecond":return Math.floor(864e5*e)+n;default:throw new Error("Unknown unit "+t)}},Ei.asMilliseconds=ki,Ei.asSeconds=wi,Ei.asMinutes=Mi,Ei.asHours=Si,Ei.asDays=Di,Ei.asWeeks=Ci,Ei.asMonths=Pi,Ei.asYears=Ti,Ei.valueOf=function(){return this.isValid()?this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*w(this._months/12):NaN},Ei._bubble=function(){var t,e,i,n,a,r=this._milliseconds,o=this._days,s=this._months,l=this._data;return r>=0&&o>=0&&s>=0||r<=0&&o<=0&&s<=0||(r+=864e5*yi(xi(s)+o),o=0,s=0),l.milliseconds=r%1e3,t=k(r/1e3),l.seconds=t%60,e=k(t/60),l.minutes=e%60,i=k(e/60),l.hours=i%24,s+=a=k(bi(o+=k(i/24))),o-=yi(xi(a)),n=k(s/12),s%=12,l.days=o,l.months=s,l.years=n,this},Ei.clone=function(){return Ue(this)},Ei.get=function(t){return t=L(t),this.isValid()?this[t+"s"]():NaN},Ei.milliseconds=Ii,Ei.seconds=Ai,Ei.minutes=Fi,Ei.hours=Ri,Ei.days=Li,Ei.weeks=function(){return k(this.days()/7)},Ei.months=Wi,Ei.years=Yi,Ei.humanize=function(t){if(!this.isValid())return this.localeData().invalidDate();var e,i,n,a,r,o,s,l,u,d,h,c=this.localeData(),f=(i=!t,n=c,a=Ue(e=this).abs(),r=Ni(a.as("s")),o=Ni(a.as("m")),s=Ni(a.as("h")),l=Ni(a.as("d")),u=Ni(a.as("M")),d=Ni(a.as("y")),(h=r<=zi.ss&&["s",r]||r<zi.s&&["ss",r]||o<=1&&["m"]||o<zi.m&&["mm",o]||s<=1&&["h"]||s<zi.h&&["hh",s]||l<=1&&["d"]||l<zi.d&&["dd",l]||u<=1&&["M"]||u<zi.M&&["MM",u]||d<=1&&["y"]||["yy",d])[2]=i,h[3]=+e>0,h[4]=n,function(t,e,i,n,a){return a.relativeTime(e||1,!!i,t,n)}.apply(null,h));return t&&(f=c.pastFuture(+this,f)),c.postformat(f)},Ei.toISOString=Bi,Ei.toString=Bi,Ei.toJSON=Bi,Ei.locale=Qe,Ei.localeData=ei,Ei.toIsoString=D("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",Bi),Ei.lang=ti,j("X",0,0,"unix"),j("x",0,0,"valueOf"),dt("x",rt),dt("X",/[+-]?\d+(\.\d{1,3})?/),gt("X",function(t,e,i){i._d=new Date(1e3*parseFloat(t,10))}),gt("x",function(t,e,i){i._d=new Date(w(t))}),a.version="2.20.1",i=Te,a.fn=di,a.min=function(){return Ae("isBefore",[].slice.call(arguments,0))},a.max=function(){return Ae("isAfter",[].slice.call(arguments,0))},a.now=function(){return Date.now?Date.now():+new Date},a.utc=f,a.unix=function(t){return Te(1e3*t)},a.months=function(t,e){return gi(t,e,"months")},a.isDate=u,a.locale=ue,a.invalid=p,a.duration=Ue,a.isMoment=_,a.weekdays=function(t,e,i){return mi(t,e,i,"weekdays")},a.parseZone=function(){return Te.apply(null,arguments).parseZone()},a.localeData=he,a.isDuration=Le,a.monthsShort=function(t,e){return gi(t,e,"monthsShort")},a.weekdaysMin=function(t,e,i){return mi(t,e,i,"weekdaysMin")},a.defineLocale=de,a.updateLocale=function(t,e){if(null!=e){var i,n,a=ae;null!=(n=le(t))&&(a=n._config),(i=new A(e=I(a,e))).parentLocale=re[t],re[t]=i,ue(t)}else null!=re[t]&&(null!=re[t].parentLocale?re[t]=re[t].parentLocale:null!=re[t]&&delete re[t]);return re[t]},a.locales=function(){return C(re)},a.weekdaysShort=function(t,e,i){return mi(t,e,i,"weekdaysShort")},a.normalizeUnits=L,a.relativeTimeRounding=function(t){return void 0===t?Ni:"function"==typeof t&&(Ni=t,!0)},a.relativeTimeThreshold=function(t,e){return void 0!==zi[t]&&(void 0===e?zi[t]:(zi[t]=e,"s"===t&&(zi.ss=e-1),!0))},a.calendarFormat=function(t,e){var i=t.diff(e,"days",!0);return i<-6?"sameElse":i<-1?"lastWeek":i<0?"lastDay":i<1?"sameDay":i<2?"nextDay":i<7?"nextWeek":"sameElse"},a.prototype=di,a.HTML5_FMT={DATETIME_LOCAL:"YYYY-MM-DDTHH:mm",DATETIME_LOCAL_SECONDS:"YYYY-MM-DDTHH:mm:ss",DATETIME_LOCAL_MS:"YYYY-MM-DDTHH:mm:ss.SSS",DATE:"YYYY-MM-DD",TIME:"HH:mm",TIME_SECONDS:"HH:mm:ss",TIME_MS:"HH:mm:ss.SSS",WEEK:"YYYY-[W]WW",MONTH:"YYYY-MM"},a},"object"==typeof i&&void 0!==e?e.exports=a():n.moment=a()},{}],7:[function(t,e,i){var n=t(29)();n.helpers=t(45),t(27)(n),n.defaults=t(25),n.Element=t(26),n.elements=t(40),n.Interaction=t(28),n.layouts=t(30),n.platform=t(48),n.plugins=t(31),n.Ticks=t(34),t(22)(n),t(23)(n),t(24)(n),t(33)(n),t(32)(n),t(35)(n),t(55)(n),t(53)(n),t(54)(n),t(56)(n),t(57)(n),t(58)(n),t(15)(n),t(16)(n),t(17)(n),t(18)(n),t(19)(n),t(20)(n),t(21)(n),t(8)(n),t(9)(n),t(10)(n),t(11)(n),t(12)(n),t(13)(n),t(14)(n);var a=t(49);for(var r in a)a.hasOwnProperty(r)&&n.plugins.register(a[r]);n.platform.initialize(),e.exports=n,"undefined"!=typeof window&&(window.Chart=n),n.Legend=a.legend._element,n.Title=a.title._element,n.pluginService=n.plugins,n.PluginBase=n.Element.extend({}),n.canvasHelpers=n.helpers.canvas,n.layoutService=n.layouts},{10:10,11:11,12:12,13:13,14:14,15:15,16:16,17:17,18:18,19:19,20:20,21:21,22:22,23:23,24:24,25:25,26:26,27:27,28:28,29:29,30:30,31:31,32:32,33:33,34:34,35:35,40:40,45:45,48:48,49:49,53:53,54:54,55:55,56:56,57:57,58:58,8:8,9:9}],8:[function(t,e,i){"use strict";e.exports=function(t){t.Bar=function(e,i){return i.type="bar",new t(e,i)}}},{}],9:[function(t,e,i){"use strict";e.exports=function(t){t.Bubble=function(e,i){return i.type="bubble",new t(e,i)}}},{}],10:[function(t,e,i){"use strict";e.exports=function(t){t.Doughnut=function(e,i){return i.type="doughnut",new t(e,i)}}},{}],11:[function(t,e,i){"use strict";e.exports=function(t){t.Line=function(e,i){return i.type="line",new t(e,i)}}},{}],12:[function(t,e,i){"use strict";e.exports=function(t){t.PolarArea=function(e,i){return i.type="polarArea",new t(e,i)}}},{}],13:[function(t,e,i){"use strict";e.exports=function(t){t.Radar=function(e,i){return i.type="radar",new t(e,i)}}},{}],14:[function(t,e,i){"use strict";e.exports=function(t){t.Scatter=function(e,i){return i.type="scatter",new t(e,i)}}},{}],15:[function(t,e,i){"use strict";var n=t(25),a=t(40),r=t(45);n._set("bar",{hover:{mode:"label"},scales:{xAxes:[{type:"category",categoryPercentage:.8,barPercentage:.9,offset:!0,gridLines:{offsetGridLines:!0}}],yAxes:[{type:"linear"}]}}),n._set("horizontalBar",{hover:{mode:"index",axis:"y"},scales:{xAxes:[{type:"linear",position:"bottom"}],yAxes:[{position:"left",type:"category",categoryPercentage:.8,barPercentage:.9,offset:!0,gridLines:{offsetGridLines:!0}}]},elements:{rectangle:{borderSkipped:"left"}},tooltips:{callbacks:{title:function(t,e){var i="";return t.length>0&&(t[0].yLabel?i=t[0].yLabel:e.labels.length>0&&t[0].index<e.labels.length&&(i=e.labels[t[0].index])),i},label:function(t,e){return(e.datasets[t.datasetIndex].label||"")+": "+t.xLabel}},mode:"index",axis:"y"}}),e.exports=function(t){t.controllers.bar=t.DatasetController.extend({dataElementType:a.Rectangle,initialize:function(){var e;t.DatasetController.prototype.initialize.apply(this,arguments),(e=this.getMeta()).stack=this.getDataset().stack,e.bar=!0},update:function(t){var e,i,n=this.getMeta().data;for(this._ruler=this.getRuler(),e=0,i=n.length;e<i;++e)this.updateElement(n[e],e,t)},updateElement:function(t,e,i){var n=this,a=n.chart,o=n.getMeta(),s=n.getDataset(),l=t.custom||{},u=a.options.elements.rectangle;t._xScale=n.getScaleForId(o.xAxisID),t._yScale=n.getScaleForId(o.yAxisID),t._datasetIndex=n.index,t._index=e,t._model={datasetLabel:s.label,label:a.data.labels[e],borderSkipped:l.borderSkipped?l.borderSkipped:u.borderSkipped,backgroundColor:l.backgroundColor?l.backgroundColor:r.valueAtIndexOrDefault(s.backgroundColor,e,u.backgroundColor),borderColor:l.borderColor?l.borderColor:r.valueAtIndexOrDefault(s.borderColor,e,u.borderColor),borderWidth:l.borderWidth?l.borderWidth:r.valueAtIndexOrDefault(s.borderWidth,e,u.borderWidth)},n.updateElementGeometry(t,e,i),t.pivot()},updateElementGeometry:function(t,e,i){var n=this,a=t._model,r=n.getValueScale(),o=r.getBasePixel(),s=r.isHorizontal(),l=n._ruler||n.getRuler(),u=n.calculateBarValuePixels(n.index,e),d=n.calculateBarIndexPixels(n.index,e,l);a.horizontal=s,a.base=i?o:u.base,a.x=s?i?o:u.head:d.center,a.y=s?d.center:i?o:u.head,a.height=s?d.size:void 0,a.width=s?void 0:d.size},getValueScaleId:function(){return this.getMeta().yAxisID},getIndexScaleId:function(){return this.getMeta().xAxisID},getValueScale:function(){return this.getScaleForId(this.getValueScaleId())},getIndexScale:function(){return this.getScaleForId(this.getIndexScaleId())},_getStacks:function(t){var e,i,n=this.chart,a=this.getIndexScale().options.stacked,r=void 0===t?n.data.datasets.length:t+1,o=[];for(e=0;e<r;++e)(i=n.getDatasetMeta(e)).bar&&n.isDatasetVisible(e)&&(!1===a||!0===a&&-1===o.indexOf(i.stack)||void 0===a&&(void 0===i.stack||-1===o.indexOf(i.stack)))&&o.push(i.stack);return o},getStackCount:function(){return this._getStacks().length},getStackIndex:function(t,e){var i=this._getStacks(t),n=void 0!==e?i.indexOf(e):-1;return-1===n?i.length-1:n},getRuler:function(){var t,e,i=this.getIndexScale(),n=this.getStackCount(),a=this.index,o=i.isHorizontal(),s=o?i.left:i.top,l=s+(o?i.width:i.height),u=[];for(t=0,e=this.getMeta().data.length;t<e;++t)u.push(i.getPixelForValue(null,t,a));return{min:r.isNullOrUndef(i.options.barThickness)?function(t,e){var i,n,a,r,o=t.isHorizontal()?t.width:t.height,s=t.getTicks();for(a=1,r=e.length;a<r;++a)o=Math.min(o,e[a]-e[a-1]);for(a=0,r=s.length;a<r;++a)n=t.getPixelForTick(a),o=a>0?Math.min(o,n-i):o,i=n;return o}(i,u):-1,pixels:u,start:s,end:l,stackCount:n,scale:i}},calculateBarValuePixels:function(t,e){var i,n,a,r,o,s,l=this.chart,u=this.getMeta(),d=this.getValueScale(),h=l.data.datasets,c=d.getRightValue(h[t].data[e]),f=d.options.stacked,g=u.stack,m=0;if(f||void 0===f&&void 0!==g)for(i=0;i<t;++i)(n=l.getDatasetMeta(i)).bar&&n.stack===g&&n.controller.getValueScaleId()===d.id&&l.isDatasetVisible(i)&&(a=d.getRightValue(h[i].data[e]),(c<0&&a<0||c>=0&&a>0)&&(m+=a));return r=d.getPixelForValue(m),{size:s=((o=d.getPixelForValue(m+c))-r)/2,base:r,head:o,center:o+s/2}},calculateBarIndexPixels:function(t,e,i){var n,a,o,s,l,u,d,h,c,f,g,m,p,v,y,b,x,_=i.scale.options,k="flex"===_.barThickness?(c=e,g=_,p=(f=i).pixels,v=p[c],y=c>0?p[c-1]:null,b=c<p.length-1?p[c+1]:null,x=g.categoryPercentage,null===y&&(y=v-(null===b?f.end-v:b-v)),null===b&&(b=v+v-y),m=v-(v-y)/2*x,{chunk:(b-y)/2*x/f.stackCount,ratio:g.barPercentage,start:m}):(n=e,a=i,u=(o=_).barThickness,d=a.stackCount,h=a.pixels[n],r.isNullOrUndef(u)?(s=a.min*o.categoryPercentage,l=o.barPercentage):(s=u*d,l=1),{chunk:s/d,ratio:l,start:h-s/2}),w=this.getStackIndex(t,this.getMeta().stack),M=k.start+k.chunk*w+k.chunk/2,S=Math.min(r.valueOrDefault(_.maxBarThickness,1/0),k.chunk*k.ratio);return{base:M-S/2,head:M+S/2,center:M,size:S}},draw:function(){var t=this.chart,e=this.getValueScale(),i=this.getMeta().data,n=this.getDataset(),a=i.length,o=0;for(r.canvas.clipArea(t.ctx,t.chartArea);o<a;++o)isNaN(e.getRightValue(n.data[o]))||i[o].draw();r.canvas.unclipArea(t.ctx)},setHoverStyle:function(t){var e=this.chart.data.datasets[t._datasetIndex],i=t._index,n=t.custom||{},a=t._model;a.backgroundColor=n.hoverBackgroundColor?n.hoverBackgroundColor:r.valueAtIndexOrDefault(e.hoverBackgroundColor,i,r.getHoverColor(a.backgroundColor)),a.borderColor=n.hoverBorderColor?n.hoverBorderColor:r.valueAtIndexOrDefault(e.hoverBorderColor,i,r.getHoverColor(a.borderColor)),a.borderWidth=n.hoverBorderWidth?n.hoverBorderWidth:r.valueAtIndexOrDefault(e.hoverBorderWidth,i,a.borderWidth)},removeHoverStyle:function(t){var e=this.chart.data.datasets[t._datasetIndex],i=t._index,n=t.custom||{},a=t._model,o=this.chart.options.elements.rectangle;a.backgroundColor=n.backgroundColor?n.backgroundColor:r.valueAtIndexOrDefault(e.backgroundColor,i,o.backgroundColor),a.borderColor=n.borderColor?n.borderColor:r.valueAtIndexOrDefault(e.borderColor,i,o.borderColor),a.borderWidth=n.borderWidth?n.borderWidth:r.valueAtIndexOrDefault(e.borderWidth,i,o.borderWidth)}}),t.controllers.horizontalBar=t.controllers.bar.extend({getValueScaleId:function(){return this.getMeta().xAxisID},getIndexScaleId:function(){return this.getMeta().yAxisID}})}},{25:25,40:40,45:45}],16:[function(t,e,i){"use strict";var n=t(25),a=t(40),r=t(45);n._set("bubble",{hover:{mode:"single"},scales:{xAxes:[{type:"linear",position:"bottom",id:"x-axis-0"}],yAxes:[{type:"linear",position:"left",id:"y-axis-0"}]},tooltips:{callbacks:{title:function(){return""},label:function(t,e){var i=e.datasets[t.datasetIndex].label||"",n=e.datasets[t.datasetIndex].data[t.index];return i+": ("+t.xLabel+", "+t.yLabel+", "+n.r+")"}}}}),e.exports=function(t){t.controllers.bubble=t.DatasetController.extend({dataElementType:a.Point,update:function(t){var e=this,i=e.getMeta().data;r.each(i,function(i,n){e.updateElement(i,n,t)})},updateElement:function(t,e,i){var n=this,a=n.getMeta(),r=t.custom||{},o=n.getScaleForId(a.xAxisID),s=n.getScaleForId(a.yAxisID),l=n._resolveElementOptions(t,e),u=n.getDataset().data[e],d=n.index,h=i?o.getPixelForDecimal(.5):o.getPixelForValue("object"==typeof u?u:NaN,e,d),c=i?s.getBasePixel():s.getPixelForValue(u,e,d);t._xScale=o,t._yScale=s,t._options=l,t._datasetIndex=d,t._index=e,t._model={backgroundColor:l.backgroundColor,borderColor:l.borderColor,borderWidth:l.borderWidth,hitRadius:l.hitRadius,pointStyle:l.pointStyle,radius:i?0:l.radius,skip:r.skip||isNaN(h)||isNaN(c),x:h,y:c},t.pivot()},setHoverStyle:function(t){var e=t._model,i=t._options;e.backgroundColor=r.valueOrDefault(i.hoverBackgroundColor,r.getHoverColor(i.backgroundColor)),e.borderColor=r.valueOrDefault(i.hoverBorderColor,r.getHoverColor(i.borderColor)),e.borderWidth=r.valueOrDefault(i.hoverBorderWidth,i.borderWidth),e.radius=i.radius+i.hoverRadius},removeHoverStyle:function(t){var e=t._model,i=t._options;e.backgroundColor=i.backgroundColor,e.borderColor=i.borderColor,e.borderWidth=i.borderWidth,e.radius=i.radius},_resolveElementOptions:function(t,e){var i,n,a,o=this.chart,s=o.data.datasets[this.index],l=t.custom||{},u=o.options.elements.point,d=r.options.resolve,h=s.data[e],c={},f={chart:o,dataIndex:e,dataset:s,datasetIndex:this.index},g=["backgroundColor","borderColor","borderWidth","hoverBackgroundColor","hoverBorderColor","hoverBorderWidth","hoverRadius","hitRadius","pointStyle"];for(i=0,n=g.length;i<n;++i)c[a=g[i]]=d([l[a],s[a],u[a]],f,e);return c.radius=d([l.radius,h?h.r:void 0,s.radius,u.radius],f,e),c}})}},{25:25,40:40,45:45}],17:[function(t,e,i){"use strict";var n=t(25),a=t(40),r=t(45);n._set("doughnut",{animation:{animateRotate:!0,animateScale:!1},hover:{mode:"single"},legendCallback:function(t){var e=[];e.push('<ul class="'+t.id+'-legend">');var i=t.data,n=i.datasets,a=i.labels;if(n.length)for(var r=0;r<n[0].data.length;++r)e.push('<li><span style="background-color:'+n[0].backgroundColor[r]+'"></span>'),a[r]&&e.push(a[r]),e.push("</li>");return e.push("</ul>"),e.join("")},legend:{labels:{generateLabels:function(t){var e=t.data;return e.labels.length&&e.datasets.length?e.labels.map(function(i,n){var a=t.getDatasetMeta(0),o=e.datasets[0],s=a.data[n],l=s&&s.custom||{},u=r.valueAtIndexOrDefault,d=t.options.elements.arc;return{text:i,fillStyle:l.backgroundColor?l.backgroundColor:u(o.backgroundColor,n,d.backgroundColor),strokeStyle:l.borderColor?l.borderColor:u(o.borderColor,n,d.borderColor),lineWidth:l.borderWidth?l.borderWidth:u(o.borderWidth,n,d.borderWidth),hidden:isNaN(o.data[n])||a.data[n].hidden,index:n}}):[]}},onClick:function(t,e){var i,n,a,r=e.index,o=this.chart;for(i=0,n=(o.data.datasets||[]).length;i<n;++i)(a=o.getDatasetMeta(i)).data[r]&&(a.data[r].hidden=!a.data[r].hidden);o.update()}},cutoutPercentage:50,rotation:-.5*Math.PI,circumference:2*Math.PI,tooltips:{callbacks:{title:function(){return""},label:function(t,e){var i=e.labels[t.index],n=": "+e.datasets[t.datasetIndex].data[t.index];return r.isArray(i)?(i=i.slice())[0]+=n:i+=n,i}}}}),n._set("pie",r.clone(n.doughnut)),n._set("pie",{cutoutPercentage:0}),e.exports=function(t){t.controllers.doughnut=t.controllers.pie=t.DatasetController.extend({dataElementType:a.Arc,linkScales:r.noop,getRingIndex:function(t){for(var e=0,i=0;i<t;++i)this.chart.isDatasetVisible(i)&&++e;return e},update:function(t){var e=this,i=e.chart,n=i.chartArea,a=i.options,o=a.elements.arc,s=n.right-n.left-o.borderWidth,l=n.bottom-n.top-o.borderWidth,u=Math.min(s,l),d={x:0,y:0},h=e.getMeta(),c=a.cutoutPercentage,f=a.circumference;if(f<2*Math.PI){var g=a.rotation%(2*Math.PI),m=(g+=2*Math.PI*(g>=Math.PI?-1:g<-Math.PI?1:0))+f,p=Math.cos(g),v=Math.sin(g),y=Math.cos(m),b=Math.sin(m),x=g<=0&&m>=0||g<=2*Math.PI&&2*Math.PI<=m,_=g<=.5*Math.PI&&.5*Math.PI<=m||g<=2.5*Math.PI&&2.5*Math.PI<=m,k=g<=-Math.PI&&-Math.PI<=m||g<=Math.PI&&Math.PI<=m,w=g<=.5*-Math.PI&&.5*-Math.PI<=m||g<=1.5*Math.PI&&1.5*Math.PI<=m,M=c/100,S=k?-1:Math.min(p*(p<0?1:M),y*(y<0?1:M)),D=w?-1:Math.min(v*(v<0?1:M),b*(b<0?1:M)),C=x?1:Math.max(p*(p>0?1:M),y*(y>0?1:M)),P=_?1:Math.max(v*(v>0?1:M),b*(b>0?1:M)),T=.5*(C-S),O=.5*(P-D);u=Math.min(s/T,l/O),d={x:-.5*(C+S),y:-.5*(P+D)}}i.borderWidth=e.getMaxBorderWidth(h.data),i.outerRadius=Math.max((u-i.borderWidth)/2,0),i.innerRadius=Math.max(c?i.outerRadius/100*c:0,0),i.radiusLength=(i.outerRadius-i.innerRadius)/i.getVisibleDatasetCount(),i.offsetX=d.x*i.outerRadius,i.offsetY=d.y*i.outerRadius,h.total=e.calculateTotal(),e.outerRadius=i.outerRadius-i.radiusLength*e.getRingIndex(e.index),e.innerRadius=Math.max(e.outerRadius-i.radiusLength,0),r.each(h.data,function(i,n){e.updateElement(i,n,t)})},updateElement:function(t,e,i){var n=this,a=n.chart,o=a.chartArea,s=a.options,l=s.animation,u=(o.left+o.right)/2,d=(o.top+o.bottom)/2,h=s.rotation,c=s.rotation,f=n.getDataset(),g=i&&l.animateRotate?0:t.hidden?0:n.calculateCircumference(f.data[e])*(s.circumference/(2*Math.PI)),m=i&&l.animateScale?0:n.innerRadius,p=i&&l.animateScale?0:n.outerRadius,v=r.valueAtIndexOrDefault;r.extend(t,{_datasetIndex:n.index,_index:e,_model:{x:u+a.offsetX,y:d+a.offsetY,startAngle:h,endAngle:c,circumference:g,outerRadius:p,innerRadius:m,label:v(f.label,e,a.data.labels[e])}});var y=t._model;this.removeHoverStyle(t),i&&l.animateRotate||(y.startAngle=0===e?s.rotation:n.getMeta().data[e-1]._model.endAngle,y.endAngle=y.startAngle+y.circumference),t.pivot()},removeHoverStyle:function(e){t.DatasetController.prototype.removeHoverStyle.call(this,e,this.chart.options.elements.arc)},calculateTotal:function(){var t,e=this.getDataset(),i=this.getMeta(),n=0;return r.each(i.data,function(i,a){t=e.data[a],isNaN(t)||i.hidden||(n+=Math.abs(t))}),n},calculateCircumference:function(t){var e=this.getMeta().total;return e>0&&!isNaN(t)?2*Math.PI*(Math.abs(t)/e):0},getMaxBorderWidth:function(t){for(var e,i,n=0,a=this.index,r=t.length,o=0;o<r;o++)e=t[o]._model?t[o]._model.borderWidth:0,n=(i=t[o]._chart?t[o]._chart.config.data.datasets[a].hoverBorderWidth:0)>(n=e>n?e:n)?i:n;return n}})}},{25:25,40:40,45:45}],18:[function(t,e,i){"use strict";var n=t(25),a=t(40),r=t(45);n._set("line",{showLines:!0,spanGaps:!1,hover:{mode:"label"},scales:{xAxes:[{type:"category",id:"x-axis-0"}],yAxes:[{type:"linear",id:"y-axis-0"}]}}),e.exports=function(t){function e(t,e){return r.valueOrDefault(t.showLine,e.showLines)}t.controllers.line=t.DatasetController.extend({datasetElementType:a.Line,dataElementType:a.Point,update:function(t){var i,n,a,o=this,s=o.getMeta(),l=s.dataset,u=s.data||[],d=o.chart.options,h=d.elements.line,c=o.getScaleForId(s.yAxisID),f=o.getDataset(),g=e(f,d);for(g&&(a=l.custom||{},void 0!==f.tension&&void 0===f.lineTension&&(f.lineTension=f.tension),l._scale=c,l._datasetIndex=o.index,l._children=u,l._model={spanGaps:f.spanGaps?f.spanGaps:d.spanGaps,tension:a.tension?a.tension:r.valueOrDefault(f.lineTension,h.tension),backgroundColor:a.backgroundColor?a.backgroundColor:f.backgroundColor||h.backgroundColor,borderWidth:a.borderWidth?a.borderWidth:f.borderWidth||h.borderWidth,borderColor:a.borderColor?a.borderColor:f.borderColor||h.borderColor,borderCapStyle:a.borderCapStyle?a.borderCapStyle:f.borderCapStyle||h.borderCapStyle,borderDash:a.borderDash?a.borderDash:f.borderDash||h.borderDash,borderDashOffset:a.borderDashOffset?a.borderDashOffset:f.borderDashOffset||h.borderDashOffset,borderJoinStyle:a.borderJoinStyle?a.borderJoinStyle:f.borderJoinStyle||h.borderJoinStyle,fill:a.fill?a.fill:void 0!==f.fill?f.fill:h.fill,steppedLine:a.steppedLine?a.steppedLine:r.valueOrDefault(f.steppedLine,h.stepped),cubicInterpolationMode:a.cubicInterpolationMode?a.cubicInterpolationMode:r.valueOrDefault(f.cubicInterpolationMode,h.cubicInterpolationMode)},l.pivot()),i=0,n=u.length;i<n;++i)o.updateElement(u[i],i,t);for(g&&0!==l._model.tension&&o.updateBezierControlPoints(),i=0,n=u.length;i<n;++i)u[i].pivot()},getPointBackgroundColor:function(t,e){var i=this.chart.options.elements.point.backgroundColor,n=this.getDataset(),a=t.custom||{};return a.backgroundColor?i=a.backgroundColor:n.pointBackgroundColor?i=r.valueAtIndexOrDefault(n.pointBackgroundColor,e,i):n.backgroundColor&&(i=n.backgroundColor),i},getPointBorderColor:function(t,e){var i=this.chart.options.elements.point.borderColor,n=this.getDataset(),a=t.custom||{};return a.borderColor?i=a.borderColor:n.pointBorderColor?i=r.valueAtIndexOrDefault(n.pointBorderColor,e,i):n.borderColor&&(i=n.borderColor),i},getPointBorderWidth:function(t,e){var i=this.chart.options.elements.point.borderWidth,n=this.getDataset(),a=t.custom||{};return isNaN(a.borderWidth)?!isNaN(n.pointBorderWidth)||r.isArray(n.pointBorderWidth)?i=r.valueAtIndexOrDefault(n.pointBorderWidth,e,i):isNaN(n.borderWidth)||(i=n.borderWidth):i=a.borderWidth,i},updateElement:function(t,e,i){var n,a,o=this,s=o.getMeta(),l=t.custom||{},u=o.getDataset(),d=o.index,h=u.data[e],c=o.getScaleForId(s.yAxisID),f=o.getScaleForId(s.xAxisID),g=o.chart.options.elements.point;void 0!==u.radius&&void 0===u.pointRadius&&(u.pointRadius=u.radius),void 0!==u.hitRadius&&void 0===u.pointHitRadius&&(u.pointHitRadius=u.hitRadius),n=f.getPixelForValue("object"==typeof h?h:NaN,e,d),a=i?c.getBasePixel():o.calculatePointY(h,e,d),t._xScale=f,t._yScale=c,t._datasetIndex=d,t._index=e,t._model={x:n,y:a,skip:l.skip||isNaN(n)||isNaN(a),radius:l.radius||r.valueAtIndexOrDefault(u.pointRadius,e,g.radius),pointStyle:l.pointStyle||r.valueAtIndexOrDefault(u.pointStyle,e,g.pointStyle),backgroundColor:o.getPointBackgroundColor(t,e),borderColor:o.getPointBorderColor(t,e),borderWidth:o.getPointBorderWidth(t,e),tension:s.dataset._model?s.dataset._model.tension:0,steppedLine:!!s.dataset._model&&s.dataset._model.steppedLine,hitRadius:l.hitRadius||r.valueAtIndexOrDefault(u.pointHitRadius,e,g.hitRadius)}},calculatePointY:function(t,e,i){var n,a,r,o=this.chart,s=this.getMeta(),l=this.getScaleForId(s.yAxisID),u=0,d=0;if(l.options.stacked){for(n=0;n<i;n++)if(a=o.data.datasets[n],"line"===(r=o.getDatasetMeta(n)).type&&r.yAxisID===l.id&&o.isDatasetVisible(n)){var h=Number(l.getRightValue(a.data[e]));h<0?d+=h||0:u+=h||0}var c=Number(l.getRightValue(t));return c<0?l.getPixelForValue(d+c):l.getPixelForValue(u+c)}return l.getPixelForValue(t)},updateBezierControlPoints:function(){var t,e,i,n,a=this.getMeta(),o=this.chart.chartArea,s=a.data||[];function l(t,e,i){return Math.max(Math.min(t,i),e)}if(a.dataset._model.spanGaps&&(s=s.filter(function(t){return!t._model.skip})),"monotone"===a.dataset._model.cubicInterpolationMode)r.splineCurveMonotone(s);else for(t=0,e=s.length;t<e;++t)i=s[t]._model,n=r.splineCurve(r.previousItem(s,t)._model,i,r.nextItem(s,t)._model,a.dataset._model.tension),i.controlPointPreviousX=n.previous.x,i.controlPointPreviousY=n.previous.y,i.controlPointNextX=n.next.x,i.controlPointNextY=n.next.y;if(this.chart.options.elements.line.capBezierPoints)for(t=0,e=s.length;t<e;++t)(i=s[t]._model).controlPointPreviousX=l(i.controlPointPreviousX,o.left,o.right),i.controlPointPreviousY=l(i.controlPointPreviousY,o.top,o.bottom),i.controlPointNextX=l(i.controlPointNextX,o.left,o.right),i.controlPointNextY=l(i.controlPointNextY,o.top,o.bottom)},draw:function(){var t=this.chart,i=this.getMeta(),n=i.data||[],a=t.chartArea,o=n.length,s=0;for(r.canvas.clipArea(t.ctx,a),e(this.getDataset(),t.options)&&i.dataset.draw(),r.canvas.unclipArea(t.ctx);s<o;++s)n[s].draw(a)},setHoverStyle:function(t){var e=this.chart.data.datasets[t._datasetIndex],i=t._index,n=t.custom||{},a=t._model;a.radius=n.hoverRadius||r.valueAtIndexOrDefault(e.pointHoverRadius,i,this.chart.options.elements.point.hoverRadius),a.backgroundColor=n.hoverBackgroundColor||r.valueAtIndexOrDefault(e.pointHoverBackgroundColor,i,r.getHoverColor(a.backgroundColor)),a.borderColor=n.hoverBorderColor||r.valueAtIndexOrDefault(e.pointHoverBorderColor,i,r.getHoverColor(a.borderColor)),a.borderWidth=n.hoverBorderWidth||r.valueAtIndexOrDefault(e.pointHoverBorderWidth,i,a.borderWidth)},removeHoverStyle:function(t){var e=this,i=e.chart.data.datasets[t._datasetIndex],n=t._index,a=t.custom||{},o=t._model;void 0!==i.radius&&void 0===i.pointRadius&&(i.pointRadius=i.radius),o.radius=a.radius||r.valueAtIndexOrDefault(i.pointRadius,n,e.chart.options.elements.point.radius),o.backgroundColor=e.getPointBackgroundColor(t,n),o.borderColor=e.getPointBorderColor(t,n),o.borderWidth=e.getPointBorderWidth(t,n)}})}},{25:25,40:40,45:45}],19:[function(t,e,i){"use strict";var n=t(25),a=t(40),r=t(45);n._set("polarArea",{scale:{type:"radialLinear",angleLines:{display:!1},gridLines:{circular:!0},pointLabels:{display:!1},ticks:{beginAtZero:!0}},animation:{animateRotate:!0,animateScale:!0},startAngle:-.5*Math.PI,legendCallback:function(t){var e=[];e.push('<ul class="'+t.id+'-legend">');var i=t.data,n=i.datasets,a=i.labels;if(n.length)for(var r=0;r<n[0].data.length;++r)e.push('<li><span style="background-color:'+n[0].backgroundColor[r]+'"></span>'),a[r]&&e.push(a[r]),e.push("</li>");return e.push("</ul>"),e.join("")},legend:{labels:{generateLabels:function(t){var e=t.data;return e.labels.length&&e.datasets.length?e.labels.map(function(i,n){var a=t.getDatasetMeta(0),o=e.datasets[0],s=a.data[n].custom||{},l=r.valueAtIndexOrDefault,u=t.options.elements.arc;return{text:i,fillStyle:s.backgroundColor?s.backgroundColor:l(o.backgroundColor,n,u.backgroundColor),strokeStyle:s.borderColor?s.borderColor:l(o.borderColor,n,u.borderColor),lineWidth:s.borderWidth?s.borderWidth:l(o.borderWidth,n,u.borderWidth),hidden:isNaN(o.data[n])||a.data[n].hidden,index:n}}):[]}},onClick:function(t,e){var i,n,a,r=e.index,o=this.chart;for(i=0,n=(o.data.datasets||[]).length;i<n;++i)(a=o.getDatasetMeta(i)).data[r].hidden=!a.data[r].hidden;o.update()}},tooltips:{callbacks:{title:function(){return""},label:function(t,e){return e.labels[t.index]+": "+t.yLabel}}}}),e.exports=function(t){t.controllers.polarArea=t.DatasetController.extend({dataElementType:a.Arc,linkScales:r.noop,update:function(t){var e=this,i=e.chart,n=i.chartArea,a=e.getMeta(),o=i.options,s=o.elements.arc,l=Math.min(n.right-n.left,n.bottom-n.top);i.outerRadius=Math.max((l-s.borderWidth/2)/2,0),i.innerRadius=Math.max(o.cutoutPercentage?i.outerRadius/100*o.cutoutPercentage:1,0),i.radiusLength=(i.outerRadius-i.innerRadius)/i.getVisibleDatasetCount(),e.outerRadius=i.outerRadius-i.radiusLength*e.index,e.innerRadius=e.outerRadius-i.radiusLength,a.count=e.countVisibleElements(),r.each(a.data,function(i,n){e.updateElement(i,n,t)})},updateElement:function(t,e,i){for(var n=this,a=n.chart,o=n.getDataset(),s=a.options,l=s.animation,u=a.scale,d=a.data.labels,h=n.calculateCircumference(o.data[e]),c=u.xCenter,f=u.yCenter,g=0,m=n.getMeta(),p=0;p<e;++p)isNaN(o.data[p])||m.data[p].hidden||++g;var v=s.startAngle,y=t.hidden?0:u.getDistanceFromCenterForValue(o.data[e]),b=v+h*g,x=b+(t.hidden?0:h),_=l.animateScale?0:u.getDistanceFromCenterForValue(o.data[e]);r.extend(t,{_datasetIndex:n.index,_index:e,_scale:u,_model:{x:c,y:f,innerRadius:0,outerRadius:i?_:y,startAngle:i&&l.animateRotate?v:b,endAngle:i&&l.animateRotate?v:x,label:r.valueAtIndexOrDefault(d,e,d[e])}}),n.removeHoverStyle(t),t.pivot()},removeHoverStyle:function(e){t.DatasetController.prototype.removeHoverStyle.call(this,e,this.chart.options.elements.arc)},countVisibleElements:function(){var t=this.getDataset(),e=this.getMeta(),i=0;return r.each(e.data,function(e,n){isNaN(t.data[n])||e.hidden||i++}),i},calculateCircumference:function(t){var e=this.getMeta().count;return e>0&&!isNaN(t)?2*Math.PI/e:0}})}},{25:25,40:40,45:45}],20:[function(t,e,i){"use strict";var n=t(25),a=t(40),r=t(45);n._set("radar",{scale:{type:"radialLinear"},elements:{line:{tension:0}}}),e.exports=function(t){t.controllers.radar=t.DatasetController.extend({datasetElementType:a.Line,dataElementType:a.Point,linkScales:r.noop,update:function(t){var e=this,i=e.getMeta(),n=i.dataset,a=i.data,o=n.custom||{},s=e.getDataset(),l=e.chart.options.elements.line,u=e.chart.scale;void 0!==s.tension&&void 0===s.lineTension&&(s.lineTension=s.tension),r.extend(i.dataset,{_datasetIndex:e.index,_scale:u,_children:a,_loop:!0,_model:{tension:o.tension?o.tension:r.valueOrDefault(s.lineTension,l.tension),backgroundColor:o.backgroundColor?o.backgroundColor:s.backgroundColor||l.backgroundColor,borderWidth:o.borderWidth?o.borderWidth:s.borderWidth||l.borderWidth,borderColor:o.borderColor?o.borderColor:s.borderColor||l.borderColor,fill:o.fill?o.fill:void 0!==s.fill?s.fill:l.fill,borderCapStyle:o.borderCapStyle?o.borderCapStyle:s.borderCapStyle||l.borderCapStyle,borderDash:o.borderDash?o.borderDash:s.borderDash||l.borderDash,borderDashOffset:o.borderDashOffset?o.borderDashOffset:s.borderDashOffset||l.borderDashOffset,borderJoinStyle:o.borderJoinStyle?o.borderJoinStyle:s.borderJoinStyle||l.borderJoinStyle}}),i.dataset.pivot(),r.each(a,function(i,n){e.updateElement(i,n,t)},e),e.updateBezierControlPoints()},updateElement:function(t,e,i){var n=this,a=t.custom||{},o=n.getDataset(),s=n.chart.scale,l=n.chart.options.elements.point,u=s.getPointPositionForValue(e,o.data[e]);void 0!==o.radius&&void 0===o.pointRadius&&(o.pointRadius=o.radius),void 0!==o.hitRadius&&void 0===o.pointHitRadius&&(o.pointHitRadius=o.hitRadius),r.extend(t,{_datasetIndex:n.index,_index:e,_scale:s,_model:{x:i?s.xCenter:u.x,y:i?s.yCenter:u.y,tension:a.tension?a.tension:r.valueOrDefault(o.lineTension,n.chart.options.elements.line.tension),radius:a.radius?a.radius:r.valueAtIndexOrDefault(o.pointRadius,e,l.radius),backgroundColor:a.backgroundColor?a.backgroundColor:r.valueAtIndexOrDefault(o.pointBackgroundColor,e,l.backgroundColor),borderColor:a.borderColor?a.borderColor:r.valueAtIndexOrDefault(o.pointBorderColor,e,l.borderColor),borderWidth:a.borderWidth?a.borderWidth:r.valueAtIndexOrDefault(o.pointBorderWidth,e,l.borderWidth),pointStyle:a.pointStyle?a.pointStyle:r.valueAtIndexOrDefault(o.pointStyle,e,l.pointStyle),hitRadius:a.hitRadius?a.hitRadius:r.valueAtIndexOrDefault(o.pointHitRadius,e,l.hitRadius)}}),t._model.skip=a.skip?a.skip:isNaN(t._model.x)||isNaN(t._model.y)},updateBezierControlPoints:function(){var t=this.chart.chartArea,e=this.getMeta();r.each(e.data,function(i,n){var a=i._model,o=r.splineCurve(r.previousItem(e.data,n,!0)._model,a,r.nextItem(e.data,n,!0)._model,a.tension);a.controlPointPreviousX=Math.max(Math.min(o.previous.x,t.right),t.left),a.controlPointPreviousY=Math.max(Math.min(o.previous.y,t.bottom),t.top),a.controlPointNextX=Math.max(Math.min(o.next.x,t.right),t.left),a.controlPointNextY=Math.max(Math.min(o.next.y,t.bottom),t.top),i.pivot()})},setHoverStyle:function(t){var e=this.chart.data.datasets[t._datasetIndex],i=t.custom||{},n=t._index,a=t._model;a.radius=i.hoverRadius?i.hoverRadius:r.valueAtIndexOrDefault(e.pointHoverRadius,n,this.chart.options.elements.point.hoverRadius),a.backgroundColor=i.hoverBackgroundColor?i.hoverBackgroundColor:r.valueAtIndexOrDefault(e.pointHoverBackgroundColor,n,r.getHoverColor(a.backgroundColor)),a.borderColor=i.hoverBorderColor?i.hoverBorderColor:r.valueAtIndexOrDefault(e.pointHoverBorderColor,n,r.getHoverColor(a.borderColor)),a.borderWidth=i.hoverBorderWidth?i.hoverBorderWidth:r.valueAtIndexOrDefault(e.pointHoverBorderWidth,n,a.borderWidth)},removeHoverStyle:function(t){var e=this.chart.data.datasets[t._datasetIndex],i=t.custom||{},n=t._index,a=t._model,o=this.chart.options.elements.point;a.radius=i.radius?i.radius:r.valueAtIndexOrDefault(e.pointRadius,n,o.radius),a.backgroundColor=i.backgroundColor?i.backgroundColor:r.valueAtIndexOrDefault(e.pointBackgroundColor,n,o.backgroundColor),a.borderColor=i.borderColor?i.borderColor:r.valueAtIndexOrDefault(e.pointBorderColor,n,o.borderColor),a.borderWidth=i.borderWidth?i.borderWidth:r.valueAtIndexOrDefault(e.pointBorderWidth,n,o.borderWidth)}})}},{25:25,40:40,45:45}],21:[function(t,e,i){"use strict";t(25)._set("scatter",{hover:{mode:"single"},scales:{xAxes:[{id:"x-axis-1",type:"linear",position:"bottom"}],yAxes:[{id:"y-axis-1",type:"linear",position:"left"}]},showLines:!1,tooltips:{callbacks:{title:function(){return""},label:function(t){return"("+t.xLabel+", "+t.yLabel+")"}}}}),e.exports=function(t){t.controllers.scatter=t.controllers.line}},{25:25}],22:[function(t,e,i){"use strict";var n=t(25),a=t(26),r=t(45);n._set("global",{animation:{duration:1e3,easing:"easeOutQuart",onProgress:r.noop,onComplete:r.noop}}),e.exports=function(t){t.Animation=a.extend({chart:null,currentStep:0,numSteps:60,easing:"",render:null,onAnimationProgress:null,onAnimationComplete:null}),t.animationService={frameDuration:17,animations:[],dropFrames:0,request:null,addAnimation:function(t,e,i,n){var a,r,o=this.animations;for(e.chart=t,n||(t.animating=!0),a=0,r=o.length;a<r;++a)if(o[a].chart===t)return void(o[a]=e);o.push(e),1===o.length&&this.requestAnimationFrame()},cancelAnimation:function(t){var e=r.findIndex(this.animations,function(e){return e.chart===t});-1!==e&&(this.animations.splice(e,1),t.animating=!1)},requestAnimationFrame:function(){var t=this;null===t.request&&(t.request=r.requestAnimFrame.call(window,function(){t.request=null,t.startDigest()}))},startDigest:function(){var t=this,e=Date.now(),i=0;t.dropFrames>1&&(i=Math.floor(t.dropFrames),t.dropFrames=t.dropFrames%1),t.advance(1+i);var n=Date.now();t.dropFrames+=(n-e)/t.frameDuration,t.animations.length>0&&t.requestAnimationFrame()},advance:function(t){for(var e,i,n=this.animations,a=0;a<n.length;)i=(e=n[a]).chart,e.currentStep=(e.currentStep||0)+t,e.currentStep=Math.min(e.currentStep,e.numSteps),r.callback(e.render,[i,e],i),r.callback(e.onAnimationProgress,[e],i),e.currentStep>=e.numSteps?(r.callback(e.onAnimationComplete,[e],i),i.animating=!1,n.splice(a,1)):++a}},Object.defineProperty(t.Animation.prototype,"animationObject",{get:function(){return this}}),Object.defineProperty(t.Animation.prototype,"chartInstance",{get:function(){return this.chart},set:function(t){this.chart=t}})}},{25:25,26:26,45:45}],23:[function(t,e,i){"use strict";var n=t(25),a=t(45),r=t(28),o=t(30),s=t(48),l=t(31);e.exports=function(t){function e(t){return"top"===t||"bottom"===t}t.types={},t.instances={},t.controllers={},a.extend(t.prototype,{construct:function(e,i){var r,o,l=this;(o=(r=(r=i)||{}).data=r.data||{}).datasets=o.datasets||[],o.labels=o.labels||[],r.options=a.configMerge(n.global,n[r.type],r.options||{}),i=r;var u=s.acquireContext(e,i),d=u&&u.canvas,h=d&&d.height,c=d&&d.width;l.id=a.uid(),l.ctx=u,l.canvas=d,l.config=i,l.width=c,l.height=h,l.aspectRatio=h?c/h:null,l.options=i.options,l._bufferedRender=!1,l.chart=l,l.controller=l,t.instances[l.id]=l,Object.defineProperty(l,"data",{get:function(){return l.config.data},set:function(t){l.config.data=t}}),u&&d?(l.initialize(),l.update()):console.error("Failed to create chart: can't acquire context from the given item")},initialize:function(){var t=this;return l.notify(t,"beforeInit"),a.retinaScale(t,t.options.devicePixelRatio),t.bindEvents(),t.options.responsive&&t.resize(!0),t.ensureScalesHaveIDs(),t.buildOrUpdateScales(),t.initToolTip(),l.notify(t,"afterInit"),t},clear:function(){return a.canvas.clear(this),this},stop:function(){return t.animationService.cancelAnimation(this),this},resize:function(t){var e=this,i=e.options,n=e.canvas,r=i.maintainAspectRatio&&e.aspectRatio||null,o=Math.max(0,Math.floor(a.getMaximumWidth(n))),s=Math.max(0,Math.floor(r?o/r:a.getMaximumHeight(n)));if((e.width!==o||e.height!==s)&&(n.width=e.width=o,n.height=e.height=s,n.style.width=o+"px",n.style.height=s+"px",a.retinaScale(e,i.devicePixelRatio),!t)){var u={width:o,height:s};l.notify(e,"resize",[u]),e.options.onResize&&e.options.onResize(e,u),e.stop(),e.update(e.options.responsiveAnimationDuration)}},ensureScalesHaveIDs:function(){var t=this.options,e=t.scales||{},i=t.scale;a.each(e.xAxes,function(t,e){t.id=t.id||"x-axis-"+e}),a.each(e.yAxes,function(t,e){t.id=t.id||"y-axis-"+e}),i&&(i.id=i.id||"scale")},buildOrUpdateScales:function(){var i=this,n=i.options,r=i.scales||{},o=[],s=Object.keys(r).reduce(function(t,e){return t[e]=!1,t},{});n.scales&&(o=o.concat((n.scales.xAxes||[]).map(function(t){return{options:t,dtype:"category",dposition:"bottom"}}),(n.scales.yAxes||[]).map(function(t){return{options:t,dtype:"linear",dposition:"left"}}))),n.scale&&o.push({options:n.scale,dtype:"radialLinear",isDefault:!0,dposition:"chartArea"}),a.each(o,function(n){var o=n.options,l=o.id,u=a.valueOrDefault(o.type,n.dtype);e(o.position)!==e(n.dposition)&&(o.position=n.dposition),s[l]=!0;var d=null;if(l in r&&r[l].type===u)(d=r[l]).options=o,d.ctx=i.ctx,d.chart=i;else{var h=t.scaleService.getScaleConstructor(u);if(!h)return;d=new h({id:l,type:u,options:o,ctx:i.ctx,chart:i}),r[d.id]=d}d.mergeTicksOptions(),n.isDefault&&(i.scale=d)}),a.each(s,function(t,e){t||delete r[e]}),i.scales=r,t.scaleService.addScalesToLayout(this)},buildOrUpdateControllers:function(){var e=this,i=[],n=[];return a.each(e.data.datasets,function(a,r){var o=e.getDatasetMeta(r),s=a.type||e.config.type;if(o.type&&o.type!==s&&(e.destroyDatasetMeta(r),o=e.getDatasetMeta(r)),o.type=s,i.push(o.type),o.controller)o.controller.updateIndex(r),o.controller.linkScales();else{var l=t.controllers[o.type];if(void 0===l)throw new Error('"'+o.type+'" is not a chart type.');o.controller=new l(e,r),n.push(o.controller)}},e),n},resetElements:function(){var t=this;a.each(t.data.datasets,function(e,i){t.getDatasetMeta(i).controller.reset()},t)},reset:function(){this.resetElements(),this.tooltip.initialize()},update:function(e){var i,n,r=this;if(e&&"object"==typeof e||(e={duration:e,lazy:arguments[1]}),n=(i=r).options,a.each(i.scales,function(t){o.removeBox(i,t)}),n=a.configMerge(t.defaults.global,t.defaults[i.config.type],n),i.options=i.config.options=n,i.ensureScalesHaveIDs(),i.buildOrUpdateScales(),i.tooltip._options=n.tooltips,i.tooltip.initialize(),l._invalidate(r),!1!==l.notify(r,"beforeUpdate")){r.tooltip._data=r.data;var s=r.buildOrUpdateControllers();a.each(r.data.datasets,function(t,e){r.getDatasetMeta(e).controller.buildOrUpdateElements()},r),r.updateLayout(),r.options.animation&&r.options.animation.duration&&a.each(s,function(t){t.reset()}),r.updateDatasets(),r.tooltip.initialize(),r.lastActive=[],l.notify(r,"afterUpdate"),r._bufferedRender?r._bufferedRequest={duration:e.duration,easing:e.easing,lazy:e.lazy}:r.render(e)}},updateLayout:function(){!1!==l.notify(this,"beforeLayout")&&(o.update(this,this.width,this.height),l.notify(this,"afterScaleUpdate"),l.notify(this,"afterLayout"))},updateDatasets:function(){if(!1!==l.notify(this,"beforeDatasetsUpdate")){for(var t=0,e=this.data.datasets.length;t<e;++t)this.updateDataset(t);l.notify(this,"afterDatasetsUpdate")}},updateDataset:function(t){var e=this.getDatasetMeta(t),i={meta:e,index:t};!1!==l.notify(this,"beforeDatasetUpdate",[i])&&(e.controller.update(),l.notify(this,"afterDatasetUpdate",[i]))},render:function(e){var i=this;e&&"object"==typeof e||(e={duration:e,lazy:arguments[1]});var n=e.duration,r=e.lazy;if(!1!==l.notify(i,"beforeRender")){var o=i.options.animation,s=function(t){l.notify(i,"afterRender"),a.callback(o&&o.onComplete,[t],i)};if(o&&(void 0!==n&&0!==n||void 0===n&&0!==o.duration)){var u=new t.Animation({numSteps:(n||o.duration)/16.66,easing:e.easing||o.easing,render:function(t,e){var i=a.easing.effects[e.easing],n=e.currentStep,r=n/e.numSteps;t.draw(i(r),r,n)},onAnimationProgress:o.onProgress,onAnimationComplete:s});t.animationService.addAnimation(i,u,n,r)}else i.draw(),s(new t.Animation({numSteps:0,chart:i}));return i}},draw:function(t){var e=this;e.clear(),a.isNullOrUndef(t)&&(t=1),e.transition(t),!1!==l.notify(e,"beforeDraw",[t])&&(a.each(e.boxes,function(t){t.draw(e.chartArea)},e),e.scale&&e.scale.draw(),e.drawDatasets(t),e._drawTooltip(t),l.notify(e,"afterDraw",[t]))},transition:function(t){for(var e=0,i=(this.data.datasets||[]).length;e<i;++e)this.isDatasetVisible(e)&&this.getDatasetMeta(e).controller.transition(t);this.tooltip.transition(t)},drawDatasets:function(t){var e=this;if(!1!==l.notify(e,"beforeDatasetsDraw",[t])){for(var i=(e.data.datasets||[]).length-1;i>=0;--i)e.isDatasetVisible(i)&&e.drawDataset(i,t);l.notify(e,"afterDatasetsDraw",[t])}},drawDataset:function(t,e){var i=this.getDatasetMeta(t),n={meta:i,index:t,easingValue:e};!1!==l.notify(this,"beforeDatasetDraw",[n])&&(i.controller.draw(e),l.notify(this,"afterDatasetDraw",[n]))},_drawTooltip:function(t){var e=this.tooltip,i={tooltip:e,easingValue:t};!1!==l.notify(this,"beforeTooltipDraw",[i])&&(e.draw(),l.notify(this,"afterTooltipDraw",[i]))},getElementAtEvent:function(t){return r.modes.single(this,t)},getElementsAtEvent:function(t){return r.modes.label(this,t,{intersect:!0})},getElementsAtXAxis:function(t){return r.modes["x-axis"](this,t,{intersect:!0})},getElementsAtEventForMode:function(t,e,i){var n=r.modes[e];return"function"==typeof n?n(this,t,i):[]},getDatasetAtEvent:function(t){return r.modes.dataset(this,t,{intersect:!0})},getDatasetMeta:function(t){var e=this.data.datasets[t];e._meta||(e._meta={});var i=e._meta[this.id];return i||(i=e._meta[this.id]={type:null,data:[],dataset:null,controller:null,hidden:null,xAxisID:null,yAxisID:null}),i},getVisibleDatasetCount:function(){for(var t=0,e=0,i=this.data.datasets.length;e<i;++e)this.isDatasetVisible(e)&&t++;return t},isDatasetVisible:function(t){var e=this.getDatasetMeta(t);return"boolean"==typeof e.hidden?!e.hidden:!this.data.datasets[t].hidden},generateLegend:function(){return this.options.legendCallback(this)},destroyDatasetMeta:function(t){var e=this.id,i=this.data.datasets[t],n=i._meta&&i._meta[e];n&&(n.controller.destroy(),delete i._meta[e])},destroy:function(){var e,i,n=this,r=n.canvas;for(n.stop(),e=0,i=n.data.datasets.length;e<i;++e)n.destroyDatasetMeta(e);r&&(n.unbindEvents(),a.canvas.clear(n),s.releaseContext(n.ctx),n.canvas=null,n.ctx=null),l.notify(n,"destroy"),delete t.instances[n.id]},toBase64Image:function(){return this.canvas.toDataURL.apply(this.canvas,arguments)},initToolTip:function(){var e=this;e.tooltip=new t.Tooltip({_chart:e,_chartInstance:e,_data:e.data,_options:e.options.tooltips},e)},bindEvents:function(){var t=this,e=t._listeners={},i=function(){t.eventHandler.apply(t,arguments)};a.each(t.options.events,function(n){s.addEventListener(t,n,i),e[n]=i}),t.options.responsive&&(i=function(){t.resize()},s.addEventListener(t,"resize",i),e.resize=i)},unbindEvents:function(){var t=this,e=t._listeners;e&&(delete t._listeners,a.each(e,function(e,i){s.removeEventListener(t,i,e)}))},updateHoverStyle:function(t,e,i){var n,a,r,o=i?"setHoverStyle":"removeHoverStyle";for(a=0,r=t.length;a<r;++a)(n=t[a])&&this.getDatasetMeta(n._datasetIndex).controller[o](n)},eventHandler:function(t){var e=this,i=e.tooltip;if(!1!==l.notify(e,"beforeEvent",[t])){e._bufferedRender=!0,e._bufferedRequest=null;var n=e.handleEvent(t);i&&(n=i._start?i.handleEvent(t):n|i.handleEvent(t)),l.notify(e,"afterEvent",[t]);var a=e._bufferedRequest;return a?e.render(a):n&&!e.animating&&(e.stop(),e.render(e.options.hover.animationDuration,!0)),e._bufferedRender=!1,e._bufferedRequest=null,e}},handleEvent:function(t){var e,i=this,n=i.options||{},r=n.hover;return i.lastActive=i.lastActive||[],"mouseout"===t.type?i.active=[]:i.active=i.getElementsAtEventForMode(t,r.mode,r),a.callback(n.onHover||n.hover.onHover,[t.native,i.active],i),"mouseup"!==t.type&&"click"!==t.type||n.onClick&&n.onClick.call(i,t.native,i.active),i.lastActive.length&&i.updateHoverStyle(i.lastActive,r.mode,!1),i.active.length&&r.mode&&i.updateHoverStyle(i.active,r.mode,!0),e=!a.arrayEquals(i.active,i.lastActive),i.lastActive=i.active,e}}),t.Controller=t}},{25:25,28:28,30:30,31:31,45:45,48:48}],24:[function(t,e,i){"use strict";var n=t(45);e.exports=function(t){var e=["push","pop","shift","splice","unshift"];function i(t,i){var n=t._chartjs;if(n){var a=n.listeners,r=a.indexOf(i);-1!==r&&a.splice(r,1),a.length>0||(e.forEach(function(e){delete t[e]}),delete t._chartjs)}}t.DatasetController=function(t,e){this.initialize(t,e)},n.extend(t.DatasetController.prototype,{datasetElementType:null,dataElementType:null,initialize:function(t,e){this.chart=t,this.index=e,this.linkScales(),this.addElements()},updateIndex:function(t){this.index=t},linkScales:function(){var t=this,e=t.getMeta(),i=t.getDataset();null!==e.xAxisID&&e.xAxisID in t.chart.scales||(e.xAxisID=i.xAxisID||t.chart.options.scales.xAxes[0].id),null!==e.yAxisID&&e.yAxisID in t.chart.scales||(e.yAxisID=i.yAxisID||t.chart.options.scales.yAxes[0].id)},getDataset:function(){return this.chart.data.datasets[this.index]},getMeta:function(){return this.chart.getDatasetMeta(this.index)},getScaleForId:function(t){return this.chart.scales[t]},reset:function(){this.update(!0)},destroy:function(){this._data&&i(this._data,this)},createMetaDataset:function(){var t=this.datasetElementType;return t&&new t({_chart:this.chart,_datasetIndex:this.index})},createMetaData:function(t){var e=this.dataElementType;return e&&new e({_chart:this.chart,_datasetIndex:this.index,_index:t})},addElements:function(){var t,e,i=this.getMeta(),n=this.getDataset().data||[],a=i.data;for(t=0,e=n.length;t<e;++t)a[t]=a[t]||this.createMetaData(t);i.dataset=i.dataset||this.createMetaDataset()},addElementAndReset:function(t){var e=this.createMetaData(t);this.getMeta().data.splice(t,0,e),this.updateElement(e,t,!0)},buildOrUpdateElements:function(){var t,a,r=this,o=r.getDataset(),s=o.data||(o.data=[]);r._data!==s&&(r._data&&i(r._data,r),a=r,(t=s)._chartjs?t._chartjs.listeners.push(a):(Object.defineProperty(t,"_chartjs",{configurable:!0,enumerable:!1,value:{listeners:[a]}}),e.forEach(function(e){var i="onData"+e.charAt(0).toUpperCase()+e.slice(1),a=t[e];Object.defineProperty(t,e,{configurable:!0,enumerable:!1,value:function(){var e=Array.prototype.slice.call(arguments),r=a.apply(this,e);return n.each(t._chartjs.listeners,function(t){"function"==typeof t[i]&&t[i].apply(t,e)}),r}})})),r._data=s),r.resyncElements()},update:n.noop,transition:function(t){for(var e=this.getMeta(),i=e.data||[],n=i.length,a=0;a<n;++a)i[a].transition(t);e.dataset&&e.dataset.transition(t)},draw:function(){var t=this.getMeta(),e=t.data||[],i=e.length,n=0;for(t.dataset&&t.dataset.draw();n<i;++n)e[n].draw()},removeHoverStyle:function(t,e){var i=this.chart.data.datasets[t._datasetIndex],a=t._index,r=t.custom||{},o=n.valueAtIndexOrDefault,s=t._model;s.backgroundColor=r.backgroundColor?r.backgroundColor:o(i.backgroundColor,a,e.backgroundColor),s.borderColor=r.borderColor?r.borderColor:o(i.borderColor,a,e.borderColor),s.borderWidth=r.borderWidth?r.borderWidth:o(i.borderWidth,a,e.borderWidth)},setHoverStyle:function(t){var e=this.chart.data.datasets[t._datasetIndex],i=t._index,a=t.custom||{},r=n.valueAtIndexOrDefault,o=n.getHoverColor,s=t._model;s.backgroundColor=a.hoverBackgroundColor?a.hoverBackgroundColor:r(e.hoverBackgroundColor,i,o(s.backgroundColor)),s.borderColor=a.hoverBorderColor?a.hoverBorderColor:r(e.hoverBorderColor,i,o(s.borderColor)),s.borderWidth=a.hoverBorderWidth?a.hoverBorderWidth:r(e.hoverBorderWidth,i,s.borderWidth)},resyncElements:function(){var t=this.getMeta(),e=this.getDataset().data,i=t.data.length,n=e.length;n<i?t.data.splice(n,i-n):n>i&&this.insertElements(i,n-i)},insertElements:function(t,e){for(var i=0;i<e;++i)this.addElementAndReset(t+i)},onDataPush:function(){this.insertElements(this.getDataset().data.length-1,arguments.length)},onDataPop:function(){this.getMeta().data.pop()},onDataShift:function(){this.getMeta().data.shift()},onDataSplice:function(t,e){this.getMeta().data.splice(t,e),this.insertElements(t,arguments.length-2)},onDataUnshift:function(){this.insertElements(0,arguments.length)}}),t.DatasetController.extend=n.inherits}},{45:45}],25:[function(t,e,i){"use strict";var n=t(45);e.exports={_set:function(t,e){return n.merge(this[t]||(this[t]={}),e)}}},{45:45}],26:[function(t,e,i){"use strict";var n=t(2),a=t(45);var r=function(t){a.extend(this,t),this.initialize.apply(this,arguments)};a.extend(r.prototype,{initialize:function(){this.hidden=!1},pivot:function(){var t=this;return t._view||(t._view=a.clone(t._model)),t._start={},t},transition:function(t){var e=this,i=e._model,a=e._start,r=e._view;return i&&1!==t?(r||(r=e._view={}),a||(a=e._start={}),function(t,e,i,a){var r,o,s,l,u,d,h,c,f,g=Object.keys(i);for(r=0,o=g.length;r<o;++r)if(d=i[s=g[r]],e.hasOwnProperty(s)||(e[s]=d),(l=e[s])!==d&&"_"!==s[0]){if(t.hasOwnProperty(s)||(t[s]=l),(h=typeof d)==typeof(u=t[s]))if("string"===h){if((c=n(u)).valid&&(f=n(d)).valid){e[s]=f.mix(c,a).rgbString();continue}}else if("number"===h&&isFinite(u)&&isFinite(d)){e[s]=u+(d-u)*a;continue}e[s]=d}}(a,r,i,t),e):(e._view=i,e._start=null,e)},tooltipPosition:function(){return{x:this._model.x,y:this._model.y}},hasValue:function(){return a.isNumber(this._model.x)&&a.isNumber(this._model.y)}}),r.extend=a.inherits,e.exports=r},{2:2,45:45}],27:[function(t,e,i){"use strict";var n=t(2),a=t(25),r=t(45);e.exports=function(t){function e(t,e,i){var n;return"string"==typeof t?(n=parseInt(t,10),-1!==t.indexOf("%")&&(n=n/100*e.parentNode[i])):n=t,n}function i(t){return null!=t&&"none"!==t}function o(t,n,a){var r=document.defaultView,o=t.parentNode,s=r.getComputedStyle(t)[n],l=r.getComputedStyle(o)[n],u=i(s),d=i(l),h=Number.POSITIVE_INFINITY;return u||d?Math.min(u?e(s,t,a):h,d?e(l,o,a):h):"none"}r.configMerge=function(){return r.merge(r.clone(arguments[0]),[].slice.call(arguments,1),{merger:function(e,i,n,a){var o=i[e]||{},s=n[e];"scales"===e?i[e]=r.scaleMerge(o,s):"scale"===e?i[e]=r.merge(o,[t.scaleService.getScaleDefaults(s.type),s]):r._merger(e,i,n,a)}})},r.scaleMerge=function(){return r.merge(r.clone(arguments[0]),[].slice.call(arguments,1),{merger:function(e,i,n,a){if("xAxes"===e||"yAxes"===e){var o,s,l,u=n[e].length;for(i[e]||(i[e]=[]),o=0;o<u;++o)l=n[e][o],s=r.valueOrDefault(l.type,"xAxes"===e?"category":"linear"),o>=i[e].length&&i[e].push({}),!i[e][o].type||l.type&&l.type!==i[e][o].type?r.merge(i[e][o],[t.scaleService.getScaleDefaults(s),l]):r.merge(i[e][o],l)}else r._merger(e,i,n,a)}})},r.where=function(t,e){if(r.isArray(t)&&Array.prototype.filter)return t.filter(e);var i=[];return r.each(t,function(t){e(t)&&i.push(t)}),i},r.findIndex=Array.prototype.findIndex?function(t,e,i){return t.findIndex(e,i)}:function(t,e,i){i=void 0===i?t:i;for(var n=0,a=t.length;n<a;++n)if(e.call(i,t[n],n,t))return n;return-1},r.findNextWhere=function(t,e,i){r.isNullOrUndef(i)&&(i=-1);for(var n=i+1;n<t.length;n++){var a=t[n];if(e(a))return a}},r.findPreviousWhere=function(t,e,i){r.isNullOrUndef(i)&&(i=t.length);for(var n=i-1;n>=0;n--){var a=t[n];if(e(a))return a}},r.isNumber=function(t){return!isNaN(parseFloat(t))&&isFinite(t)},r.almostEquals=function(t,e,i){return Math.abs(t-e)<i},r.almostWhole=function(t,e){var i=Math.round(t);return i-e<t&&i+e>t},r.max=function(t){return t.reduce(function(t,e){return isNaN(e)?t:Math.max(t,e)},Number.NEGATIVE_INFINITY)},r.min=function(t){return t.reduce(function(t,e){return isNaN(e)?t:Math.min(t,e)},Number.POSITIVE_INFINITY)},r.sign=Math.sign?function(t){return Math.sign(t)}:function(t){return 0===(t=+t)||isNaN(t)?t:t>0?1:-1},r.log10=Math.log10?function(t){return Math.log10(t)}:function(t){var e=Math.log(t)*Math.LOG10E,i=Math.round(e);return t===Math.pow(10,i)?i:e},r.toRadians=function(t){return t*(Math.PI/180)},r.toDegrees=function(t){return t*(180/Math.PI)},r.getAngleFromPoint=function(t,e){var i=e.x-t.x,n=e.y-t.y,a=Math.sqrt(i*i+n*n),r=Math.atan2(n,i);return r<-.5*Math.PI&&(r+=2*Math.PI),{angle:r,distance:a}},r.distanceBetweenPoints=function(t,e){return Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))},r.aliasPixel=function(t){return t%2==0?0:.5},r.splineCurve=function(t,e,i,n){var a=t.skip?e:t,r=e,o=i.skip?e:i,s=Math.sqrt(Math.pow(r.x-a.x,2)+Math.pow(r.y-a.y,2)),l=Math.sqrt(Math.pow(o.x-r.x,2)+Math.pow(o.y-r.y,2)),u=s/(s+l),d=l/(s+l),h=n*(u=isNaN(u)?0:u),c=n*(d=isNaN(d)?0:d);return{previous:{x:r.x-h*(o.x-a.x),y:r.y-h*(o.y-a.y)},next:{x:r.x+c*(o.x-a.x),y:r.y+c*(o.y-a.y)}}},r.EPSILON=Number.EPSILON||1e-14,r.splineCurveMonotone=function(t){var e,i,n,a,o,s,l,u,d,h=(t||[]).map(function(t){return{model:t._model,deltaK:0,mK:0}}),c=h.length;for(e=0;e<c;++e)if(!(n=h[e]).model.skip){if(i=e>0?h[e-1]:null,(a=e<c-1?h[e+1]:null)&&!a.model.skip){var f=a.model.x-n.model.x;n.deltaK=0!==f?(a.model.y-n.model.y)/f:0}!i||i.model.skip?n.mK=n.deltaK:!a||a.model.skip?n.mK=i.deltaK:this.sign(i.deltaK)!==this.sign(n.deltaK)?n.mK=0:n.mK=(i.deltaK+n.deltaK)/2}for(e=0;e<c-1;++e)n=h[e],a=h[e+1],n.model.skip||a.model.skip||(r.almostEquals(n.deltaK,0,this.EPSILON)?n.mK=a.mK=0:(o=n.mK/n.deltaK,s=a.mK/n.deltaK,(u=Math.pow(o,2)+Math.pow(s,2))<=9||(l=3/Math.sqrt(u),n.mK=o*l*n.deltaK,a.mK=s*l*n.deltaK)));for(e=0;e<c;++e)(n=h[e]).model.skip||(i=e>0?h[e-1]:null,a=e<c-1?h[e+1]:null,i&&!i.model.skip&&(d=(n.model.x-i.model.x)/3,n.model.controlPointPreviousX=n.model.x-d,n.model.controlPointPreviousY=n.model.y-d*n.mK),a&&!a.model.skip&&(d=(a.model.x-n.model.x)/3,n.model.controlPointNextX=n.model.x+d,n.model.controlPointNextY=n.model.y+d*n.mK))},r.nextItem=function(t,e,i){return i?e>=t.length-1?t[0]:t[e+1]:e>=t.length-1?t[t.length-1]:t[e+1]},r.previousItem=function(t,e,i){return i?e<=0?t[t.length-1]:t[e-1]:e<=0?t[0]:t[e-1]},r.niceNum=function(t,e){var i=Math.floor(r.log10(t)),n=t/Math.pow(10,i);return(e?n<1.5?1:n<3?2:n<7?5:10:n<=1?1:n<=2?2:n<=5?5:10)*Math.pow(10,i)},r.requestAnimFrame="undefined"==typeof window?function(t){t()}:window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t){return window.setTimeout(t,1e3/60)},r.getRelativePosition=function(t,e){var i,n,a=t.originalEvent||t,o=t.currentTarget||t.srcElement,s=o.getBoundingClientRect(),l=a.touches;l&&l.length>0?(i=l[0].clientX,n=l[0].clientY):(i=a.clientX,n=a.clientY);var u=parseFloat(r.getStyle(o,"padding-left")),d=parseFloat(r.getStyle(o,"padding-top")),h=parseFloat(r.getStyle(o,"padding-right")),c=parseFloat(r.getStyle(o,"padding-bottom")),f=s.right-s.left-u-h,g=s.bottom-s.top-d-c;return{x:i=Math.round((i-s.left-u)/f*o.width/e.currentDevicePixelRatio),y:n=Math.round((n-s.top-d)/g*o.height/e.currentDevicePixelRatio)}},r.getConstraintWidth=function(t){return o(t,"max-width","clientWidth")},r.getConstraintHeight=function(t){return o(t,"max-height","clientHeight")},r.getMaximumWidth=function(t){var e=t.parentNode;if(!e)return t.clientWidth;var i=parseInt(r.getStyle(e,"padding-left"),10),n=parseInt(r.getStyle(e,"padding-right"),10),a=e.clientWidth-i-n,o=r.getConstraintWidth(t);return isNaN(o)?a:Math.min(a,o)},r.getMaximumHeight=function(t){var e=t.parentNode;if(!e)return t.clientHeight;var i=parseInt(r.getStyle(e,"padding-top"),10),n=parseInt(r.getStyle(e,"padding-bottom"),10),a=e.clientHeight-i-n,o=r.getConstraintHeight(t);return isNaN(o)?a:Math.min(a,o)},r.getStyle=function(t,e){return t.currentStyle?t.currentStyle[e]:document.defaultView.getComputedStyle(t,null).getPropertyValue(e)},r.retinaScale=function(t,e){var i=t.currentDevicePixelRatio=e||window.devicePixelRatio||1;if(1!==i){var n=t.canvas,a=t.height,r=t.width;n.height=a*i,n.width=r*i,t.ctx.scale(i,i),n.style.height||n.style.width||(n.style.height=a+"px",n.style.width=r+"px")}},r.fontString=function(t,e,i){return e+" "+t+"px "+i},r.longestText=function(t,e,i,n){var a=(n=n||{}).data=n.data||{},o=n.garbageCollect=n.garbageCollect||[];n.font!==e&&(a=n.data={},o=n.garbageCollect=[],n.font=e),t.font=e;var s=0;r.each(i,function(e){null!=e&&!0!==r.isArray(e)?s=r.measureText(t,a,o,s,e):r.isArray(e)&&r.each(e,function(e){null==e||r.isArray(e)||(s=r.measureText(t,a,o,s,e))})});var l=o.length/2;if(l>i.length){for(var u=0;u<l;u++)delete a[o[u]];o.splice(0,l)}return s},r.measureText=function(t,e,i,n,a){var r=e[a];return r||(r=e[a]=t.measureText(a).width,i.push(a)),r>n&&(n=r),n},r.numberOfLabelLines=function(t){var e=1;return r.each(t,function(t){r.isArray(t)&&t.length>e&&(e=t.length)}),e},r.color=n?function(t){return t instanceof CanvasGradient&&(t=a.global.defaultColor),n(t)}:function(t){return console.error("Color.js not found!"),t},r.getHoverColor=function(t){return t instanceof CanvasPattern?t:r.color(t).saturate(.5).darken(.1).rgbString()}}},{2:2,25:25,45:45}],28:[function(t,e,i){"use strict";var n=t(45);function a(t,e){return t.native?{x:t.x,y:t.y}:n.getRelativePosition(t,e)}function r(t,e){var i,n,a,r,o;for(n=0,r=t.data.datasets.length;n<r;++n)if(t.isDatasetVisible(n))for(a=0,o=(i=t.getDatasetMeta(n)).data.length;a<o;++a){var s=i.data[a];s._view.skip||e(s)}}function o(t,e){var i=[];return r(t,function(t){t.inRange(e.x,e.y)&&i.push(t)}),i}function s(t,e,i,n){var a=Number.POSITIVE_INFINITY,o=[];return r(t,function(t){if(!i||t.inRange(e.x,e.y)){var r=t.getCenterPoint(),s=n(e,r);s<a?(o=[t],a=s):s===a&&o.push(t)}}),o}function l(t){var e=-1!==t.indexOf("x"),i=-1!==t.indexOf("y");return function(t,n){var a=e?Math.abs(t.x-n.x):0,r=i?Math.abs(t.y-n.y):0;return Math.sqrt(Math.pow(a,2)+Math.pow(r,2))}}function u(t,e,i){var n=a(e,t);i.axis=i.axis||"x";var r=l(i.axis),u=i.intersect?o(t,n):s(t,n,!1,r),d=[];return u.length?(t.data.datasets.forEach(function(e,i){if(t.isDatasetVisible(i)){var n=t.getDatasetMeta(i).data[u[0]._index];n&&!n._view.skip&&d.push(n)}}),d):[]}e.exports={modes:{single:function(t,e){var i=a(e,t),n=[];return r(t,function(t){if(t.inRange(i.x,i.y))return n.push(t),n}),n.slice(0,1)},label:u,index:u,dataset:function(t,e,i){var n=a(e,t);i.axis=i.axis||"xy";var r=l(i.axis),u=i.intersect?o(t,n):s(t,n,!1,r);return u.length>0&&(u=t.getDatasetMeta(u[0]._datasetIndex).data),u},"x-axis":function(t,e){return u(t,e,{intersect:!1})},point:function(t,e){return o(t,a(e,t))},nearest:function(t,e,i){var n=a(e,t);i.axis=i.axis||"xy";var r=l(i.axis),o=s(t,n,i.intersect,r);return o.length>1&&o.sort(function(t,e){var i=t.getArea()-e.getArea();return 0===i&&(i=t._datasetIndex-e._datasetIndex),i}),o.slice(0,1)},x:function(t,e,i){var n=a(e,t),o=[],s=!1;return r(t,function(t){t.inXRange(n.x)&&o.push(t),t.inRange(n.x,n.y)&&(s=!0)}),i.intersect&&!s&&(o=[]),o},y:function(t,e,i){var n=a(e,t),o=[],s=!1;return r(t,function(t){t.inYRange(n.y)&&o.push(t),t.inRange(n.x,n.y)&&(s=!0)}),i.intersect&&!s&&(o=[]),o}}}},{45:45}],29:[function(t,e,i){"use strict";t(25)._set("global",{responsive:!0,responsiveAnimationDuration:0,maintainAspectRatio:!0,events:["mousemove","mouseout","click","touchstart","touchmove"],hover:{onHover:null,mode:"nearest",intersect:!0,animationDuration:400},onClick:null,defaultColor:"rgba(0,0,0,0.1)",defaultFontColor:"#666",defaultFontFamily:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",defaultFontSize:12,defaultFontStyle:"normal",showLines:!0,elements:{},layout:{padding:{top:0,right:0,bottom:0,left:0}}}),e.exports=function(){var t=function(t,e){return this.construct(t,e),this};return t.Chart=t,t}},{25:25}],30:[function(t,e,i){"use strict";var n=t(45);function a(t,e){return n.where(t,function(t){return t.position===e})}function r(t,e){t.forEach(function(t,e){return t._tmpIndex_=e,t}),t.sort(function(t,i){var n=e?i:t,a=e?t:i;return n.weight===a.weight?n._tmpIndex_-a._tmpIndex_:n.weight-a.weight}),t.forEach(function(t){delete t._tmpIndex_})}e.exports={defaults:{},addBox:function(t,e){t.boxes||(t.boxes=[]),e.fullWidth=e.fullWidth||!1,e.position=e.position||"top",e.weight=e.weight||0,t.boxes.push(e)},removeBox:function(t,e){var i=t.boxes?t.boxes.indexOf(e):-1;-1!==i&&t.boxes.splice(i,1)},configure:function(t,e,i){for(var n,a=["fullWidth","position","weight"],r=a.length,o=0;o<r;++o)n=a[o],i.hasOwnProperty(n)&&(e[n]=i[n])},update:function(t,e,i){if(t){var o=t.options.layout||{},s=n.options.toPadding(o.padding),l=s.left,u=s.right,d=s.top,h=s.bottom,c=a(t.boxes,"left"),f=a(t.boxes,"right"),g=a(t.boxes,"top"),m=a(t.boxes,"bottom"),p=a(t.boxes,"chartArea");r(c,!0),r(f,!1),r(g,!0),r(m,!1);var v=e-l-u,y=i-d-h,b=y/2,x=(e-v/2)/(c.length+f.length),_=(i-b)/(g.length+m.length),k=v,w=y,M=[];n.each(c.concat(f,g,m),function(t){var e,i=t.isHorizontal();i?(e=t.update(t.fullWidth?v:k,_),w-=e.height):(e=t.update(x,w),k-=e.width),M.push({horizontal:i,minSize:e,box:t})});var S=0,D=0,C=0,P=0;n.each(g.concat(m),function(t){if(t.getPadding){var e=t.getPadding();S=Math.max(S,e.left),D=Math.max(D,e.right)}}),n.each(c.concat(f),function(t){if(t.getPadding){var e=t.getPadding();C=Math.max(C,e.top),P=Math.max(P,e.bottom)}});var T=l,O=u,I=d,A=h;n.each(c.concat(f),z),n.each(c,function(t){T+=t.width}),n.each(f,function(t){O+=t.width}),n.each(g.concat(m),z),n.each(g,function(t){I+=t.height}),n.each(m,function(t){A+=t.height}),n.each(c.concat(f),function(t){var e=n.findNextWhere(M,function(e){return e.box===t}),i={left:0,right:0,top:I,bottom:A};e&&t.update(e.minSize.width,w,i)}),T=l,O=u,I=d,A=h,n.each(c,function(t){T+=t.width}),n.each(f,function(t){O+=t.width}),n.each(g,function(t){I+=t.height}),n.each(m,function(t){A+=t.height});var F=Math.max(S-T,0);T+=F,O+=Math.max(D-O,0);var R=Math.max(C-I,0);I+=R,A+=Math.max(P-A,0);var L=i-I-A,W=e-T-O;W===k&&L===w||(n.each(c,function(t){t.height=L}),n.each(f,function(t){t.height=L}),n.each(g,function(t){t.fullWidth||(t.width=W)}),n.each(m,function(t){t.fullWidth||(t.width=W)}),w=L,k=W);var Y=l+F,N=d+R;n.each(c.concat(g),H),Y+=k,N+=w,n.each(f,H),n.each(m,H),t.chartArea={left:T,top:I,right:T+k,bottom:I+w},n.each(p,function(e){e.left=t.chartArea.left,e.top=t.chartArea.top,e.right=t.chartArea.right,e.bottom=t.chartArea.bottom,e.update(k,w)})}function z(t){var e=n.findNextWhere(M,function(e){return e.box===t});if(e)if(t.isHorizontal()){var i={left:Math.max(T,S),right:Math.max(O,D),top:0,bottom:0};t.update(t.fullWidth?v:k,y/2,i)}else t.update(e.minSize.width,w)}function H(t){t.isHorizontal()?(t.left=t.fullWidth?l:T,t.right=t.fullWidth?e-u:T+k,t.top=N,t.bottom=N+t.height,N=t.bottom):(t.left=Y,t.right=Y+t.width,t.top=I,t.bottom=I+w,Y=t.right)}}}},{45:45}],31:[function(t,e,i){"use strict";var n=t(25),a=t(45);n._set("global",{plugins:{}}),e.exports={_plugins:[],_cacheId:0,register:function(t){var e=this._plugins;[].concat(t).forEach(function(t){-1===e.indexOf(t)&&e.push(t)}),this._cacheId++},unregister:function(t){var e=this._plugins;[].concat(t).forEach(function(t){var i=e.indexOf(t);-1!==i&&e.splice(i,1)}),this._cacheId++},clear:function(){this._plugins=[],this._cacheId++},count:function(){return this._plugins.length},getAll:function(){return this._plugins},notify:function(t,e,i){var n,a,r,o,s,l=this.descriptors(t),u=l.length;for(n=0;n<u;++n)if("function"==typeof(s=(r=(a=l[n]).plugin)[e])&&((o=[t].concat(i||[])).push(a.options),!1===s.apply(r,o)))return!1;return!0},descriptors:function(t){var e=t.$plugins||(t.$plugins={});if(e.id===this._cacheId)return e.descriptors;var i=[],r=[],o=t&&t.config||{},s=o.options&&o.options.plugins||{};return this._plugins.concat(o.plugins||[]).forEach(function(t){if(-1===i.indexOf(t)){var e=t.id,o=s[e];!1!==o&&(!0===o&&(o=a.clone(n.global.plugins[e])),i.push(t),r.push({plugin:t,options:o||{}}))}}),e.descriptors=r,e.id=this._cacheId,r},_invalidate:function(t){delete t.$plugins}}},{25:25,45:45}],32:[function(t,e,i){"use strict";var n=t(25),a=t(26),r=t(45),o=t(34);function s(t){var e,i,n=[];for(e=0,i=t.length;e<i;++e)n.push(t[e].label);return n}function l(t,e,i){var n=t.getPixelForTick(e);return i&&(n-=0===e?(t.getPixelForTick(1)-n)/2:(n-t.getPixelForTick(e-1))/2),n}n._set("scale",{display:!0,position:"left",offset:!1,gridLines:{display:!0,color:"rgba(0, 0, 0, 0.1)",lineWidth:1,drawBorder:!0,drawOnChartArea:!0,drawTicks:!0,tickMarkLength:10,zeroLineWidth:1,zeroLineColor:"rgba(0,0,0,0.25)",zeroLineBorderDash:[],zeroLineBorderDashOffset:0,offsetGridLines:!1,borderDash:[],borderDashOffset:0},scaleLabel:{display:!1,labelString:"",lineHeight:1.2,padding:{top:4,bottom:4}},ticks:{beginAtZero:!1,minRotation:0,maxRotation:50,mirror:!1,padding:0,reverse:!1,display:!0,autoSkip:!0,autoSkipPadding:0,labelOffset:0,callback:o.formatters.values,minor:{},major:{}}}),e.exports=function(t){function e(t,e,i){return r.isArray(e)?r.longestText(t,i,e):t.measureText(e).width}function i(t){var e=r.valueOrDefault,i=n.global,a=e(t.fontSize,i.defaultFontSize),o=e(t.fontStyle,i.defaultFontStyle),s=e(t.fontFamily,i.defaultFontFamily);return{size:a,style:o,family:s,font:r.fontString(a,o,s)}}function o(t){return r.options.toLineHeight(r.valueOrDefault(t.lineHeight,1.2),r.valueOrDefault(t.fontSize,n.global.defaultFontSize))}t.Scale=a.extend({getPadding:function(){return{left:this.paddingLeft||0,top:this.paddingTop||0,right:this.paddingRight||0,bottom:this.paddingBottom||0}},getTicks:function(){return this._ticks},mergeTicksOptions:function(){var t=this.options.ticks;for(var e in!1===t.minor&&(t.minor={display:!1}),!1===t.major&&(t.major={display:!1}),t)"major"!==e&&"minor"!==e&&(void 0===t.minor[e]&&(t.minor[e]=t[e]),void 0===t.major[e]&&(t.major[e]=t[e]))},beforeUpdate:function(){r.callback(this.options.beforeUpdate,[this])},update:function(t,e,i){var n,a,o,s,l,u,d=this;for(d.beforeUpdate(),d.maxWidth=t,d.maxHeight=e,d.margins=r.extend({left:0,right:0,top:0,bottom:0},i),d.longestTextCache=d.longestTextCache||{},d.beforeSetDimensions(),d.setDimensions(),d.afterSetDimensions(),d.beforeDataLimits(),d.determineDataLimits(),d.afterDataLimits(),d.beforeBuildTicks(),l=d.buildTicks()||[],d.afterBuildTicks(),d.beforeTickToLabelConversion(),o=d.convertTicksToLabels(l)||d.ticks,d.afterTickToLabelConversion(),d.ticks=o,n=0,a=o.length;n<a;++n)s=o[n],(u=l[n])?u.label=s:l.push(u={label:s,major:!1});return d._ticks=l,d.beforeCalculateTickRotation(),d.calculateTickRotation(),d.afterCalculateTickRotation(),d.beforeFit(),d.fit(),d.afterFit(),d.afterUpdate(),d.minSize},afterUpdate:function(){r.callback(this.options.afterUpdate,[this])},beforeSetDimensions:function(){r.callback(this.options.beforeSetDimensions,[this])},setDimensions:function(){var t=this;t.isHorizontal()?(t.width=t.maxWidth,t.left=0,t.right=t.width):(t.height=t.maxHeight,t.top=0,t.bottom=t.height),t.paddingLeft=0,t.paddingTop=0,t.paddingRight=0,t.paddingBottom=0},afterSetDimensions:function(){r.callback(this.options.afterSetDimensions,[this])},beforeDataLimits:function(){r.callback(this.options.beforeDataLimits,[this])},determineDataLimits:r.noop,afterDataLimits:function(){r.callback(this.options.afterDataLimits,[this])},beforeBuildTicks:function(){r.callback(this.options.beforeBuildTicks,[this])},buildTicks:r.noop,afterBuildTicks:function(){r.callback(this.options.afterBuildTicks,[this])},beforeTickToLabelConversion:function(){r.callback(this.options.beforeTickToLabelConversion,[this])},convertTicksToLabels:function(){var t=this.options.ticks;this.ticks=this.ticks.map(t.userCallback||t.callback,this)},afterTickToLabelConversion:function(){r.callback(this.options.afterTickToLabelConversion,[this])},beforeCalculateTickRotation:function(){r.callback(this.options.beforeCalculateTickRotation,[this])},calculateTickRotation:function(){var t=this,e=t.ctx,n=t.options.ticks,a=s(t._ticks),o=i(n);e.font=o.font;var l=n.minRotation||0;if(a.length&&t.options.display&&t.isHorizontal())for(var u,d=r.longestText(e,o.font,a,t.longestTextCache),h=d,c=t.getPixelForTick(1)-t.getPixelForTick(0)-6;h>c&&l<n.maxRotation;){var f=r.toRadians(l);if(u=Math.cos(f),Math.sin(f)*d>t.maxHeight){l--;break}l++,h=u*d}t.labelRotation=l},afterCalculateTickRotation:function(){r.callback(this.options.afterCalculateTickRotation,[this])},beforeFit:function(){r.callback(this.options.beforeFit,[this])},fit:function(){var t=this,n=t.minSize={width:0,height:0},a=s(t._ticks),l=t.options,u=l.ticks,d=l.scaleLabel,h=l.gridLines,c=l.display,f=t.isHorizontal(),g=i(u),m=l.gridLines.tickMarkLength;if(n.width=f?t.isFullWidth()?t.maxWidth-t.margins.left-t.margins.right:t.maxWidth:c&&h.drawTicks?m:0,n.height=f?c&&h.drawTicks?m:0:t.maxHeight,d.display&&c){var p=o(d)+r.options.toPadding(d.padding).height;f?n.height+=p:n.width+=p}if(u.display&&c){var v=r.longestText(t.ctx,g.font,a,t.longestTextCache),y=r.numberOfLabelLines(a),b=.5*g.size,x=t.options.ticks.padding;if(f){t.longestLabelWidth=v;var _=r.toRadians(t.labelRotation),k=Math.cos(_),w=Math.sin(_)*v+g.size*y+b*(y-1)+b;n.height=Math.min(t.maxHeight,n.height+w+x),t.ctx.font=g.font;var M=e(t.ctx,a[0],g.font),S=e(t.ctx,a[a.length-1],g.font);0!==t.labelRotation?(t.paddingLeft="bottom"===l.position?k*M+3:k*b+3,t.paddingRight="bottom"===l.position?k*b+3:k*S+3):(t.paddingLeft=M/2+3,t.paddingRight=S/2+3)}else u.mirror?v=0:v+=x+b,n.width=Math.min(t.maxWidth,n.width+v),t.paddingTop=g.size/2,t.paddingBottom=g.size/2}t.handleMargins(),t.width=n.width,t.height=n.height},handleMargins:function(){var t=this;t.margins&&(t.paddingLeft=Math.max(t.paddingLeft-t.margins.left,0),t.paddingTop=Math.max(t.paddingTop-t.margins.top,0),t.paddingRight=Math.max(t.paddingRight-t.margins.right,0),t.paddingBottom=Math.max(t.paddingBottom-t.margins.bottom,0))},afterFit:function(){r.callback(this.options.afterFit,[this])},isHorizontal:function(){return"top"===this.options.position||"bottom"===this.options.position},isFullWidth:function(){return this.options.fullWidth},getRightValue:function(t){if(r.isNullOrUndef(t))return NaN;if("number"==typeof t&&!isFinite(t))return NaN;if(t)if(this.isHorizontal()){if(void 0!==t.x)return this.getRightValue(t.x)}else if(void 0!==t.y)return this.getRightValue(t.y);return t},getLabelForIndex:r.noop,getPixelForValue:r.noop,getValueForPixel:r.noop,getPixelForTick:function(t){var e=this,i=e.options.offset;if(e.isHorizontal()){var n=(e.width-(e.paddingLeft+e.paddingRight))/Math.max(e._ticks.length-(i?0:1),1),a=n*t+e.paddingLeft;i&&(a+=n/2);var r=e.left+Math.round(a);return r+=e.isFullWidth()?e.margins.left:0}var o=e.height-(e.paddingTop+e.paddingBottom);return e.top+t*(o/(e._ticks.length-1))},getPixelForDecimal:function(t){var e=this;if(e.isHorizontal()){var i=(e.width-(e.paddingLeft+e.paddingRight))*t+e.paddingLeft,n=e.left+Math.round(i);return n+=e.isFullWidth()?e.margins.left:0}return e.top+t*e.height},getBasePixel:function(){return this.getPixelForValue(this.getBaseValue())},getBaseValue:function(){var t=this.min,e=this.max;return this.beginAtZero?0:t<0&&e<0?e:t>0&&e>0?t:0},_autoSkip:function(t){var e,i,n,a,o=this,s=o.isHorizontal(),l=o.options.ticks.minor,u=t.length,d=r.toRadians(o.labelRotation),h=Math.cos(d),c=o.longestLabelWidth*h,f=[];for(l.maxTicksLimit&&(a=l.maxTicksLimit),s&&(e=!1,(c+l.autoSkipPadding)*u>o.width-(o.paddingLeft+o.paddingRight)&&(e=1+Math.floor((c+l.autoSkipPadding)*u/(o.width-(o.paddingLeft+o.paddingRight)))),a&&u>a&&(e=Math.max(e,Math.floor(u/a)))),i=0;i<u;i++)n=t[i],(e>1&&i%e>0||i%e==0&&i+e>=u)&&i!==u-1&&delete n.label,f.push(n);return f},draw:function(t){var e=this,a=e.options;if(a.display){var s=e.ctx,u=n.global,d=a.ticks.minor,h=a.ticks.major||d,c=a.gridLines,f=a.scaleLabel,g=0!==e.labelRotation,m=e.isHorizontal(),p=d.autoSkip?e._autoSkip(e.getTicks()):e.getTicks(),v=r.valueOrDefault(d.fontColor,u.defaultFontColor),y=i(d),b=r.valueOrDefault(h.fontColor,u.defaultFontColor),x=i(h),_=c.drawTicks?c.tickMarkLength:0,k=r.valueOrDefault(f.fontColor,u.defaultFontColor),w=i(f),M=r.options.toPadding(f.padding),S=r.toRadians(e.labelRotation),D=[],C=e.options.gridLines.lineWidth,P="right"===a.position?e.right:e.right-C-_,T="right"===a.position?e.right+_:e.right,O="bottom"===a.position?e.top+C:e.bottom-_-C,I="bottom"===a.position?e.top+C+_:e.bottom+C;if(r.each(p,function(i,n){if(!r.isNullOrUndef(i.label)){var o,s,h,f,v,y,b,x,k,w,M,A,F,R,L=i.label;n===e.zeroLineIndex&&a.offset===c.offsetGridLines?(o=c.zeroLineWidth,s=c.zeroLineColor,h=c.zeroLineBorderDash,f=c.zeroLineBorderDashOffset):(o=r.valueAtIndexOrDefault(c.lineWidth,n),s=r.valueAtIndexOrDefault(c.color,n),h=r.valueOrDefault(c.borderDash,u.borderDash),f=r.valueOrDefault(c.borderDashOffset,u.borderDashOffset));var W="middle",Y="middle",N=d.padding;if(m){var z=_+N;"bottom"===a.position?(Y=g?"middle":"top",W=g?"right":"center",R=e.top+z):(Y=g?"middle":"bottom",W=g?"left":"center",R=e.bottom-z);var H=l(e,n,c.offsetGridLines&&p.length>1);H<e.left&&(s="rgba(0,0,0,0)"),H+=r.aliasPixel(o),F=e.getPixelForTick(n)+d.labelOffset,v=b=k=M=H,y=O,x=I,w=t.top,A=t.bottom+C}else{var V,B="left"===a.position;d.mirror?(W=B?"left":"right",V=N):(W=B?"right":"left",V=_+N),F=B?e.right-V:e.left+V;var E=l(e,n,c.offsetGridLines&&p.length>1);E<e.top&&(s="rgba(0,0,0,0)"),E+=r.aliasPixel(o),R=e.getPixelForTick(n)+d.labelOffset,v=P,b=T,k=t.left,M=t.right+C,y=x=w=A=E}D.push({tx1:v,ty1:y,tx2:b,ty2:x,x1:k,y1:w,x2:M,y2:A,labelX:F,labelY:R,glWidth:o,glColor:s,glBorderDash:h,glBorderDashOffset:f,rotation:-1*S,label:L,major:i.major,textBaseline:Y,textAlign:W})}}),r.each(D,function(t){if(c.display&&(s.save(),s.lineWidth=t.glWidth,s.strokeStyle=t.glColor,s.setLineDash&&(s.setLineDash(t.glBorderDash),s.lineDashOffset=t.glBorderDashOffset),s.beginPath(),c.drawTicks&&(s.moveTo(t.tx1,t.ty1),s.lineTo(t.tx2,t.ty2)),c.drawOnChartArea&&(s.moveTo(t.x1,t.y1),s.lineTo(t.x2,t.y2)),s.stroke(),s.restore()),d.display){s.save(),s.translate(t.labelX,t.labelY),s.rotate(t.rotation),s.font=t.major?x.font:y.font,s.fillStyle=t.major?b:v,s.textBaseline=t.textBaseline,s.textAlign=t.textAlign;var i=t.label;if(r.isArray(i))for(var n=i.length,a=1.5*y.size,o=e.isHorizontal()?0:-a*(n-1)/2,l=0;l<n;++l)s.fillText(""+i[l],0,o),o+=a;else s.fillText(i,0,0);s.restore()}}),f.display){var A,F,R=0,L=o(f)/2;if(m)A=e.left+(e.right-e.left)/2,F="bottom"===a.position?e.bottom-L-M.bottom:e.top+L+M.top;else{var W="left"===a.position;A=W?e.left+L+M.top:e.right-L-M.top,F=e.top+(e.bottom-e.top)/2,R=W?-.5*Math.PI:.5*Math.PI}s.save(),s.translate(A,F),s.rotate(R),s.textAlign="center",s.textBaseline="middle",s.fillStyle=k,s.font=w.font,s.fillText(f.labelString,0,0),s.restore()}if(c.drawBorder){s.lineWidth=r.valueAtIndexOrDefault(c.lineWidth,0),s.strokeStyle=r.valueAtIndexOrDefault(c.color,0);var Y=e.left,N=e.right+C,z=e.top,H=e.bottom+C,V=r.aliasPixel(s.lineWidth);m?(z=H="top"===a.position?e.bottom:e.top,z+=V,H+=V):(Y=N="left"===a.position?e.right:e.left,Y+=V,N+=V),s.beginPath(),s.moveTo(Y,z),s.lineTo(N,H),s.stroke()}}}})}},{25:25,26:26,34:34,45:45}],33:[function(t,e,i){"use strict";var n=t(25),a=t(45),r=t(30);e.exports=function(t){t.scaleService={constructors:{},defaults:{},registerScaleType:function(t,e,i){this.constructors[t]=e,this.defaults[t]=a.clone(i)},getScaleConstructor:function(t){return this.constructors.hasOwnProperty(t)?this.constructors[t]:void 0},getScaleDefaults:function(t){return this.defaults.hasOwnProperty(t)?a.merge({},[n.scale,this.defaults[t]]):{}},updateScaleDefaults:function(t,e){this.defaults.hasOwnProperty(t)&&(this.defaults[t]=a.extend(this.defaults[t],e))},addScalesToLayout:function(t){a.each(t.scales,function(e){e.fullWidth=e.options.fullWidth,e.position=e.options.position,e.weight=e.options.weight,r.addBox(t,e)})}}}},{25:25,30:30,45:45}],34:[function(t,e,i){"use strict";var n=t(45);e.exports={formatters:{values:function(t){return n.isArray(t)?t:""+t},linear:function(t,e,i){var a=i.length>3?i[2]-i[1]:i[1]-i[0];Math.abs(a)>1&&t!==Math.floor(t)&&(a=t-Math.floor(t));var r=n.log10(Math.abs(a)),o="";if(0!==t){var s=-1*Math.floor(r);s=Math.max(Math.min(s,20),0),o=t.toFixed(s)}else o="0";return o},logarithmic:function(t,e,i){var a=t/Math.pow(10,Math.floor(n.log10(t)));return 0===t?"0":1===a||2===a||5===a||0===e||e===i.length-1?t.toExponential():""}}}},{45:45}],35:[function(t,e,i){"use strict";var n=t(25),a=t(26),r=t(45);n._set("global",{tooltips:{enabled:!0,custom:null,mode:"nearest",position:"average",intersect:!0,backgroundColor:"rgba(0,0,0,0.8)",titleFontStyle:"bold",titleSpacing:2,titleMarginBottom:6,titleFontColor:"#fff",titleAlign:"left",bodySpacing:2,bodyFontColor:"#fff",bodyAlign:"left",footerFontStyle:"bold",footerSpacing:2,footerMarginTop:6,footerFontColor:"#fff",footerAlign:"left",yPadding:6,xPadding:6,caretPadding:2,caretSize:5,cornerRadius:6,multiKeyBackground:"#fff",displayColors:!0,borderColor:"rgba(0,0,0,0)",borderWidth:0,callbacks:{beforeTitle:r.noop,title:function(t,e){var i="",n=e.labels,a=n?n.length:0;if(t.length>0){var r=t[0];r.xLabel?i=r.xLabel:a>0&&r.index<a&&(i=n[r.index])}return i},afterTitle:r.noop,beforeBody:r.noop,beforeLabel:r.noop,label:function(t,e){var i=e.datasets[t.datasetIndex].label||"";return i&&(i+=": "),i+=t.yLabel},labelColor:function(t,e){var i=e.getDatasetMeta(t.datasetIndex).data[t.index]._view;return{borderColor:i.borderColor,backgroundColor:i.backgroundColor}},labelTextColor:function(){return this._options.bodyFontColor},afterLabel:r.noop,afterBody:r.noop,beforeFooter:r.noop,footer:r.noop,afterFooter:r.noop}}}),e.exports=function(t){function e(t,e){var i=r.color(t);return i.alpha(e*i.alpha()).rgbaString()}function i(t,e){return e&&(r.isArray(e)?Array.prototype.push.apply(t,e):t.push(e)),t}function o(t){var e=n.global,i=r.valueOrDefault;return{xPadding:t.xPadding,yPadding:t.yPadding,xAlign:t.xAlign,yAlign:t.yAlign,bodyFontColor:t.bodyFontColor,_bodyFontFamily:i(t.bodyFontFamily,e.defaultFontFamily),_bodyFontStyle:i(t.bodyFontStyle,e.defaultFontStyle),_bodyAlign:t.bodyAlign,bodyFontSize:i(t.bodyFontSize,e.defaultFontSize),bodySpacing:t.bodySpacing,titleFontColor:t.titleFontColor,_titleFontFamily:i(t.titleFontFamily,e.defaultFontFamily),_titleFontStyle:i(t.titleFontStyle,e.defaultFontStyle),titleFontSize:i(t.titleFontSize,e.defaultFontSize),_titleAlign:t.titleAlign,titleSpacing:t.titleSpacing,titleMarginBottom:t.titleMarginBottom,footerFontColor:t.footerFontColor,_footerFontFamily:i(t.footerFontFamily,e.defaultFontFamily),_footerFontStyle:i(t.footerFontStyle,e.defaultFontStyle),footerFontSize:i(t.footerFontSize,e.defaultFontSize),_footerAlign:t.footerAlign,footerSpacing:t.footerSpacing,footerMarginTop:t.footerMarginTop,caretSize:t.caretSize,cornerRadius:t.cornerRadius,backgroundColor:t.backgroundColor,opacity:0,legendColorBackground:t.multiKeyBackground,displayColors:t.displayColors,borderColor:t.borderColor,borderWidth:t.borderWidth}}t.Tooltip=a.extend({initialize:function(){this._model=o(this._options),this._lastActive=[]},getTitle:function(){var t=this._options.callbacks,e=t.beforeTitle.apply(this,arguments),n=t.title.apply(this,arguments),a=t.afterTitle.apply(this,arguments),r=[];return r=i(r=i(r=i(r,e),n),a)},getBeforeBody:function(){var t=this._options.callbacks.beforeBody.apply(this,arguments);return r.isArray(t)?t:void 0!==t?[t]:[]},getBody:function(t,e){var n=this,a=n._options.callbacks,o=[];return r.each(t,function(t){var r={before:[],lines:[],after:[]};i(r.before,a.beforeLabel.call(n,t,e)),i(r.lines,a.label.call(n,t,e)),i(r.after,a.afterLabel.call(n,t,e)),o.push(r)}),o},getAfterBody:function(){var t=this._options.callbacks.afterBody.apply(this,arguments);return r.isArray(t)?t:void 0!==t?[t]:[]},getFooter:function(){var t=this._options.callbacks,e=t.beforeFooter.apply(this,arguments),n=t.footer.apply(this,arguments),a=t.afterFooter.apply(this,arguments),r=[];return r=i(r=i(r=i(r,e),n),a)},update:function(e){var i,n,a,s,l,u,d,h,c,f,g,m,p,v,y,b,x,_,k,w,M=this,S=M._options,D=M._model,C=M._model=o(S),P=M._active,T=M._data,O={xAlign:D.xAlign,yAlign:D.yAlign},I={x:D.x,y:D.y},A={width:D.width,height:D.height},F={x:D.caretX,y:D.caretY};if(P.length){C.opacity=1;var R=[],L=[];F=t.Tooltip.positioners[S.position].call(M,P,M._eventPosition);var W=[];for(i=0,n=P.length;i<n;++i)W.push((b=P[i],x=void 0,_=void 0,void 0,void 0,x=b._xScale,_=b._yScale||b._scale,k=b._index,w=b._datasetIndex,{xLabel:x?x.getLabelForIndex(k,w):"",yLabel:_?_.getLabelForIndex(k,w):"",index:k,datasetIndex:w,x:b._model.x,y:b._model.y}));S.filter&&(W=W.filter(function(t){return S.filter(t,T)})),S.itemSort&&(W=W.sort(function(t,e){return S.itemSort(t,e,T)})),r.each(W,function(t){R.push(S.callbacks.labelColor.call(M,t,M._chart)),L.push(S.callbacks.labelTextColor.call(M,t,M._chart))}),C.title=M.getTitle(W,T),C.beforeBody=M.getBeforeBody(W,T),C.body=M.getBody(W,T),C.afterBody=M.getAfterBody(W,T),C.footer=M.getFooter(W,T),C.x=Math.round(F.x),C.y=Math.round(F.y),C.caretPadding=S.caretPadding,C.labelColors=R,C.labelTextColors=L,C.dataPoints=W,O=function(t,e){var i,n,a,r,o,s=t._model,l=t._chart,u=t._chart.chartArea,d="center",h="center";s.y<e.height?h="top":s.y>l.height-e.height&&(h="bottom");var c=(u.left+u.right)/2,f=(u.top+u.bottom)/2;"center"===h?(i=function(t){return t<=c},n=function(t){return t>c}):(i=function(t){return t<=e.width/2},n=function(t){return t>=l.width-e.width/2}),a=function(t){return t+e.width+s.caretSize+s.caretPadding>l.width},r=function(t){return t-e.width-s.caretSize-s.caretPadding<0},o=function(t){return t<=f?"top":"bottom"},i(s.x)?(d="left",a(s.x)&&(d="center",h=o(s.y))):n(s.x)&&(d="right",r(s.x)&&(d="center",h=o(s.y)));var g=t._options;return{xAlign:g.xAlign?g.xAlign:d,yAlign:g.yAlign?g.yAlign:h}}(this,A=function(t,e){var i=t._chart.ctx,n=2*e.yPadding,a=0,o=e.body,s=o.reduce(function(t,e){return t+e.before.length+e.lines.length+e.after.length},0);s+=e.beforeBody.length+e.afterBody.length;var l=e.title.length,u=e.footer.length,d=e.titleFontSize,h=e.bodyFontSize,c=e.footerFontSize;n+=l*d,n+=l?(l-1)*e.titleSpacing:0,n+=l?e.titleMarginBottom:0,n+=s*h,n+=s?(s-1)*e.bodySpacing:0,n+=u?e.footerMarginTop:0,n+=u*c,n+=u?(u-1)*e.footerSpacing:0;var f=0,g=function(t){a=Math.max(a,i.measureText(t).width+f)};return i.font=r.fontString(d,e._titleFontStyle,e._titleFontFamily),r.each(e.title,g),i.font=r.fontString(h,e._bodyFontStyle,e._bodyFontFamily),r.each(e.beforeBody.concat(e.afterBody),g),f=e.displayColors?h+2:0,r.each(o,function(t){r.each(t.before,g),r.each(t.lines,g),r.each(t.after,g)}),f=0,i.font=r.fontString(c,e._footerFontStyle,e._footerFontFamily),r.each(e.footer,g),{width:a+=2*e.xPadding,height:n}}(this,C)),a=C,s=A,l=O,u=M._chart,d=a.x,h=a.y,c=a.caretSize,f=a.caretPadding,g=a.cornerRadius,m=l.xAlign,p=l.yAlign,v=c+f,y=g+f,"right"===m?d-=s.width:"center"===m&&((d-=s.width/2)+s.width>u.width&&(d=u.width-s.width),d<0&&(d=0)),"top"===p?h+=v:h-="bottom"===p?s.height+v:s.height/2,"center"===p?"left"===m?d+=v:"right"===m&&(d-=v):"left"===m?d-=y:"right"===m&&(d+=y),I={x:d,y:h}}else C.opacity=0;return C.xAlign=O.xAlign,C.yAlign=O.yAlign,C.x=I.x,C.y=I.y,C.width=A.width,C.height=A.height,C.caretX=F.x,C.caretY=F.y,M._model=C,e&&S.custom&&S.custom.call(M,C),M},drawCaret:function(t,e){var i=this._chart.ctx,n=this._view,a=this.getCaretPosition(t,e,n);i.lineTo(a.x1,a.y1),i.lineTo(a.x2,a.y2),i.lineTo(a.x3,a.y3)},getCaretPosition:function(t,e,i){var n,a,r,o,s,l,u=i.caretSize,d=i.cornerRadius,h=i.xAlign,c=i.yAlign,f=t.x,g=t.y,m=e.width,p=e.height;if("center"===c)s=g+p/2,"left"===h?(a=(n=f)-u,r=n,o=s+u,l=s-u):(a=(n=f+m)+u,r=n,o=s-u,l=s+u);else if("left"===h?(n=(a=f+d+u)-u,r=a+u):"right"===h?(n=(a=f+m-d-u)-u,r=a+u):(n=(a=i.caretX)-u,r=a+u),"top"===c)s=(o=g)-u,l=o;else{s=(o=g+p)+u,l=o;var v=r;r=n,n=v}return{x1:n,x2:a,x3:r,y1:o,y2:s,y3:l}},drawTitle:function(t,i,n,a){var o=i.title;if(o.length){n.textAlign=i._titleAlign,n.textBaseline="top";var s,l,u=i.titleFontSize,d=i.titleSpacing;for(n.fillStyle=e(i.titleFontColor,a),n.font=r.fontString(u,i._titleFontStyle,i._titleFontFamily),s=0,l=o.length;s<l;++s)n.fillText(o[s],t.x,t.y),t.y+=u+d,s+1===o.length&&(t.y+=i.titleMarginBottom-d)}},drawBody:function(t,i,n,a){var o=i.bodyFontSize,s=i.bodySpacing,l=i.body;n.textAlign=i._bodyAlign,n.textBaseline="top",n.font=r.fontString(o,i._bodyFontStyle,i._bodyFontFamily);var u=0,d=function(e){n.fillText(e,t.x+u,t.y),t.y+=o+s};n.fillStyle=e(i.bodyFontColor,a),r.each(i.beforeBody,d);var h=i.displayColors;u=h?o+2:0,r.each(l,function(s,l){var u=e(i.labelTextColors[l],a);n.fillStyle=u,r.each(s.before,d),r.each(s.lines,function(r){h&&(n.fillStyle=e(i.legendColorBackground,a),n.fillRect(t.x,t.y,o,o),n.lineWidth=1,n.strokeStyle=e(i.labelColors[l].borderColor,a),n.strokeRect(t.x,t.y,o,o),n.fillStyle=e(i.labelColors[l].backgroundColor,a),n.fillRect(t.x+1,t.y+1,o-2,o-2),n.fillStyle=u),d(r)}),r.each(s.after,d)}),u=0,r.each(i.afterBody,d),t.y-=s},drawFooter:function(t,i,n,a){var o=i.footer;o.length&&(t.y+=i.footerMarginTop,n.textAlign=i._footerAlign,n.textBaseline="top",n.fillStyle=e(i.footerFontColor,a),n.font=r.fontString(i.footerFontSize,i._footerFontStyle,i._footerFontFamily),r.each(o,function(e){n.fillText(e,t.x,t.y),t.y+=i.footerFontSize+i.footerSpacing}))},drawBackground:function(t,i,n,a,r){n.fillStyle=e(i.backgroundColor,r),n.strokeStyle=e(i.borderColor,r),n.lineWidth=i.borderWidth;var o=i.xAlign,s=i.yAlign,l=t.x,u=t.y,d=a.width,h=a.height,c=i.cornerRadius;n.beginPath(),n.moveTo(l+c,u),"top"===s&&this.drawCaret(t,a),n.lineTo(l+d-c,u),n.quadraticCurveTo(l+d,u,l+d,u+c),"center"===s&&"right"===o&&this.drawCaret(t,a),n.lineTo(l+d,u+h-c),n.quadraticCurveTo(l+d,u+h,l+d-c,u+h),"bottom"===s&&this.drawCaret(t,a),n.lineTo(l+c,u+h),n.quadraticCurveTo(l,u+h,l,u+h-c),"center"===s&&"left"===o&&this.drawCaret(t,a),n.lineTo(l,u+c),n.quadraticCurveTo(l,u,l+c,u),n.closePath(),n.fill(),i.borderWidth>0&&n.stroke()},draw:function(){var t=this._chart.ctx,e=this._view;if(0!==e.opacity){var i={width:e.width,height:e.height},n={x:e.x,y:e.y},a=Math.abs(e.opacity<.001)?0:e.opacity,r=e.title.length||e.beforeBody.length||e.body.length||e.afterBody.length||e.footer.length;this._options.enabled&&r&&(this.drawBackground(n,e,t,i,a),n.x+=e.xPadding,n.y+=e.yPadding,this.drawTitle(n,e,t,a),this.drawBody(n,e,t,a),this.drawFooter(n,e,t,a))}},handleEvent:function(t){var e,i=this,n=i._options;return i._lastActive=i._lastActive||[],"mouseout"===t.type?i._active=[]:i._active=i._chart.getElementsAtEventForMode(t,n.mode,n),(e=!r.arrayEquals(i._active,i._lastActive))&&(i._lastActive=i._active,(n.enabled||n.custom)&&(i._eventPosition={x:t.x,y:t.y},i.update(!0),i.pivot())),e}}),t.Tooltip.positioners={average:function(t){if(!t.length)return!1;var e,i,n=0,a=0,r=0;for(e=0,i=t.length;e<i;++e){var o=t[e];if(o&&o.hasValue()){var s=o.tooltipPosition();n+=s.x,a+=s.y,++r}}return{x:Math.round(n/r),y:Math.round(a/r)}},nearest:function(t,e){var i,n,a,o=e.x,s=e.y,l=Number.POSITIVE_INFINITY;for(i=0,n=t.length;i<n;++i){var u=t[i];if(u&&u.hasValue()){var d=u.getCenterPoint(),h=r.distanceBetweenPoints(e,d);h<l&&(l=h,a=u)}}if(a){var c=a.tooltipPosition();o=c.x,s=c.y}return{x:o,y:s}}}}},{25:25,26:26,45:45}],36:[function(t,e,i){"use strict";var n=t(25),a=t(26),r=t(45);n._set("global",{elements:{arc:{backgroundColor:n.global.defaultColor,borderColor:"#fff",borderWidth:2}}}),e.exports=a.extend({inLabelRange:function(t){var e=this._view;return!!e&&Math.pow(t-e.x,2)<Math.pow(e.radius+e.hoverRadius,2)},inRange:function(t,e){var i=this._view;if(i){for(var n=r.getAngleFromPoint(i,{x:t,y:e}),a=n.angle,o=n.distance,s=i.startAngle,l=i.endAngle;l<s;)l+=2*Math.PI;for(;a>l;)a-=2*Math.PI;for(;a<s;)a+=2*Math.PI;var u=a>=s&&a<=l,d=o>=i.innerRadius&&o<=i.outerRadius;return u&&d}return!1},getCenterPoint:function(){var t=this._view,e=(t.startAngle+t.endAngle)/2,i=(t.innerRadius+t.outerRadius)/2;return{x:t.x+Math.cos(e)*i,y:t.y+Math.sin(e)*i}},getArea:function(){var t=this._view;return Math.PI*((t.endAngle-t.startAngle)/(2*Math.PI))*(Math.pow(t.outerRadius,2)-Math.pow(t.innerRadius,2))},tooltipPosition:function(){var t=this._view,e=t.startAngle+(t.endAngle-t.startAngle)/2,i=(t.outerRadius-t.innerRadius)/2+t.innerRadius;return{x:t.x+Math.cos(e)*i,y:t.y+Math.sin(e)*i}},draw:function(){var t=this._chart.ctx,e=this._view,i=e.startAngle,n=e.endAngle;t.beginPath(),t.arc(e.x,e.y,e.outerRadius,i,n),t.arc(e.x,e.y,e.innerRadius,n,i,!0),t.closePath(),t.strokeStyle=e.borderColor,t.lineWidth=e.borderWidth,t.fillStyle=e.backgroundColor,t.fill(),t.lineJoin="bevel",e.borderWidth&&t.stroke()}})},{25:25,26:26,45:45}],37:[function(t,e,i){"use strict";var n=t(25),a=t(26),r=t(45),o=n.global;n._set("global",{elements:{line:{tension:.4,backgroundColor:o.defaultColor,borderWidth:3,borderColor:o.defaultColor,borderCapStyle:"butt",borderDash:[],borderDashOffset:0,borderJoinStyle:"miter",capBezierPoints:!0,fill:!0}}}),e.exports=a.extend({draw:function(){var t,e,i,n,a=this._view,s=this._chart.ctx,l=a.spanGaps,u=this._children.slice(),d=o.elements.line,h=-1;for(this._loop&&u.length&&u.push(u[0]),s.save(),s.lineCap=a.borderCapStyle||d.borderCapStyle,s.setLineDash&&s.setLineDash(a.borderDash||d.borderDash),s.lineDashOffset=a.borderDashOffset||d.borderDashOffset,s.lineJoin=a.borderJoinStyle||d.borderJoinStyle,s.lineWidth=a.borderWidth||d.borderWidth,s.strokeStyle=a.borderColor||o.defaultColor,s.beginPath(),h=-1,t=0;t<u.length;++t)e=u[t],i=r.previousItem(u,t),n=e._view,0===t?n.skip||(s.moveTo(n.x,n.y),h=t):(i=-1===h?i:u[h],n.skip||(h!==t-1&&!l||-1===h?s.moveTo(n.x,n.y):r.canvas.lineTo(s,i._view,e._view),h=t));s.stroke(),s.restore()}})},{25:25,26:26,45:45}],38:[function(t,e,i){"use strict";var n=t(25),a=t(26),r=t(45),o=n.global.defaultColor;function s(t){var e=this._view;return!!e&&Math.abs(t-e.x)<e.radius+e.hitRadius}n._set("global",{elements:{point:{radius:3,pointStyle:"circle",backgroundColor:o,borderColor:o,borderWidth:1,hitRadius:1,hoverRadius:4,hoverBorderWidth:1}}}),e.exports=a.extend({inRange:function(t,e){var i=this._view;return!!i&&Math.pow(t-i.x,2)+Math.pow(e-i.y,2)<Math.pow(i.hitRadius+i.radius,2)},inLabelRange:s,inXRange:s,inYRange:function(t){var e=this._view;return!!e&&Math.abs(t-e.y)<e.radius+e.hitRadius},getCenterPoint:function(){var t=this._view;return{x:t.x,y:t.y}},getArea:function(){return Math.PI*Math.pow(this._view.radius,2)},tooltipPosition:function(){var t=this._view;return{x:t.x,y:t.y,padding:t.radius+t.borderWidth}},draw:function(t){var e=this._view,i=this._model,a=this._chart.ctx,s=e.pointStyle,l=e.radius,u=e.x,d=e.y,h=r.color,c=0;e.skip||(a.strokeStyle=e.borderColor||o,a.lineWidth=r.valueOrDefault(e.borderWidth,n.global.elements.point.borderWidth),a.fillStyle=e.backgroundColor||o,void 0!==t&&(i.x<t.left||1.01*t.right<i.x||i.y<t.top||1.01*t.bottom<i.y)&&(i.x<t.left?c=(u-i.x)/(t.left-i.x):1.01*t.right<i.x?c=(i.x-u)/(i.x-t.right):i.y<t.top?c=(d-i.y)/(t.top-i.y):1.01*t.bottom<i.y&&(c=(i.y-d)/(i.y-t.bottom)),c=Math.round(100*c)/100,a.strokeStyle=h(a.strokeStyle).alpha(c).rgbString(),a.fillStyle=h(a.fillStyle).alpha(c).rgbString()),r.canvas.drawPoint(a,s,l,u,d))}})},{25:25,26:26,45:45}],39:[function(t,e,i){"use strict";var n=t(25),a=t(26);function r(t){return void 0!==t._view.width}function o(t){var e,i,n,a,o=t._view;if(r(t)){var s=o.width/2;e=o.x-s,i=o.x+s,n=Math.min(o.y,o.base),a=Math.max(o.y,o.base)}else{var l=o.height/2;e=Math.min(o.x,o.base),i=Math.max(o.x,o.base),n=o.y-l,a=o.y+l}return{left:e,top:n,right:i,bottom:a}}n._set("global",{elements:{rectangle:{backgroundColor:n.global.defaultColor,borderColor:n.global.defaultColor,borderSkipped:"bottom",borderWidth:0}}}),e.exports=a.extend({draw:function(){var t,e,i,n,a,r,o,s=this._chart.ctx,l=this._view,u=l.borderWidth;if(l.horizontal?(t=l.base,e=l.x,i=l.y-l.height/2,n=l.y+l.height/2,a=e>t?1:-1,r=1,o=l.borderSkipped||"left"):(t=l.x-l.width/2,e=l.x+l.width/2,i=l.y,a=1,r=(n=l.base)>i?1:-1,o=l.borderSkipped||"bottom"),u){var d=Math.min(Math.abs(t-e),Math.abs(i-n)),h=(u=u>d?d:u)/2,c=t+("left"!==o?h*a:0),f=e+("right"!==o?-h*a:0),g=i+("top"!==o?h*r:0),m=n+("bottom"!==o?-h*r:0);c!==f&&(i=g,n=m),g!==m&&(t=c,e=f)}s.beginPath(),s.fillStyle=l.backgroundColor,s.strokeStyle=l.borderColor,s.lineWidth=u;var p=[[t,n],[t,i],[e,i],[e,n]],v=["bottom","left","top","right"].indexOf(o,0);function y(t){return p[(v+t)%4]}-1===v&&(v=0);var b=y(0);s.moveTo(b[0],b[1]);for(var x=1;x<4;x++)b=y(x),s.lineTo(b[0],b[1]);s.fill(),u&&s.stroke()},height:function(){var t=this._view;return t.base-t.y},inRange:function(t,e){var i=!1;if(this._view){var n=o(this);i=t>=n.left&&t<=n.right&&e>=n.top&&e<=n.bottom}return i},inLabelRange:function(t,e){if(!this._view)return!1;var i=o(this);return r(this)?t>=i.left&&t<=i.right:e>=i.top&&e<=i.bottom},inXRange:function(t){var e=o(this);return t>=e.left&&t<=e.right},inYRange:function(t){var e=o(this);return t>=e.top&&t<=e.bottom},getCenterPoint:function(){var t,e,i=this._view;return r(this)?(t=i.x,e=(i.y+i.base)/2):(t=(i.x+i.base)/2,e=i.y),{x:t,y:e}},getArea:function(){var t=this._view;return t.width*Math.abs(t.y-t.base)},tooltipPosition:function(){var t=this._view;return{x:t.x,y:t.y}}})},{25:25,26:26}],40:[function(t,e,i){"use strict";e.exports={},e.exports.Arc=t(36),e.exports.Line=t(37),e.exports.Point=t(38),e.exports.Rectangle=t(39)},{36:36,37:37,38:38,39:39}],41:[function(t,e,i){"use strict";var n=t(42);i=e.exports={clear:function(t){t.ctx.clearRect(0,0,t.width,t.height)},roundedRect:function(t,e,i,n,a,r){if(r){var o=Math.min(r,n/2),s=Math.min(r,a/2);t.moveTo(e+o,i),t.lineTo(e+n-o,i),t.quadraticCurveTo(e+n,i,e+n,i+s),t.lineTo(e+n,i+a-s),t.quadraticCurveTo(e+n,i+a,e+n-o,i+a),t.lineTo(e+o,i+a),t.quadraticCurveTo(e,i+a,e,i+a-s),t.lineTo(e,i+s),t.quadraticCurveTo(e,i,e+o,i)}else t.rect(e,i,n,a)},drawPoint:function(t,e,i,n,a){var r,o,s,l,u,d;if(!e||"object"!=typeof e||"[object HTMLImageElement]"!==(r=e.toString())&&"[object HTMLCanvasElement]"!==r){if(!(isNaN(i)||i<=0)){switch(e){default:t.beginPath(),t.arc(n,a,i,0,2*Math.PI),t.closePath(),t.fill();break;case"triangle":t.beginPath(),u=(o=3*i/Math.sqrt(3))*Math.sqrt(3)/2,t.moveTo(n-o/2,a+u/3),t.lineTo(n+o/2,a+u/3),t.lineTo(n,a-2*u/3),t.closePath(),t.fill();break;case"rect":d=1/Math.SQRT2*i,t.beginPath(),t.fillRect(n-d,a-d,2*d,2*d),t.strokeRect(n-d,a-d,2*d,2*d);break;case"rectRounded":var h=i/Math.SQRT2,c=n-h,f=a-h,g=Math.SQRT2*i;t.beginPath(),this.roundedRect(t,c,f,g,g,i/2),t.closePath(),t.fill();break;case"rectRot":d=1/Math.SQRT2*i,t.beginPath(),t.moveTo(n-d,a),t.lineTo(n,a+d),t.lineTo(n+d,a),t.lineTo(n,a-d),t.closePath(),t.fill();break;case"cross":t.beginPath(),t.moveTo(n,a+i),t.lineTo(n,a-i),t.moveTo(n-i,a),t.lineTo(n+i,a),t.closePath();break;case"crossRot":t.beginPath(),s=Math.cos(Math.PI/4)*i,l=Math.sin(Math.PI/4)*i,t.moveTo(n-s,a-l),t.lineTo(n+s,a+l),t.moveTo(n-s,a+l),t.lineTo(n+s,a-l),t.closePath();break;case"star":t.beginPath(),t.moveTo(n,a+i),t.lineTo(n,a-i),t.moveTo(n-i,a),t.lineTo(n+i,a),s=Math.cos(Math.PI/4)*i,l=Math.sin(Math.PI/4)*i,t.moveTo(n-s,a-l),t.lineTo(n+s,a+l),t.moveTo(n-s,a+l),t.lineTo(n+s,a-l),t.closePath();break;case"line":t.beginPath(),t.moveTo(n-i,a),t.lineTo(n+i,a),t.closePath();break;case"dash":t.beginPath(),t.moveTo(n,a),t.lineTo(n+i,a),t.closePath()}t.stroke()}}else t.drawImage(e,n-e.width/2,a-e.height/2,e.width,e.height)},clipArea:function(t,e){t.save(),t.beginPath(),t.rect(e.left,e.top,e.right-e.left,e.bottom-e.top),t.clip()},unclipArea:function(t){t.restore()},lineTo:function(t,e,i,n){if(i.steppedLine)return"after"===i.steppedLine&&!n||"after"!==i.steppedLine&&n?t.lineTo(e.x,i.y):t.lineTo(i.x,e.y),void t.lineTo(i.x,i.y);i.tension?t.bezierCurveTo(n?e.controlPointPreviousX:e.controlPointNextX,n?e.controlPointPreviousY:e.controlPointNextY,n?i.controlPointNextX:i.controlPointPreviousX,n?i.controlPointNextY:i.controlPointPreviousY,i.x,i.y):t.lineTo(i.x,i.y)}};n.clear=i.clear,n.drawRoundedRectangle=function(t){t.beginPath(),i.roundedRect.apply(i,arguments),t.closePath()}},{42:42}],42:[function(t,e,i){"use strict";var n,a={noop:function(){},uid:(n=0,function(){return n++}),isNullOrUndef:function(t){return null==t},isArray:Array.isArray?Array.isArray:function(t){return"[object Array]"===Object.prototype.toString.call(t)},isObject:function(t){return null!==t&&"[object Object]"===Object.prototype.toString.call(t)},valueOrDefault:function(t,e){return void 0===t?e:t},valueAtIndexOrDefault:function(t,e,i){return a.valueOrDefault(a.isArray(t)?t[e]:t,i)},callback:function(t,e,i){if(t&&"function"==typeof t.call)return t.apply(i,e)},each:function(t,e,i,n){var r,o,s;if(a.isArray(t))if(o=t.length,n)for(r=o-1;r>=0;r--)e.call(i,t[r],r);else for(r=0;r<o;r++)e.call(i,t[r],r);else if(a.isObject(t))for(o=(s=Object.keys(t)).length,r=0;r<o;r++)e.call(i,t[s[r]],s[r])},arrayEquals:function(t,e){var i,n,r,o;if(!t||!e||t.length!==e.length)return!1;for(i=0,n=t.length;i<n;++i)if(r=t[i],o=e[i],r instanceof Array&&o instanceof Array){if(!a.arrayEquals(r,o))return!1}else if(r!==o)return!1;return!0},clone:function(t){if(a.isArray(t))return t.map(a.clone);if(a.isObject(t)){for(var e={},i=Object.keys(t),n=i.length,r=0;r<n;++r)e[i[r]]=a.clone(t[i[r]]);return e}return t},_merger:function(t,e,i,n){var r=e[t],o=i[t];a.isObject(r)&&a.isObject(o)?a.merge(r,o,n):e[t]=a.clone(o)},_mergerIf:function(t,e,i){var n=e[t],r=i[t];a.isObject(n)&&a.isObject(r)?a.mergeIf(n,r):e.hasOwnProperty(t)||(e[t]=a.clone(r))},merge:function(t,e,i){var n,r,o,s,l,u=a.isArray(e)?e:[e],d=u.length;if(!a.isObject(t))return t;for(n=(i=i||{}).merger||a._merger,r=0;r<d;++r)if(e=u[r],a.isObject(e))for(l=0,s=(o=Object.keys(e)).length;l<s;++l)n(o[l],t,e,i);return t},mergeIf:function(t,e){return a.merge(t,e,{merger:a._mergerIf})},extend:function(t){for(var e=function(e,i){t[i]=e},i=1,n=arguments.length;i<n;++i)a.each(arguments[i],e);return t},inherits:function(t){var e=this,i=t&&t.hasOwnProperty("constructor")?t.constructor:function(){return e.apply(this,arguments)},n=function(){this.constructor=i};return n.prototype=e.prototype,i.prototype=new n,i.extend=a.inherits,t&&a.extend(i.prototype,t),i.__super__=e.prototype,i}};e.exports=a,a.callCallback=a.callback,a.indexOf=function(t,e,i){return Array.prototype.indexOf.call(t,e,i)},a.getValueOrDefault=a.valueOrDefault,a.getValueAtIndexOrDefault=a.valueAtIndexOrDefault},{}],43:[function(t,e,i){"use strict";var n=t(42),a={linear:function(t){return t},easeInQuad:function(t){return t*t},easeOutQuad:function(t){return-t*(t-2)},easeInOutQuad:function(t){return(t/=.5)<1?.5*t*t:-.5*(--t*(t-2)-1)},easeInCubic:function(t){return t*t*t},easeOutCubic:function(t){return(t-=1)*t*t+1},easeInOutCubic:function(t){return(t/=.5)<1?.5*t*t*t:.5*((t-=2)*t*t+2)},easeInQuart:function(t){return t*t*t*t},easeOutQuart:function(t){return-((t-=1)*t*t*t-1)},easeInOutQuart:function(t){return(t/=.5)<1?.5*t*t*t*t:-.5*((t-=2)*t*t*t-2)},easeInQuint:function(t){return t*t*t*t*t},easeOutQuint:function(t){return(t-=1)*t*t*t*t+1},easeInOutQuint:function(t){return(t/=.5)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2)},easeInSine:function(t){return 1-Math.cos(t*(Math.PI/2))},easeOutSine:function(t){return Math.sin(t*(Math.PI/2))},easeInOutSine:function(t){return-.5*(Math.cos(Math.PI*t)-1)},easeInExpo:function(t){return 0===t?0:Math.pow(2,10*(t-1))},easeOutExpo:function(t){return 1===t?1:1-Math.pow(2,-10*t)},easeInOutExpo:function(t){return 0===t?0:1===t?1:(t/=.5)<1?.5*Math.pow(2,10*(t-1)):.5*(2-Math.pow(2,-10*--t))},easeInCirc:function(t){return t>=1?t:-(Math.sqrt(1-t*t)-1)},easeOutCirc:function(t){return Math.sqrt(1-(t-=1)*t)},easeInOutCirc:function(t){return(t/=.5)<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1)},easeInElastic:function(t){var e=1.70158,i=0,n=1;return 0===t?0:1===t?1:(i||(i=.3),n<1?(n=1,e=i/4):e=i/(2*Math.PI)*Math.asin(1/n),-n*Math.pow(2,10*(t-=1))*Math.sin((t-e)*(2*Math.PI)/i))},easeOutElastic:function(t){var e=1.70158,i=0,n=1;return 0===t?0:1===t?1:(i||(i=.3),n<1?(n=1,e=i/4):e=i/(2*Math.PI)*Math.asin(1/n),n*Math.pow(2,-10*t)*Math.sin((t-e)*(2*Math.PI)/i)+1)},easeInOutElastic:function(t){var e=1.70158,i=0,n=1;return 0===t?0:2==(t/=.5)?1:(i||(i=.45),n<1?(n=1,e=i/4):e=i/(2*Math.PI)*Math.asin(1/n),t<1?n*Math.pow(2,10*(t-=1))*Math.sin((t-e)*(2*Math.PI)/i)*-.5:n*Math.pow(2,-10*(t-=1))*Math.sin((t-e)*(2*Math.PI)/i)*.5+1)},easeInBack:function(t){return t*t*(2.70158*t-1.70158)},easeOutBack:function(t){return(t-=1)*t*(2.70158*t+1.70158)+1},easeInOutBack:function(t){var e=1.70158;return(t/=.5)<1?t*t*((1+(e*=1.525))*t-e)*.5:.5*((t-=2)*t*((1+(e*=1.525))*t+e)+2)},easeInBounce:function(t){return 1-a.easeOutBounce(1-t)},easeOutBounce:function(t){return t<1/2.75?7.5625*t*t:t<2/2.75?7.5625*(t-=1.5/2.75)*t+.75:t<2.5/2.75?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375},easeInOutBounce:function(t){return t<.5?.5*a.easeInBounce(2*t):.5*a.easeOutBounce(2*t-1)+.5}};e.exports={effects:a},n.easingEffects=a},{42:42}],44:[function(t,e,i){"use strict";var n=t(42);e.exports={toLineHeight:function(t,e){var i=(""+t).match(/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/);if(!i||"normal"===i[1])return 1.2*e;switch(t=+i[2],i[3]){case"px":return t;case"%":t/=100}return e*t},toPadding:function(t){var e,i,a,r;return n.isObject(t)?(e=+t.top||0,i=+t.right||0,a=+t.bottom||0,r=+t.left||0):e=i=a=r=+t||0,{top:e,right:i,bottom:a,left:r,height:e+a,width:r+i}},resolve:function(t,e,i){var a,r,o;for(a=0,r=t.length;a<r;++a)if(void 0!==(o=t[a])&&(void 0!==e&&"function"==typeof o&&(o=o(e)),void 0!==i&&n.isArray(o)&&(o=o[i]),void 0!==o))return o}}},{42:42}],45:[function(t,e,i){"use strict";e.exports=t(42),e.exports.easing=t(43),e.exports.canvas=t(41),e.exports.options=t(44)},{41:41,42:42,43:43,44:44}],46:[function(t,e,i){e.exports={acquireContext:function(t){return t&&t.canvas&&(t=t.canvas),t&&t.getContext("2d")||null}}},{}],47:[function(t,e,i){"use strict";var n=t(45),a="$chartjs",r="chartjs-",o=r+"render-monitor",s=r+"render-animation",l=["animationstart","webkitAnimationStart"],u={touchstart:"mousedown",touchmove:"mousemove",touchend:"mouseup",pointerenter:"mouseenter",pointerdown:"mousedown",pointermove:"mousemove",pointerup:"mouseup",pointerleave:"mouseout",pointerout:"mouseout"};function d(t,e){var i=n.getStyle(t,e),a=i&&i.match(/^(\d+)(\.\d+)?px$/);return a?Number(a[1]):void 0}var h=!!function(){var t=!1;try{var e=Object.defineProperty({},"passive",{get:function(){t=!0}});window.addEventListener("e",null,e)}catch(t){}return t}()&&{passive:!0};function c(t,e,i){t.addEventListener(e,i,h)}function f(t,e,i){t.removeEventListener(e,i,h)}function g(t,e,i,n,a){return{type:t,chart:e,native:a||null,x:void 0!==i?i:null,y:void 0!==n?n:null}}function m(t,e,i){var u,d,h,f,m,p,v,y,b=t[a]||(t[a]={}),x=b.resizer=function(t){var e=document.createElement("div"),i=r+"size-monitor",n="position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;pointer-events:none;visibility:hidden;z-index:-1;";e.style.cssText=n,e.className=i,e.innerHTML='<div class="'+i+'-expand" style="'+n+'"><div style="position:absolute;width:1000000px;height:1000000px;left:0;top:0"></div></div><div class="'+i+'-shrink" style="'+n+'"><div style="position:absolute;width:200%;height:200%;left:0; top:0"></div></div>';var a=e.childNodes[0],o=e.childNodes[1];e._reset=function(){a.scrollLeft=1e6,a.scrollTop=1e6,o.scrollLeft=1e6,o.scrollTop=1e6};var s=function(){e._reset(),t()};return c(a,"scroll",s.bind(a,"expand")),c(o,"scroll",s.bind(o,"shrink")),e}((u=function(){if(b.resizer)return e(g("resize",i))},h=!1,f=[],function(){f=Array.prototype.slice.call(arguments),d=d||this,h||(h=!0,n.requestAnimFrame.call(window,function(){h=!1,u.apply(d,f)}))}));p=function(){if(b.resizer){var e=t.parentNode;e&&e!==x.parentNode&&e.insertBefore(x,e.firstChild),x._reset()}},v=(m=t)[a]||(m[a]={}),y=v.renderProxy=function(t){t.animationName===s&&p()},n.each(l,function(t){c(m,t,y)}),v.reflow=!!m.offsetParent,m.classList.add(o)}function p(t){var e,i,r,s=t[a]||{},u=s.resizer;delete s.resizer,i=(e=t)[a]||{},(r=i.renderProxy)&&(n.each(l,function(t){f(e,t,r)}),delete i.renderProxy),e.classList.remove(o),u&&u.parentNode&&u.parentNode.removeChild(u)}e.exports={_enabled:"undefined"!=typeof window&&"undefined"!=typeof document,initialize:function(){var t,e,i,n="from{opacity:0.99}to{opacity:1}";e="@-webkit-keyframes "+s+"{"+n+"}@keyframes "+s+"{"+n+"}."+o+"{-webkit-animation:"+s+" 0.001s;animation:"+s+" 0.001s;}",i=(t=this)._style||document.createElement("style"),t._style||(t._style=i,e="/* Chart.js */\n"+e,i.setAttribute("type","text/css"),document.getElementsByTagName("head")[0].appendChild(i)),i.appendChild(document.createTextNode(e))},acquireContext:function(t,e){"string"==typeof t?t=document.getElementById(t):t.length&&(t=t[0]),t&&t.canvas&&(t=t.canvas);var i=t&&t.getContext&&t.getContext("2d");return i&&i.canvas===t?(function(t,e){var i=t.style,n=t.getAttribute("height"),r=t.getAttribute("width");if(t[a]={initial:{height:n,width:r,style:{display:i.display,height:i.height,width:i.width}}},i.display=i.display||"block",null===r||""===r){var o=d(t,"width");void 0!==o&&(t.width=o)}if(null===n||""===n)if(""===t.style.height)t.height=t.width/(e.options.aspectRatio||2);else{var s=d(t,"height");void 0!==o&&(t.height=s)}}(t,e),i):null},releaseContext:function(t){var e=t.canvas;if(e[a]){var i=e[a].initial;["height","width"].forEach(function(t){var a=i[t];n.isNullOrUndef(a)?e.removeAttribute(t):e.setAttribute(t,a)}),n.each(i.style||{},function(t,i){e.style[i]=t}),e.width=e.width,delete e[a]}},addEventListener:function(t,e,i){var r=t.canvas;if("resize"!==e){var o=i[a]||(i[a]={});c(r,e,(o.proxies||(o.proxies={}))[t.id+"_"+e]=function(e){var a,r,o,s;i((r=t,o=u[(a=e).type]||a.type,s=n.getRelativePosition(a,r),g(o,r,s.x,s.y,a)))})}else m(r,i,t)},removeEventListener:function(t,e,i){var n=t.canvas;if("resize"!==e){var r=((i[a]||{}).proxies||{})[t.id+"_"+e];r&&f(n,e,r)}else p(n)}},n.addEvent=c,n.removeEvent=f},{45:45}],48:[function(t,e,i){"use strict";var n=t(45),a=t(46),r=t(47),o=r._enabled?r:a;e.exports=n.extend({initialize:function(){},acquireContext:function(){},releaseContext:function(){},addEventListener:function(){},removeEventListener:function(){}},o)},{45:45,46:46,47:47}],49:[function(t,e,i){"use strict";e.exports={},e.exports.filler=t(50),e.exports.legend=t(51),e.exports.title=t(52)},{50:50,51:51,52:52}],50:[function(t,e,i){"use strict";var n=t(25),a=t(40),r=t(45);n._set("global",{plugins:{filler:{propagate:!0}}});var o={dataset:function(t){var e=t.fill,i=t.chart,n=i.getDatasetMeta(e),a=n&&i.isDatasetVisible(e)&&n.dataset._children||[],r=a.length||0;return r?function(t,e){return e<r&&a[e]._view||null}:null},boundary:function(t){var e=t.boundary,i=e?e.x:null,n=e?e.y:null;return function(t){return{x:null===i?t.x:i,y:null===n?t.y:n}}}};function s(t,e,i){var n,a=t._model||{},r=a.fill;if(void 0===r&&(r=!!a.backgroundColor),!1===r||null===r)return!1;if(!0===r)return"origin";if(n=parseFloat(r,10),isFinite(n)&&Math.floor(n)===n)return"-"!==r[0]&&"+"!==r[0]||(n=e+n),!(n===e||n<0||n>=i)&&n;switch(r){case"bottom":return"start";case"top":return"end";case"zero":return"origin";case"origin":case"start":case"end":return r;default:return!1}}function l(t){var e,i=t.el._model||{},n=t.el._scale||{},a=t.fill,r=null;if(isFinite(a))return null;if("start"===a?r=void 0===i.scaleBottom?n.bottom:i.scaleBottom:"end"===a?r=void 0===i.scaleTop?n.top:i.scaleTop:void 0!==i.scaleZero?r=i.scaleZero:n.getBasePosition?r=n.getBasePosition():n.getBasePixel&&(r=n.getBasePixel()),null!=r){if(void 0!==r.x&&void 0!==r.y)return r;if("number"==typeof r&&isFinite(r))return{x:(e=n.isHorizontal())?r:null,y:e?null:r}}return null}function u(t,e,i){var n,a=t[e].fill,r=[e];if(!i)return a;for(;!1!==a&&-1===r.indexOf(a);){if(!isFinite(a))return a;if(!(n=t[a]))return!1;if(n.visible)return a;r.push(a),a=n.fill}return!1}function d(t){return t&&!t.skip}function h(t,e,i,n,a){var o;if(n&&a){for(t.moveTo(e[0].x,e[0].y),o=1;o<n;++o)r.canvas.lineTo(t,e[o-1],e[o]);for(t.lineTo(i[a-1].x,i[a-1].y),o=a-1;o>0;--o)r.canvas.lineTo(t,i[o],i[o-1],!0)}}e.exports={id:"filler",afterDatasetsUpdate:function(t,e){var i,n,r,d,h,c,f,g=(t.data.datasets||[]).length,m=e.propagate,p=[];for(n=0;n<g;++n)d=null,(r=(i=t.getDatasetMeta(n)).dataset)&&r._model&&r instanceof a.Line&&(d={visible:t.isDatasetVisible(n),fill:s(r,n,g),chart:t,el:r}),i.$filler=d,p.push(d);for(n=0;n<g;++n)(d=p[n])&&(d.fill=u(p,n,m),d.boundary=l(d),d.mapper=(void 0,f=void 0,c=(h=d).fill,f="dataset",!1===c?null:(isFinite(c)||(f="boundary"),o[f](h))))},beforeDatasetDraw:function(t,e){var i=e.meta.$filler;if(i){var a=t.ctx,o=i.el,s=o._view,l=o._children||[],u=i.mapper,c=s.backgroundColor||n.global.defaultColor;u&&c&&l.length&&(r.canvas.clipArea(a,t.chartArea),function(t,e,i,n,a,r){var o,s,l,u,c,f,g,m=e.length,p=n.spanGaps,v=[],y=[],b=0,x=0;for(t.beginPath(),o=0,s=m+!!r;o<s;++o)c=i(u=e[l=o%m]._view,l,n),f=d(u),g=d(c),f&&g?(b=v.push(u),x=y.push(c)):b&&x&&(p?(f&&v.push(u),g&&y.push(c)):(h(t,v,y,b,x),b=x=0,v=[],y=[]));h(t,v,y,b,x),t.closePath(),t.fillStyle=a,t.fill()}(a,l,u,s,c,o._loop),r.canvas.unclipArea(a))}}}},{25:25,40:40,45:45}],51:[function(t,e,i){"use strict";var n=t(25),a=t(26),r=t(45),o=t(30),s=r.noop;function l(t,e){return t.usePointStyle?e*Math.SQRT2:t.boxWidth}n._set("global",{legend:{display:!0,position:"top",fullWidth:!0,reverse:!1,weight:1e3,onClick:function(t,e){var i=e.datasetIndex,n=this.chart,a=n.getDatasetMeta(i);a.hidden=null===a.hidden?!n.data.datasets[i].hidden:null,n.update()},onHover:null,labels:{boxWidth:40,padding:10,generateLabels:function(t){var e=t.data;return r.isArray(e.datasets)?e.datasets.map(function(e,i){return{text:e.label,fillStyle:r.isArray(e.backgroundColor)?e.backgroundColor[0]:e.backgroundColor,hidden:!t.isDatasetVisible(i),lineCap:e.borderCapStyle,lineDash:e.borderDash,lineDashOffset:e.borderDashOffset,lineJoin:e.borderJoinStyle,lineWidth:e.borderWidth,strokeStyle:e.borderColor,pointStyle:e.pointStyle,datasetIndex:i}},this):[]}}},legendCallback:function(t){var e=[];e.push('<ul class="'+t.id+'-legend">');for(var i=0;i<t.data.datasets.length;i++)e.push('<li><span style="background-color:'+t.data.datasets[i].backgroundColor+'"></span>'),t.data.datasets[i].label&&e.push(t.data.datasets[i].label),e.push("</li>");return e.push("</ul>"),e.join("")}});var u=a.extend({initialize:function(t){r.extend(this,t),this.legendHitBoxes=[],this.doughnutMode=!1},beforeUpdate:s,update:function(t,e,i){var n=this;return n.beforeUpdate(),n.maxWidth=t,n.maxHeight=e,n.margins=i,n.beforeSetDimensions(),n.setDimensions(),n.afterSetDimensions(),n.beforeBuildLabels(),n.buildLabels(),n.afterBuildLabels(),n.beforeFit(),n.fit(),n.afterFit(),n.afterUpdate(),n.minSize},afterUpdate:s,beforeSetDimensions:s,setDimensions:function(){var t=this;t.isHorizontal()?(t.width=t.maxWidth,t.left=0,t.right=t.width):(t.height=t.maxHeight,t.top=0,t.bottom=t.height),t.paddingLeft=0,t.paddingTop=0,t.paddingRight=0,t.paddingBottom=0,t.minSize={width:0,height:0}},afterSetDimensions:s,beforeBuildLabels:s,buildLabels:function(){var t=this,e=t.options.labels||{},i=r.callback(e.generateLabels,[t.chart],t)||[];e.filter&&(i=i.filter(function(i){return e.filter(i,t.chart.data)})),t.options.reverse&&i.reverse(),t.legendItems=i},afterBuildLabels:s,beforeFit:s,fit:function(){var t=this,e=t.options,i=e.labels,a=e.display,o=t.ctx,s=n.global,u=r.valueOrDefault,d=u(i.fontSize,s.defaultFontSize),h=u(i.fontStyle,s.defaultFontStyle),c=u(i.fontFamily,s.defaultFontFamily),f=r.fontString(d,h,c),g=t.legendHitBoxes=[],m=t.minSize,p=t.isHorizontal();if(p?(m.width=t.maxWidth,m.height=a?10:0):(m.width=a?10:0,m.height=t.maxHeight),a)if(o.font=f,p){var v=t.lineWidths=[0],y=t.legendItems.length?d+i.padding:0;o.textAlign="left",o.textBaseline="top",r.each(t.legendItems,function(e,n){var a=l(i,d)+d/2+o.measureText(e.text).width;v[v.length-1]+a+i.padding>=t.width&&(y+=d+i.padding,v[v.length]=t.left),g[n]={left:0,top:0,width:a,height:d},v[v.length-1]+=a+i.padding}),m.height+=y}else{var b=i.padding,x=t.columnWidths=[],_=i.padding,k=0,w=0,M=d+b;r.each(t.legendItems,function(t,e){var n=l(i,d)+d/2+o.measureText(t.text).width;w+M>m.height&&(_+=k+i.padding,x.push(k),k=0,w=0),k=Math.max(k,n),w+=M,g[e]={left:0,top:0,width:n,height:d}}),_+=k,x.push(k),m.width+=_}t.width=m.width,t.height=m.height},afterFit:s,isHorizontal:function(){return"top"===this.options.position||"bottom"===this.options.position},draw:function(){var t=this,e=t.options,i=e.labels,a=n.global,o=a.elements.line,s=t.width,u=t.lineWidths;if(e.display){var d,h=t.ctx,c=r.valueOrDefault,f=c(i.fontColor,a.defaultFontColor),g=c(i.fontSize,a.defaultFontSize),m=c(i.fontStyle,a.defaultFontStyle),p=c(i.fontFamily,a.defaultFontFamily),v=r.fontString(g,m,p);h.textAlign="left",h.textBaseline="middle",h.lineWidth=.5,h.strokeStyle=f,h.fillStyle=f,h.font=v;var y=l(i,g),b=t.legendHitBoxes,x=t.isHorizontal();d=x?{x:t.left+(s-u[0])/2,y:t.top+i.padding,line:0}:{x:t.left+i.padding,y:t.top+i.padding,line:0};var _=g+i.padding;r.each(t.legendItems,function(n,l){var f,m,p,v,k,w=h.measureText(n.text).width,M=y+g/2+w,S=d.x,D=d.y;x?S+M>=s&&(D=d.y+=_,d.line++,S=d.x=t.left+(s-u[d.line])/2):D+_>t.bottom&&(S=d.x=S+t.columnWidths[d.line]+i.padding,D=d.y=t.top+i.padding,d.line++),function(t,i,n){if(!(isNaN(y)||y<=0)){h.save(),h.fillStyle=c(n.fillStyle,a.defaultColor),h.lineCap=c(n.lineCap,o.borderCapStyle),h.lineDashOffset=c(n.lineDashOffset,o.borderDashOffset),h.lineJoin=c(n.lineJoin,o.borderJoinStyle),h.lineWidth=c(n.lineWidth,o.borderWidth),h.strokeStyle=c(n.strokeStyle,a.defaultColor);var s=0===c(n.lineWidth,o.borderWidth);if(h.setLineDash&&h.setLineDash(c(n.lineDash,o.borderDash)),e.labels&&e.labels.usePointStyle){var l=g*Math.SQRT2/2,u=l/Math.SQRT2,d=t+u,f=i+u;r.canvas.drawPoint(h,n.pointStyle,l,d,f)}else s||h.strokeRect(t,i,y,g),h.fillRect(t,i,y,g);h.restore()}}(S,D,n),b[l].left=S,b[l].top=D,f=n,m=w,v=y+(p=g/2)+S,k=D+p,h.fillText(f.text,v,k),f.hidden&&(h.beginPath(),h.lineWidth=2,h.moveTo(v,k),h.lineTo(v+m,k),h.stroke()),x?d.x+=M+i.padding:d.y+=_})}},handleEvent:function(t){var e=this,i=e.options,n="mouseup"===t.type?"click":t.type,a=!1;if("mousemove"===n){if(!i.onHover)return}else{if("click"!==n)return;if(!i.onClick)return}var r=t.x,o=t.y;if(r>=e.left&&r<=e.right&&o>=e.top&&o<=e.bottom)for(var s=e.legendHitBoxes,l=0;l<s.length;++l){var u=s[l];if(r>=u.left&&r<=u.left+u.width&&o>=u.top&&o<=u.top+u.height){if("click"===n){i.onClick.call(e,t.native,e.legendItems[l]),a=!0;break}if("mousemove"===n){i.onHover.call(e,t.native,e.legendItems[l]),a=!0;break}}}return a}});function d(t,e){var i=new u({ctx:t.ctx,options:e,chart:t});o.configure(t,i,e),o.addBox(t,i),t.legend=i}e.exports={id:"legend",_element:u,beforeInit:function(t){var e=t.options.legend;e&&d(t,e)},beforeUpdate:function(t){var e=t.options.legend,i=t.legend;e?(r.mergeIf(e,n.global.legend),i?(o.configure(t,i,e),i.options=e):d(t,e)):i&&(o.removeBox(t,i),delete t.legend)},afterEvent:function(t,e){var i=t.legend;i&&i.handleEvent(e)}}},{25:25,26:26,30:30,45:45}],52:[function(t,e,i){"use strict";var n=t(25),a=t(26),r=t(45),o=t(30),s=r.noop;n._set("global",{title:{display:!1,fontStyle:"bold",fullWidth:!0,lineHeight:1.2,padding:10,position:"top",text:"",weight:2e3}});var l=a.extend({initialize:function(t){r.extend(this,t),this.legendHitBoxes=[]},beforeUpdate:s,update:function(t,e,i){var n=this;return n.beforeUpdate(),n.maxWidth=t,n.maxHeight=e,n.margins=i,n.beforeSetDimensions(),n.setDimensions(),n.afterSetDimensions(),n.beforeBuildLabels(),n.buildLabels(),n.afterBuildLabels(),n.beforeFit(),n.fit(),n.afterFit(),n.afterUpdate(),n.minSize},afterUpdate:s,beforeSetDimensions:s,setDimensions:function(){var t=this;t.isHorizontal()?(t.width=t.maxWidth,t.left=0,t.right=t.width):(t.height=t.maxHeight,t.top=0,t.bottom=t.height),t.paddingLeft=0,t.paddingTop=0,t.paddingRight=0,t.paddingBottom=0,t.minSize={width:0,height:0}},afterSetDimensions:s,beforeBuildLabels:s,buildLabels:s,afterBuildLabels:s,beforeFit:s,fit:function(){var t=r.valueOrDefault,e=this.options,i=e.display,a=t(e.fontSize,n.global.defaultFontSize),o=this.minSize,s=r.isArray(e.text)?e.text.length:1,l=r.options.toLineHeight(e.lineHeight,a),u=i?s*l+2*e.padding:0;this.isHorizontal()?(o.width=this.maxWidth,o.height=u):(o.width=u,o.height=this.maxHeight),this.width=o.width,this.height=o.height},afterFit:s,isHorizontal:function(){var t=this.options.position;return"top"===t||"bottom"===t},draw:function(){var t=this.ctx,e=r.valueOrDefault,i=this.options,a=n.global;if(i.display){var o,s,l,u=e(i.fontSize,a.defaultFontSize),d=e(i.fontStyle,a.defaultFontStyle),h=e(i.fontFamily,a.defaultFontFamily),c=r.fontString(u,d,h),f=r.options.toLineHeight(i.lineHeight,u),g=f/2+i.padding,m=0,p=this.top,v=this.left,y=this.bottom,b=this.right;t.fillStyle=e(i.fontColor,a.defaultFontColor),t.font=c,this.isHorizontal()?(s=v+(b-v)/2,l=p+g,o=b-v):(s="left"===i.position?v+g:b-g,l=p+(y-p)/2,o=y-p,m=Math.PI*("left"===i.position?-.5:.5)),t.save(),t.translate(s,l),t.rotate(m),t.textAlign="center",t.textBaseline="middle";var x=i.text;if(r.isArray(x))for(var _=0,k=0;k<x.length;++k)t.fillText(x[k],0,_,o),_+=f;else t.fillText(x,0,0,o);t.restore()}}});function u(t,e){var i=new l({ctx:t.ctx,options:e,chart:t});o.configure(t,i,e),o.addBox(t,i),t.titleBlock=i}e.exports={id:"title",_element:l,beforeInit:function(t){var e=t.options.title;e&&u(t,e)},beforeUpdate:function(t){var e=t.options.title,i=t.titleBlock;e?(r.mergeIf(e,n.global.title),i?(o.configure(t,i,e),i.options=e):u(t,e)):i&&(o.removeBox(t,i),delete t.titleBlock)}}},{25:25,26:26,30:30,45:45}],53:[function(t,e,i){"use strict";e.exports=function(t){var e=t.Scale.extend({getLabels:function(){var t=this.chart.data;return this.options.labels||(this.isHorizontal()?t.xLabels:t.yLabels)||t.labels},determineDataLimits:function(){var t,e=this,i=e.getLabels();e.minIndex=0,e.maxIndex=i.length-1,void 0!==e.options.ticks.min&&(t=i.indexOf(e.options.ticks.min),e.minIndex=-1!==t?t:e.minIndex),void 0!==e.options.ticks.max&&(t=i.indexOf(e.options.ticks.max),e.maxIndex=-1!==t?t:e.maxIndex),e.min=i[e.minIndex],e.max=i[e.maxIndex]},buildTicks:function(){var t=this.getLabels();this.ticks=0===this.minIndex&&this.maxIndex===t.length-1?t:t.slice(this.minIndex,this.maxIndex+1)},getLabelForIndex:function(t,e){var i=this.chart.data,n=this.isHorizontal();return i.yLabels&&!n?this.getRightValue(i.datasets[e].data[t]):this.ticks[t-this.minIndex]},getPixelForValue:function(t,e){var i,n=this,a=n.options.offset,r=Math.max(n.maxIndex+1-n.minIndex-(a?0:1),1);if(null!=t&&(i=n.isHorizontal()?t.x:t.y),void 0!==i||void 0!==t&&isNaN(e)){t=i||t;var o=n.getLabels().indexOf(t);e=-1!==o?o:e}if(n.isHorizontal()){var s=n.width/r,l=s*(e-n.minIndex);return a&&(l+=s/2),n.left+Math.round(l)}var u=n.height/r,d=u*(e-n.minIndex);return a&&(d+=u/2),n.top+Math.round(d)},getPixelForTick:function(t){return this.getPixelForValue(this.ticks[t],t+this.minIndex,null)},getValueForPixel:function(t){var e=this.options.offset,i=Math.max(this._ticks.length-(e?0:1),1),n=this.isHorizontal(),a=(n?this.width:this.height)/i;return t-=n?this.left:this.top,e&&(t-=a/2),(t<=0?0:Math.round(t/a))+this.minIndex},getBasePixel:function(){return this.bottom}});t.scaleService.registerScaleType("category",e,{position:"bottom"})}},{}],54:[function(t,e,i){"use strict";var n=t(25),a=t(45),r=t(34);e.exports=function(t){var e={position:"left",ticks:{callback:r.formatters.linear}},i=t.LinearScaleBase.extend({determineDataLimits:function(){var t=this,e=t.options,i=t.chart,n=i.data.datasets,r=t.isHorizontal();function o(e){return r?e.xAxisID===t.id:e.yAxisID===t.id}t.min=null,t.max=null;var s=e.stacked;if(void 0===s&&a.each(n,function(t,e){if(!s){var n=i.getDatasetMeta(e);i.isDatasetVisible(e)&&o(n)&&void 0!==n.stack&&(s=!0)}}),e.stacked||s){var l={};a.each(n,function(n,r){var s=i.getDatasetMeta(r),u=[s.type,void 0===e.stacked&&void 0===s.stack?r:"",s.stack].join(".");void 0===l[u]&&(l[u]={positiveValues:[],negativeValues:[]});var d=l[u].positiveValues,h=l[u].negativeValues;i.isDatasetVisible(r)&&o(s)&&a.each(n.data,function(i,n){var a=+t.getRightValue(i);isNaN(a)||s.data[n].hidden||(d[n]=d[n]||0,h[n]=h[n]||0,e.relativePoints?d[n]=100:a<0?h[n]+=a:d[n]+=a)})}),a.each(l,function(e){var i=e.positiveValues.concat(e.negativeValues),n=a.min(i),r=a.max(i);t.min=null===t.min?n:Math.min(t.min,n),t.max=null===t.max?r:Math.max(t.max,r)})}else a.each(n,function(e,n){var r=i.getDatasetMeta(n);i.isDatasetVisible(n)&&o(r)&&a.each(e.data,function(e,i){var n=+t.getRightValue(e);isNaN(n)||r.data[i].hidden||(null===t.min?t.min=n:n<t.min&&(t.min=n),null===t.max?t.max=n:n>t.max&&(t.max=n))})});t.min=isFinite(t.min)&&!isNaN(t.min)?t.min:0,t.max=isFinite(t.max)&&!isNaN(t.max)?t.max:1,this.handleTickRangeOptions()},getTickLimit:function(){var t,e=this.options.ticks;if(this.isHorizontal())t=Math.min(e.maxTicksLimit?e.maxTicksLimit:11,Math.ceil(this.width/50));else{var i=a.valueOrDefault(e.fontSize,n.global.defaultFontSize);t=Math.min(e.maxTicksLimit?e.maxTicksLimit:11,Math.ceil(this.height/(2*i)))}return t},handleDirectionalChanges:function(){this.isHorizontal()||this.ticks.reverse()},getLabelForIndex:function(t,e){return+this.getRightValue(this.chart.data.datasets[e].data[t])},getPixelForValue:function(t){var e=this.start,i=+this.getRightValue(t),n=this.end-e;return this.isHorizontal()?this.left+this.width/n*(i-e):this.bottom-this.height/n*(i-e)},getValueForPixel:function(t){var e=this.isHorizontal(),i=e?this.width:this.height,n=(e?t-this.left:this.bottom-t)/i;return this.start+(this.end-this.start)*n},getPixelForTick:function(t){return this.getPixelForValue(this.ticksAsNumbers[t])}});t.scaleService.registerScaleType("linear",i,e)}},{25:25,34:34,45:45}],55:[function(t,e,i){"use strict";var n=t(45);e.exports=function(t){var e=n.noop;t.LinearScaleBase=t.Scale.extend({getRightValue:function(e){return"string"==typeof e?+e:t.Scale.prototype.getRightValue.call(this,e)},handleTickRangeOptions:function(){var t=this,e=t.options.ticks;if(e.beginAtZero){var i=n.sign(t.min),a=n.sign(t.max);i<0&&a<0?t.max=0:i>0&&a>0&&(t.min=0)}var r=void 0!==e.min||void 0!==e.suggestedMin,o=void 0!==e.max||void 0!==e.suggestedMax;void 0!==e.min?t.min=e.min:void 0!==e.suggestedMin&&(null===t.min?t.min=e.suggestedMin:t.min=Math.min(t.min,e.suggestedMin)),void 0!==e.max?t.max=e.max:void 0!==e.suggestedMax&&(null===t.max?t.max=e.suggestedMax:t.max=Math.max(t.max,e.suggestedMax)),r!==o&&t.min>=t.max&&(r?t.max=t.min+1:t.min=t.max-1),t.min===t.max&&(t.max++,e.beginAtZero||t.min--)},getTickLimit:e,handleDirectionalChanges:e,buildTicks:function(){var t=this,e=t.options.ticks,i=t.getTickLimit(),a={maxTicks:i=Math.max(2,i),min:e.min,max:e.max,stepSize:n.valueOrDefault(e.fixedStepSize,e.stepSize)},r=t.ticks=function(t,e){var i,a=[];if(t.stepSize&&t.stepSize>0)i=t.stepSize;else{var r=n.niceNum(e.max-e.min,!1);i=n.niceNum(r/(t.maxTicks-1),!0)}var o=Math.floor(e.min/i)*i,s=Math.ceil(e.max/i)*i;t.min&&t.max&&t.stepSize&&n.almostWhole((t.max-t.min)/t.stepSize,i/1e3)&&(o=t.min,s=t.max);var l=(s-o)/i;l=n.almostEquals(l,Math.round(l),i/1e3)?Math.round(l):Math.ceil(l);var u=1;i<1&&(u=Math.pow(10,i.toString().length-2),o=Math.round(o*u)/u,s=Math.round(s*u)/u),a.push(void 0!==t.min?t.min:o);for(var d=1;d<l;++d)a.push(Math.round((o+d*i)*u)/u);return a.push(void 0!==t.max?t.max:s),a}(a,t);t.handleDirectionalChanges(),t.max=n.max(r),t.min=n.min(r),e.reverse?(r.reverse(),t.start=t.max,t.end=t.min):(t.start=t.min,t.end=t.max)},convertTicksToLabels:function(){this.ticksAsNumbers=this.ticks.slice(),this.zeroLineIndex=this.ticks.indexOf(0),t.Scale.prototype.convertTicksToLabels.call(this)}})}},{45:45}],56:[function(t,e,i){"use strict";var n=t(45),a=t(34);e.exports=function(t){var e={position:"left",ticks:{callback:a.formatters.logarithmic}},i=t.Scale.extend({determineDataLimits:function(){var t=this,e=t.options,i=t.chart,a=i.data.datasets,r=t.isHorizontal();function o(e){return r?e.xAxisID===t.id:e.yAxisID===t.id}t.min=null,t.max=null,t.minNotZero=null;var s=e.stacked;if(void 0===s&&n.each(a,function(t,e){if(!s){var n=i.getDatasetMeta(e);i.isDatasetVisible(e)&&o(n)&&void 0!==n.stack&&(s=!0)}}),e.stacked||s){var l={};n.each(a,function(a,r){var s=i.getDatasetMeta(r),u=[s.type,void 0===e.stacked&&void 0===s.stack?r:"",s.stack].join(".");i.isDatasetVisible(r)&&o(s)&&(void 0===l[u]&&(l[u]=[]),n.each(a.data,function(e,i){var n=l[u],a=+t.getRightValue(e);isNaN(a)||s.data[i].hidden||a<0||(n[i]=n[i]||0,n[i]+=a)}))}),n.each(l,function(e){if(e.length>0){var i=n.min(e),a=n.max(e);t.min=null===t.min?i:Math.min(t.min,i),t.max=null===t.max?a:Math.max(t.max,a)}})}else n.each(a,function(e,a){var r=i.getDatasetMeta(a);i.isDatasetVisible(a)&&o(r)&&n.each(e.data,function(e,i){var n=+t.getRightValue(e);isNaN(n)||r.data[i].hidden||n<0||(null===t.min?t.min=n:n<t.min&&(t.min=n),null===t.max?t.max=n:n>t.max&&(t.max=n),0!==n&&(null===t.minNotZero||n<t.minNotZero)&&(t.minNotZero=n))})});this.handleTickRangeOptions()},handleTickRangeOptions:function(){var t=this,e=t.options.ticks,i=n.valueOrDefault;t.min=i(e.min,t.min),t.max=i(e.max,t.max),t.min===t.max&&(0!==t.min&&null!==t.min?(t.min=Math.pow(10,Math.floor(n.log10(t.min))-1),t.max=Math.pow(10,Math.floor(n.log10(t.max))+1)):(t.min=1,t.max=10)),null===t.min&&(t.min=Math.pow(10,Math.floor(n.log10(t.max))-1)),null===t.max&&(t.max=0!==t.min?Math.pow(10,Math.floor(n.log10(t.min))+1):10),null===t.minNotZero&&(t.min>0?t.minNotZero=t.min:t.max<1?t.minNotZero=Math.pow(10,Math.floor(n.log10(t.max))):t.minNotZero=1)},buildTicks:function(){var t=this,e=t.options.ticks,i=!t.isHorizontal(),a={min:e.min,max:e.max},r=t.ticks=function(t,e){var i,a,r=[],o=n.valueOrDefault,s=o(t.min,Math.pow(10,Math.floor(n.log10(e.min)))),l=Math.floor(n.log10(e.max)),u=Math.ceil(e.max/Math.pow(10,l));0===s?(i=Math.floor(n.log10(e.minNotZero)),a=Math.floor(e.minNotZero/Math.pow(10,i)),r.push(s),s=a*Math.pow(10,i)):(i=Math.floor(n.log10(s)),a=Math.floor(s/Math.pow(10,i)));for(var d=i<0?Math.pow(10,Math.abs(i)):1;r.push(s),10==++a&&(a=1,d=++i>=0?1:d),s=Math.round(a*Math.pow(10,i)*d)/d,i<l||i===l&&a<u;);var h=o(t.max,s);return r.push(h),r}(a,t);t.max=n.max(r),t.min=n.min(r),e.reverse?(i=!i,t.start=t.max,t.end=t.min):(t.start=t.min,t.end=t.max),i&&r.reverse()},convertTicksToLabels:function(){this.tickValues=this.ticks.slice(),t.Scale.prototype.convertTicksToLabels.call(this)},getLabelForIndex:function(t,e){return+this.getRightValue(this.chart.data.datasets[e].data[t])},getPixelForTick:function(t){return this.getPixelForValue(this.tickValues[t])},_getFirstTickValue:function(t){var e=Math.floor(n.log10(t));return Math.floor(t/Math.pow(10,e))*Math.pow(10,e)},getPixelForValue:function(e){var i,a,r,o,s,l=this,u=l.options.ticks.reverse,d=n.log10,h=l._getFirstTickValue(l.minNotZero),c=0;return e=+l.getRightValue(e),u?(r=l.end,o=l.start,s=-1):(r=l.start,o=l.end,s=1),l.isHorizontal()?(i=l.width,a=u?l.right:l.left):(i=l.height,s*=-1,a=u?l.top:l.bottom),e!==r&&(0===r&&(i-=c=n.getValueOrDefault(l.options.ticks.fontSize,t.defaults.global.defaultFontSize),r=h),0!==e&&(c+=i/(d(o)-d(r))*(d(e)-d(r))),a+=s*c),a},getValueForPixel:function(e){var i,a,r,o,s=this,l=s.options.ticks.reverse,u=n.log10,d=s._getFirstTickValue(s.minNotZero);if(l?(a=s.end,r=s.start):(a=s.start,r=s.end),s.isHorizontal()?(i=s.width,o=l?s.right-e:e-s.left):(i=s.height,o=l?e-s.top:s.bottom-e),o!==a){if(0===a){var h=n.getValueOrDefault(s.options.ticks.fontSize,t.defaults.global.defaultFontSize);o-=h,i-=h,a=d}o*=u(r)-u(a),o/=i,o=Math.pow(10,u(a)+o)}return o}});t.scaleService.registerScaleType("logarithmic",i,e)}},{34:34,45:45}],57:[function(t,e,i){"use strict";var n=t(25),a=t(45),r=t(34);e.exports=function(t){var e=n.global,i={display:!0,animate:!0,position:"chartArea",angleLines:{display:!0,color:"rgba(0, 0, 0, 0.1)",lineWidth:1},gridLines:{circular:!1},ticks:{showLabelBackdrop:!0,backdropColor:"rgba(255,255,255,0.75)",backdropPaddingY:2,backdropPaddingX:2,callback:r.formatters.linear},pointLabels:{display:!0,fontSize:10,callback:function(t){return t}}};function o(t){var e=t.options;return e.angleLines.display||e.pointLabels.display?t.chart.data.labels.length:0}function s(t){var i=t.options.pointLabels,n=a.valueOrDefault(i.fontSize,e.defaultFontSize),r=a.valueOrDefault(i.fontStyle,e.defaultFontStyle),o=a.valueOrDefault(i.fontFamily,e.defaultFontFamily);return{size:n,style:r,family:o,font:a.fontString(n,r,o)}}function l(t,e,i,n,a){return t===n||t===a?{start:e-i/2,end:e+i/2}:t<n||t>a?{start:e-i-5,end:e}:{start:e,end:e+i+5}}function u(t,e,i,n){if(a.isArray(e))for(var r=i.y,o=1.5*n,s=0;s<e.length;++s)t.fillText(e[s],i.x,r),r+=o;else t.fillText(e,i.x,i.y)}function d(t){return a.isNumber(t)?t:0}var h=t.LinearScaleBase.extend({setDimensions:function(){var t=this,i=t.options,n=i.ticks;t.width=t.maxWidth,t.height=t.maxHeight,t.xCenter=Math.round(t.width/2),t.yCenter=Math.round(t.height/2);var r=a.min([t.height,t.width]),o=a.valueOrDefault(n.fontSize,e.defaultFontSize);t.drawingArea=i.display?r/2-(o/2+n.backdropPaddingY):r/2},determineDataLimits:function(){var t=this,e=t.chart,i=Number.POSITIVE_INFINITY,n=Number.NEGATIVE_INFINITY;a.each(e.data.datasets,function(r,o){if(e.isDatasetVisible(o)){var s=e.getDatasetMeta(o);a.each(r.data,function(e,a){var r=+t.getRightValue(e);isNaN(r)||s.data[a].hidden||(i=Math.min(r,i),n=Math.max(r,n))})}}),t.min=i===Number.POSITIVE_INFINITY?0:i,t.max=n===Number.NEGATIVE_INFINITY?0:n,t.handleTickRangeOptions()},getTickLimit:function(){var t=this.options.ticks,i=a.valueOrDefault(t.fontSize,e.defaultFontSize);return Math.min(t.maxTicksLimit?t.maxTicksLimit:11,Math.ceil(this.drawingArea/(1.5*i)))},convertTicksToLabels:function(){t.LinearScaleBase.prototype.convertTicksToLabels.call(this),this.pointLabels=this.chart.data.labels.map(this.options.pointLabels.callback,this)},getLabelForIndex:function(t,e){return+this.getRightValue(this.chart.data.datasets[e].data[t])},fit:function(){var t,e;this.options.pointLabels.display?function(t){var e,i,n,r=s(t),u=Math.min(t.height/2,t.width/2),d={r:t.width,l:0,t:t.height,b:0},h={};t.ctx.font=r.font,t._pointLabelSizes=[];var c,f,g,m=o(t);for(e=0;e<m;e++){n=t.getPointPosition(e,u),c=t.ctx,f=r.size,g=t.pointLabels[e]||"",i=a.isArray(g)?{w:a.longestText(c,c.font,g),h:g.length*f+1.5*(g.length-1)*f}:{w:c.measureText(g).width,h:f},t._pointLabelSizes[e]=i;var p=t.getIndexAngle(e),v=a.toDegrees(p)%360,y=l(v,n.x,i.w,0,180),b=l(v,n.y,i.h,90,270);y.start<d.l&&(d.l=y.start,h.l=p),y.end>d.r&&(d.r=y.end,h.r=p),b.start<d.t&&(d.t=b.start,h.t=p),b.end>d.b&&(d.b=b.end,h.b=p)}t.setReductions(u,d,h)}(this):(t=this,e=Math.min(t.height/2,t.width/2),t.drawingArea=Math.round(e),t.setCenterPoint(0,0,0,0))},setReductions:function(t,e,i){var n=e.l/Math.sin(i.l),a=Math.max(e.r-this.width,0)/Math.sin(i.r),r=-e.t/Math.cos(i.t),o=-Math.max(e.b-this.height,0)/Math.cos(i.b);n=d(n),a=d(a),r=d(r),o=d(o),this.drawingArea=Math.min(Math.round(t-(n+a)/2),Math.round(t-(r+o)/2)),this.setCenterPoint(n,a,r,o)},setCenterPoint:function(t,e,i,n){var a=this,r=a.width-e-a.drawingArea,o=t+a.drawingArea,s=i+a.drawingArea,l=a.height-n-a.drawingArea;a.xCenter=Math.round((o+r)/2+a.left),a.yCenter=Math.round((s+l)/2+a.top)},getIndexAngle:function(t){return t*(2*Math.PI/o(this))+(this.chart.options&&this.chart.options.startAngle?this.chart.options.startAngle:0)*Math.PI*2/360},getDistanceFromCenterForValue:function(t){if(null===t)return 0;var e=this.drawingArea/(this.max-this.min);return this.options.ticks.reverse?(this.max-t)*e:(t-this.min)*e},getPointPosition:function(t,e){var i=this.getIndexAngle(t)-Math.PI/2;return{x:Math.round(Math.cos(i)*e)+this.xCenter,y:Math.round(Math.sin(i)*e)+this.yCenter}},getPointPositionForValue:function(t,e){return this.getPointPosition(t,this.getDistanceFromCenterForValue(e))},getBasePosition:function(){var t=this.min,e=this.max;return this.getPointPositionForValue(0,this.beginAtZero?0:t<0&&e<0?e:t>0&&e>0?t:0)},draw:function(){var t=this,i=t.options,n=i.gridLines,r=i.ticks,l=a.valueOrDefault;if(i.display){var d=t.ctx,h=this.getIndexAngle(0),c=l(r.fontSize,e.defaultFontSize),f=l(r.fontStyle,e.defaultFontStyle),g=l(r.fontFamily,e.defaultFontFamily),m=a.fontString(c,f,g);a.each(t.ticks,function(i,s){if(s>0||r.reverse){var u=t.getDistanceFromCenterForValue(t.ticksAsNumbers[s]);if(n.display&&0!==s&&function(t,e,i,n){var r=t.ctx;if(r.strokeStyle=a.valueAtIndexOrDefault(e.color,n-1),r.lineWidth=a.valueAtIndexOrDefault(e.lineWidth,n-1),t.options.gridLines.circular)r.beginPath(),r.arc(t.xCenter,t.yCenter,i,0,2*Math.PI),r.closePath(),r.stroke();else{var s=o(t);if(0===s)return;r.beginPath();var l=t.getPointPosition(0,i);r.moveTo(l.x,l.y);for(var u=1;u<s;u++)l=t.getPointPosition(u,i),r.lineTo(l.x,l.y);r.closePath(),r.stroke()}}(t,n,u,s),r.display){var f=l(r.fontColor,e.defaultFontColor);if(d.font=m,d.save(),d.translate(t.xCenter,t.yCenter),d.rotate(h),r.showLabelBackdrop){var g=d.measureText(i).width;d.fillStyle=r.backdropColor,d.fillRect(-g/2-r.backdropPaddingX,-u-c/2-r.backdropPaddingY,g+2*r.backdropPaddingX,c+2*r.backdropPaddingY)}d.textAlign="center",d.textBaseline="middle",d.fillStyle=f,d.fillText(i,0,-u),d.restore()}}}),(i.angleLines.display||i.pointLabels.display)&&function(t){var i=t.ctx,n=t.options,r=n.angleLines,l=n.pointLabels;i.lineWidth=r.lineWidth,i.strokeStyle=r.color;var d,h,c,f,g=t.getDistanceFromCenterForValue(n.ticks.reverse?t.min:t.max),m=s(t);i.textBaseline="top";for(var p=o(t)-1;p>=0;p--){if(r.display){var v=t.getPointPosition(p,g);i.beginPath(),i.moveTo(t.xCenter,t.yCenter),i.lineTo(v.x,v.y),i.stroke(),i.closePath()}if(l.display){var y=t.getPointPosition(p,g+5),b=a.valueAtIndexOrDefault(l.fontColor,p,e.defaultFontColor);i.font=m.font,i.fillStyle=b;var x=t.getIndexAngle(p),_=a.toDegrees(x);i.textAlign=0===(f=_)||180===f?"center":f<180?"left":"right",d=_,h=t._pointLabelSizes[p],c=y,90===d||270===d?c.y-=h.h/2:(d>270||d<90)&&(c.y-=h.h),u(i,t.pointLabels[p]||"",y,m.size)}}}(t)}}});t.scaleService.registerScaleType("radialLinear",h,i)}},{25:25,34:34,45:45}],58:[function(t,e,i){"use strict";var n=t(6);n="function"==typeof n?n:window.moment;var a=t(25),r=t(45),o=Number.MIN_SAFE_INTEGER||-9007199254740991,s=Number.MAX_SAFE_INTEGER||9007199254740991,l={millisecond:{common:!0,size:1,steps:[1,2,5,10,20,50,100,250,500]},second:{common:!0,size:1e3,steps:[1,2,5,10,30]},minute:{common:!0,size:6e4,steps:[1,2,5,10,30]},hour:{common:!0,size:36e5,steps:[1,2,3,6,12]},day:{common:!0,size:864e5,steps:[1,2,5]},week:{common:!1,size:6048e5,steps:[1,2,3,4]},month:{common:!0,size:2628e6,steps:[1,2,3]},quarter:{common:!1,size:7884e6,steps:[1,2,3,4]},year:{common:!0,size:3154e7}},u=Object.keys(l);function d(t,e){return t-e}function h(t){var e,i,n,a={},r=[];for(e=0,i=t.length;e<i;++e)a[n=t[e]]||(a[n]=!0,r.push(n));return r}function c(t,e,i,n){var a=function(t,e,i){for(var n,a,r,o=0,s=t.length-1;o>=0&&o<=s;){if(a=t[(n=o+s>>1)-1]||null,r=t[n],!a)return{lo:null,hi:r};if(r[e]<i)o=n+1;else{if(!(a[e]>i))return{lo:a,hi:r};s=n-1}}return{lo:r,hi:null}}(t,e,i),r=a.lo?a.hi?a.lo:t[t.length-2]:t[0],o=a.lo?a.hi?a.hi:t[t.length-1]:t[1],s=o[e]-r[e],l=s?(i-r[e])/s:0,u=(o[n]-r[n])*l;return r[n]+u}function f(t,e){var i=e.parser,a=e.parser||e.format;return"function"==typeof i?i(t):"string"==typeof t&&"string"==typeof a?n(t,a):(t instanceof n||(t=n(t)),t.isValid()?t:"function"==typeof a?a(t):t)}function g(t,e){if(r.isNullOrUndef(t))return null;var i=e.options.time,n=f(e.getRightValue(t),i);return n.isValid()?(i.round&&n.startOf(i.round),n.valueOf()):null}function m(t){for(var e=u.indexOf(t)+1,i=u.length;e<i;++e)if(l[u[e]].common)return u[e]}function p(t,e,i,a){var o,d=a.time,h=d.unit||function(t,e,i,n){var a,r,o,d=u.length;for(a=u.indexOf(t);a<d-1;++a)if(o=(r=l[u[a]]).steps?r.steps[r.steps.length-1]:s,r.common&&Math.ceil((i-e)/(o*r.size))<=n)return u[a];return u[d-1]}(d.minUnit,t,e,i),c=m(h),f=r.valueOrDefault(d.stepSize,d.unitStepSize),g="week"===h&&d.isoWeekday,p=a.ticks.major.enabled,v=l[h],y=n(t),b=n(e),x=[];for(f||(f=function(t,e,i,n){var a,r,o,s=e-t,u=l[i],d=u.size,h=u.steps;if(!h)return Math.ceil(s/(n*d));for(a=0,r=h.length;a<r&&(o=h[a],!(Math.ceil(s/(d*o))<=n));++a);return o}(t,e,h,i)),g&&(y=y.isoWeekday(g),b=b.isoWeekday(g)),y=y.startOf(g?"day":h),(b=b.startOf(g?"day":h))<e&&b.add(1,h),o=n(y),p&&c&&!g&&!d.round&&(o.startOf(c),o.add(~~((y-o)/(v.size*f))*f,h));o<b;o.add(f,h))x.push(+o);return x.push(+o),x}e.exports=function(t){var e=t.Scale.extend({initialize:function(){if(!n)throw new Error("Chart.js - Moment.js could not be found! You must include it before Chart.js to use the time scale. Download at https://momentjs.com");this.mergeTicksOptions(),t.Scale.prototype.initialize.call(this)},update:function(){var e=this.options;return e.time&&e.time.format&&console.warn("options.time.format is deprecated and replaced by options.time.parser."),t.Scale.prototype.update.apply(this,arguments)},getRightValue:function(e){return e&&void 0!==e.t&&(e=e.t),t.Scale.prototype.getRightValue.call(this,e)},determineDataLimits:function(){var t,e,i,a,l,u,c=this,f=c.chart,m=c.options.time,p=m.unit||"day",v=s,y=o,b=[],x=[],_=[];for(t=0,i=f.data.labels.length;t<i;++t)_.push(g(f.data.labels[t],c));for(t=0,i=(f.data.datasets||[]).length;t<i;++t)if(f.isDatasetVisible(t))if(l=f.data.datasets[t].data,r.isObject(l[0]))for(x[t]=[],e=0,a=l.length;e<a;++e)u=g(l[e],c),b.push(u),x[t][e]=u;else b.push.apply(b,_),x[t]=_.slice(0);else x[t]=[];_.length&&(_=h(_).sort(d),v=Math.min(v,_[0]),y=Math.max(y,_[_.length-1])),b.length&&(b=h(b).sort(d),v=Math.min(v,b[0]),y=Math.max(y,b[b.length-1])),v=g(m.min,c)||v,y=g(m.max,c)||y,v=v===s?+n().startOf(p):v,y=y===o?+n().endOf(p)+1:y,c.min=Math.min(v,y),c.max=Math.max(v+1,y),c._horizontal=c.isHorizontal(),c._table=[],c._timestamps={data:b,datasets:x,labels:_}},buildTicks:function(){var t,e,i,a,r,o,s,d,h,v,y,b,x=this,_=x.min,k=x.max,w=x.options,M=w.time,S=[],D=[];switch(w.ticks.source){case"data":S=x._timestamps.data;break;case"labels":S=x._timestamps.labels;break;case"auto":default:S=p(_,k,x.getLabelCapacity(_),w)}for("ticks"===w.bounds&&S.length&&(_=S[0],k=S[S.length-1]),_=g(M.min,x)||_,k=g(M.max,x)||k,t=0,e=S.length;t<e;++t)(i=S[t])>=_&&i<=k&&D.push(i);return x.min=_,x.max=k,x._unit=M.unit||function(t,e,i,a){var r,o,s=n.duration(n(a).diff(n(i)));for(r=u.length-1;r>=u.indexOf(e);r--)if(o=u[r],l[o].common&&s.as(o)>=t.length)return o;return u[e?u.indexOf(e):0]}(D,M.minUnit,x.min,x.max),x._majorUnit=m(x._unit),x._table=function(t,e,i,n){if("linear"===n||!t.length)return[{time:e,pos:0},{time:i,pos:1}];var a,r,o,s,l,u=[],d=[e];for(a=0,r=t.length;a<r;++a)(s=t[a])>e&&s<i&&d.push(s);for(d.push(i),a=0,r=d.length;a<r;++a)l=d[a+1],o=d[a-1],s=d[a],void 0!==o&&void 0!==l&&Math.round((l+o)/2)===s||u.push({time:s,pos:a/(r-1)});return u}(x._timestamps.data,_,k,w.distribution),x._offsets=(a=x._table,r=D,o=_,s=k,y=0,b=0,(d=w).offset&&r.length&&(d.time.min||(h=r.length>1?r[1]:s,v=r[0],y=(c(a,"time",h,"pos")-c(a,"time",v,"pos"))/2),d.time.max||(h=r[r.length-1],v=r.length>1?r[r.length-2]:o,b=(c(a,"time",h,"pos")-c(a,"time",v,"pos"))/2)),{left:y,right:b}),x._labelFormat=function(t,e){var i,n,a,r=t.length;for(i=0;i<r;i++){if(0!==(n=f(t[i],e)).millisecond())return"MMM D, YYYY h:mm:ss.SSS a";0===n.second()&&0===n.minute()&&0===n.hour()||(a=!0)}return a?"MMM D, YYYY h:mm:ss a":"MMM D, YYYY"}(x._timestamps.data,M),function(t,e){var i,a,r,o,s=[];for(i=0,a=t.length;i<a;++i)r=t[i],o=!!e&&r===+n(r).startOf(e),s.push({value:r,major:o});return s}(D,x._majorUnit)},getLabelForIndex:function(t,e){var i=this.chart.data,n=this.options.time,a=i.labels&&t<i.labels.length?i.labels[t]:"",o=i.datasets[e].data[t];return r.isObject(o)&&(a=this.getRightValue(o)),n.tooltipFormat?f(a,n).format(n.tooltipFormat):"string"==typeof a?a:f(a,n).format(this._labelFormat)},tickFormatFunction:function(t,e,i,n){var a=this.options,o=t.valueOf(),s=a.time.displayFormats,l=s[this._unit],u=this._majorUnit,d=s[u],h=t.clone().startOf(u).valueOf(),c=a.ticks.major,f=c.enabled&&u&&d&&o===h,g=t.format(n||(f?d:l)),m=f?c:a.ticks.minor,p=r.valueOrDefault(m.callback,m.userCallback);return p?p(g,e,i):g},convertTicksToLabels:function(t){var e,i,a=[];for(e=0,i=t.length;e<i;++e)a.push(this.tickFormatFunction(n(t[e].value),e,t));return a},getPixelForOffset:function(t){var e=this,i=e._horizontal?e.width:e.height,n=e._horizontal?e.left:e.top,a=c(e._table,"time",t,"pos");return n+i*(e._offsets.left+a)/(e._offsets.left+1+e._offsets.right)},getPixelForValue:function(t,e,i){var n=null;if(void 0!==e&&void 0!==i&&(n=this._timestamps.datasets[i][e]),null===n&&(n=g(t,this)),null!==n)return this.getPixelForOffset(n)},getPixelForTick:function(t){var e=this.getTicks();return t>=0&&t<e.length?this.getPixelForOffset(e[t].value):null},getValueForPixel:function(t){var e=this,i=e._horizontal?e.width:e.height,a=e._horizontal?e.left:e.top,r=(i?(t-a)/i:0)*(e._offsets.left+1+e._offsets.left)-e._offsets.right,o=c(e._table,"pos",r,"time");return n(o)},getLabelWidth:function(t){var e=this.options.ticks,i=this.ctx.measureText(t).width,n=r.toRadians(e.maxRotation),o=Math.cos(n),s=Math.sin(n);return i*o+r.valueOrDefault(e.fontSize,a.global.defaultFontSize)*s},getLabelCapacity:function(t){var e=this.options.time.displayFormats.millisecond,i=this.tickFormatFunction(n(t),0,[],e),a=this.getLabelWidth(i),r=this.isHorizontal()?this.width:this.height,o=Math.floor(r/a);return o>0?o:1}});t.scaleService.registerScaleType("time",e,{position:"bottom",distribution:"linear",bounds:"data",time:{parser:!1,format:!1,unit:!1,round:!1,displayFormat:!1,isoWeekday:!1,minUnit:"millisecond",displayFormats:{millisecond:"h:mm:ss.SSS a",second:"h:mm:ss a",minute:"h:mm a",hour:"hA",day:"MMM D",week:"ll",month:"MMM YYYY",quarter:"[Q]Q - YYYY",year:"YYYY"}},ticks:{autoSkip:!1,source:"auto",major:{enabled:!1}}})}},{25:25,45:45,6:6}]},{},[7])(7)});
/*! RESOURCE: AddTeamMembers */
var AddTeamMembers = Class.create(GlideDialogWindow, {
initialize: function () {
this.setUpFacade();
},
setUpFacade: function () {
GlideDialogWindow.prototype.initialize.call(this, "task_window", false);
this.setTitle(getMessage("Add Team Members"));
this.setBody(this.getMarkUp(), false, false);
},
setUpEvents: function () {
var dialog = this;
var okButton = $("ok");
if (okButton) {
okButton.on("click", function () {
var mapData = {};
if (dialog.fillDataMap (mapData)) {
var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembers2Processor");
for (var strKey in mapData) {
processor.addParam(strKey, mapData[strKey]);
}
dialog.showStatus(getMessage("Adding team members..."));
processor.getXML(function () {
dialog.refresh();
dialog._onCloseClicked();
});
} else {
dialog._onCloseClicked();
}
});
}
var cancelButton = $("cancel");
if (cancelButton) {
cancelButton.on("click", function () {
dialog._onCloseClicked();
});
}
var okNGButton = $("okNG");
if (okNGButton) {
okNGButton.on("click", function () {
dialog._onCloseClicked();
});
}
var cancelNGButton = $("cancelNG");
if (cancelNGButton) {
cancelNGButton.on("click", function () {
dialog._onCloseClicked();
});
}
var teamCombo = $("teamId");
if (teamCombo) {
teamCombo.on("change", function (){
dialog.updateMembers ();
});
}
},
updateMembers: function () {
var arrMemberInfo = [];
var teamCombo = $("teamId");
if (teamCombo) {
var strTeamSysId = teamCombo.value;
var recTeamMember = new GlideRecord ("scrum_pp_release_team_member");
recTeamMember.addQuery ("team", strTeamSysId);
recTeamMember.query ();
while (recTeamMember.next ()) {
var recSysUser = new GlideRecord ("sys_user");
recSysUser.addQuery ("sys_id", recTeamMember.name);
recSysUser.query ();
var strName = recSysUser.next () ? recSysUser.name : "";
var strPoints = recTeamMember.default_sprint_points + "";
arrMemberInfo.push ({name: strName, points: strPoints});
}
}
if (arrMemberInfo.length > 0) {
var strHtml = "<tr><th style='text-align: left; white-space: nowrap'>" +
"Member</th><th style='text-align: left; white-space: nowrap'>Sprint Points</th><tr>";
for (var nSlot = 0; nSlot < arrMemberInfo.length; ++nSlot) {
var strMemberName = arrMemberInfo[nSlot].name + "";
var strMemberPoints = arrMemberInfo[nSlot].points + "";
strHtml += "<tr><td  style='text-align: left; white-space: nowrap'>" + strMemberName +
"</td><td style='text-align: left; white-space: nowrap'>" + strMemberPoints + "</td></tr>";
}
$("memberId").update (strHtml);
} else {
$("memberId").update ("<tr><td style='font-weight: bold'>"+getMessage("No team members")+"</td></tr>");
}
},
refresh: function(){
GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
},
getScrumReleaseTeamSysId: function () {
return g_form.getUniqueValue() + "";
},
getUserChosenTeamSysIds: function () {
return $F('teamId') + "";
},
showStatus: function (strMessage) {
$("task_controls").update(strMessage);
},
display: function(bIsVisible) {
$("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
},
getMarkUp: function () {
var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
groupAjax.addParam('sysparm_name', 'getTeamInfo');
groupAjax.addParam('sysparm_scrum_team_sysid', this.getScrumReleaseTeamSysId());
groupAjax.getXML(this.generateMarkUp.bind(this));
},
generateMarkUp: function(response) {
var mapTeamInfo = {};
var teamData = response.responseXML.getElementsByTagName("team");
var strName, strSysId;
for (var i = 0; i < teamData.length; i++) {
strName = teamData[i].getAttribute("name");
strSysId = teamData[i].getAttribute("sysid");
mapTeamInfo[strName] = {
name: strName,
sysid: strSysId
};
}
var arrTeamNames = [];
for (var strTeamName in mapTeamInfo) {
arrTeamNames.push (strTeamName + "");
}
arrTeamNames.sort ();
var strMarkUp = "";
if (arrTeamNames.length > 0) {
var strTable = "<table><tr><td><label for='teamId'>"+getMessage("Team")+"</label>&nbsp;<select id='teamId'>";
for (var nSlot = 0; nSlot < arrTeamNames.length; ++nSlot) {
strName = arrTeamNames[nSlot];
strSysId = mapTeamInfo [strName].sysid;
strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
}
strTable += "</select></label></td></tr></table>";
var strTable2 = "<table style='width: 100%;'><tr><td style='width: 50%;'></td><td><table id='memberId'></table></td><td style='width: 50%;'></td></tr></table>";
strMarkUp = "<div id='task_controls' style='overflow: auto;>" + strTable + strTable2 +
"</div><table style='width: 100%'><tr><td style='white-space: nowrap; text-align: right;'><button id='ok' type='button'>" + getMessage("OK") + "</button>" +
"<button id='cancel' type='button'>" + getMessage("Cancel") + "</button></td></tr></table>";
} else {
strMarkUp = "<div id='task_controls'><p>No release teams found</p>" +
"<table style='width: 100%'><tr><td style='white-space: nowrap; text-align: right;'><button id='okNG' type='button'>" + getMessage("OK") + "</button>" +
"<button id='cancelNG' type='button'>" + getMessage("Cancel") + "</button></td></tr></table></div>";
}
this.setBody(strMarkUp, false, false);
this.setUpEvents();
this.display(true);
this.setWidth(280);
},
fillDataMap: function (mapData) {
var strChosenTeamSysId = this.getUserChosenTeamSysIds ();
if (strChosenTeamSysId) {
mapData.sysparm_name = "createReleaseTeamMembers";
mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId ();
mapData.sysparm_teams = strChosenTeamSysId;
return true;
} else {
return false;
}
}
});
/*! RESOURCE: ScrumAddSprints */
var ScrumAddSprints = Class.create({
initialize: function(gr) {
this._gr=gr;
this._prmNms  = ["spName","spDuration","spStartDate","spStartNum","spNum","_tn","_sys_id"];
this._dateFN = ["spStartDate"];
this._refObs = [];
this._prmVls = [];
for (var i=0;i<this._prmNms.length;i++) {
this._prmVls[this._prmNms[i]]="";
}
this._prmErr = [];
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
this._crtDlg = new dialogClass("scrum_add_sprints_dialog");
this._crtDlg.setTitle("Add Sprints");
this._crtDlg.setPreference("_tn",this._gr.getTableName());
this._crtDlg.setPreference("_sys_id", (this._gr.getUniqueValue()));
this._crtDlg.setPreference("handler",this);
},
showDialog: function() {
this._crtDlg.render();
},
onSubmit: function() {
this._readFormValues();
if (!this._validate()) {
var errMsg = "Before you submit:";
for (var i = 0; i < this._prmErr.length; i++) {
errMsg += "\n * "+this._prmErr[i];
}
alert(errMsg);
$j('#spName').focus();
return false;
}
this._crtDlg.destroy();
var ga = new GlideAjax("ScrumAddSprintsAjaxProcessor");
ga.addParam("sysparm_name","checkDuration");
for (var i = 0; i < this._prmNms.length; i++ ) {
ga.addParam(this._prmNms[i],this._prmVls[this._prmNms[i]]);
}
ga.getXML(this.checkComplete.bind(this));
return false;
},
checkComplete: function(response) {
var resp = response.responseXML.getElementsByTagName("item");
if (resp[0].getAttribute("result") == "success") {
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
this._plsWtDlg = new dialogClass("scrum_please_wait");
this._plsWtDlg.setTitle("Working.  Please wait.");
this._plsWtDlg.render();
var ga = new GlideAjax("ScrumAddSprintsAjaxProcessor");
ga.addParam("sysparm_name","addSprints");
for (var i = 0; i < this._prmNms.length; i++ ) {
ga.addParam(this._prmNms[i],this._prmVls[this._prmNms[i]]);
}
ga.getXML(this.createComplete.bind(this));
return false;
}
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
this._rlsPshDlg = new dialogClass("scrum_release_push_confirm_dialog");
this._rlsPshDlg.setTitle("Modify Release Dates");
this._rlsPshDlg.setPreference("handler",this);
this._rlsPshDlg.render();
},
confirmReleasePush: function() {
this._rlsPshDlg.destroy();
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
this._plsWtDlg = new dialogClass("scrum_please_wait");
this._plsWtDlg.setTitle("Working.  Please wait.");
this._plsWtDlg.render();
var ga = new GlideAjax("ScrumAddSprintsAjaxProcessor");
ga.addParam("sysparm_name","addSprints");
for (var i = 0; i < this._prmNms.length; i++ ) {
ga.addParam(this._prmNms[i],this._prmVls[this._prmNms[i]]);
}
ga.getXML(this.createComplete.bind(this));
return false;
},
cancelReleasePush: function(response) {
this._rlsPshDlg.destroy();
window.location.reload();
return false;
},
createComplete: function(response) {
this._plsWtDlg.destroy();
var resp = response.responseXML.getElementsByTagName("item");
if (resp[0].getAttribute("result") == "success") {
this._sprints = response.responseXML.documentElement.getAttribute("answer");
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
this._viewConfirm = new dialogClass("scrum_sprints_view_confirm_dialog");
this._viewConfirm.setTitle("Sprints Created");
this._viewConfirm.setPreference("handler",this);
this._viewConfirm.render();
}
else {
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
this._createError = new dialogClass("scrum_error");
this._createError.setTitle("Error Creating Sprints");
this._createError.setPreference("handler",this);
this._createError.render();
}
},
viewConfirmed: function() {
this._viewConfirm.destroy();
window.location="rm_sprint_list.do?sysparm_query=numberIN"+this._sprints+"&sysparm_view=scrum";
return false;
},
viewCancelled: function() {
this._viewConfirm.destroy();
window.location.reload();
return false;
},
popCal: function(dateFieldId) {
return new GwtDateTimePicker(dateFieldId,g_user_date_time_format, true);
},
_validate: function() {
var valid = true;
this._prmErr = [];
if (this._prmVls["spName"] == "") {
this._prmErr.push("You must supply a Name");
valid = false;
}
if (this._prmVls["spDuration"] == "" || isNaN(this._prmVls['spDuration'])) {
this._prmErr.push("You must supply a valid numeric duration");
valid = false;
}
if (this._prmVls["spStartDate"] == "") {
this._prmErr.push("You must supply a Start Date");
valid = false;
}
if (this._prmVls["spNum"] == "" || isNaN(this._prmVls['spNum'])) {
this._prmErr.push("You must supply a valid Number of Sprints to create");
valid = false;
}
if (this._prmVls["spStartNum"] == "" || isNaN(this._prmVls['spStartNum'])) {
this._prmErr.push("You must supply a valid starting number");
valid = false;
}
return valid;
},
_readFormValues: function() {
for (var i=0;i<this._prmNms.length;i++) {
var frmVl = this._getValue(this._prmNms[i]);
if ((typeof frmVl === "undefined") || frmVl == "undefined" || frmVl == null || frmVl == "null") {
frmVl = "";
}
this._prmVls[this._prmNms[i]] = frmVl;
}
},
_getValue: function(inptNm) {
return gel(inptNm).value;
},
type: "ScrumAddSprints"
});
/*! RESOURCE: jsUserSurveyComment.component.js */
(function(angular) {
var app = angular.module("jsApp");
var TEMPLATE = '<div class="section-container">'+
' <div class="section-top">'+
'<div class="text-area" ng-class="c.isEmptyUser ? \'js-flex-detail\' : \'\'">'+
'<div class="avatar" ng-if="c.id">'+
'<sn-avatar class="avatar-extra-small avatar-container" height="70px" width="78px" primary="c.id" show-presence="false" />'+
'</div>'+
'<div class="text-mid">'+
' <h2 title="{{c.name ? c.name : c.title}}" ng-click="c.name ? angular.noop : c.gotoLink()" ng-style="{\'cursor\' : c.name ? \'default\' : \'pointer\'}" style="width: 100%; overflow: hidden; text-overflow: ellipsis; ">{{c.name ? c.name : c.title}}</h2>'+
'<p class="short-dc">{{c.description}}</p>'+
'<button type="button" ng-if="c.id" href="{{c.link}}" id="btn{{c.id}}" ng-click="c.getIdButton()" class="btn-viewMore" data-toggle="modal" data-target="#modal{{c.id}}">{{c.detail}}</button>'+
'<button type="button" ng-if="!c.id" href="{{c.link}}" id="btn{{c.idlink}}" ng-click="c.getIdButton()" class="btn-viewMore" data-toggle="modal" data-target="#modal{{c.idlink}}">{{c.detail}}</button>'+
'</div>'+
'</div>'+
'<div ng-if="c.url.length && c.attachment.sys_id && c.isEmptyUser" class="img" >'+
'<img ng-click="c.gotoLink()" style="overflow: hidden; text-overflow: ellipsis; cursor: pointer;" src="{{c.base64Img}}" />'+
'</div>'+
'<div ng-if="c.url.length<1 && c.attachment.sys_id && c.isEmptyUser" class="video-area" style="text-align: center;">'+
'<video class="our-vd" controls preload="none" ng-attr-poster="data:{{c.videoAttachment.preview.content_type}};base64,{{c.videoAttachment.preview.base64}}">'+
'<source src="{{::c.videoAttachment.link}}" type="video/mp4">'+
'</video>'+
'</div>'+
'</div>'+
'</div>';
app.component("jsUsComment", {
template: TEMPLATE,
bindings: {
"id" : "@",
"name": "@",
"description" : "@?",
"fulldescription" : "@?",
"detail" : "@",
"link" : "@",
"idlink" : "@",
"viewFunction" : "&",
"title" : "@",
"url" : "@",
"attachment" : "=",
"videoAttachment" : "=",
"isEmptyUser" : "<?"
},
controller: jsUsCommentCtrl,
controllerAs : 'c',
bindToController: true,
});
jsUsCommentCtrl.$inject = ["$log"];
function jsUsCommentCtrl($log) {
var seft = this;
seft.id = seft.id;
seft.name = seft.name;
seft.description = seft.description;
seft.fulldescription = seft.fulldescription;
seft.detail = seft.detail;
seft.link = seft.detail;
seft.idlink = seft.idlink;
if(seft.attachment.sys_id){
seft.base64Img = 'data:' + seft.attachment.content_type + ';base64,' + seft.attachment.base64;
} else {
seft.base64Img = null;
}
seft.getIdButton = getIdButton;
seft.gotoLink = gotoLink;
function getIdButton(){
console.log(seft.id);
}
function gotoLink(){
window.open(seft.url, "_blank");
}
}
})(window.angular);
/*! RESOURCE: upfAppModule.js */
(function(angular) {
var app = angular.module('upfApp',[
'upfApp.navigation',
'upfApp.dictionary',
'dndLists'
]).config([
'$compileProvider',
function( $compileProvider )
{
console.log("----------aHrefSanitizationWhitelist---------");
$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|sip|mailto|tel|chrome-extension):/);
}
]);
})(window.angular);
/*! RESOURCE: GlobalCatalogItemFunctions */
function getSCAttachmentCount() {
var length;
try {
length = angular.element("#sc_cat_item").scope().attachments.length;
} catch(e) {
length = -1;
}
return length;
}
/*! RESOURCE: loadingSpinner.js */
(function(doc,win,undefined){
var loading = doc.createElement("section");
var defaultSetting = {
color		:	"#666",
background	:	"rgba(0,0,0,.2)",
timeout		:	1,
scale		:	1
}
var fadeIn = "fadeIn "+ defaultSetting.timeout +"s forwards";
var fadeOut = "fadeOut "+ defaultSetting.timeout +"s forwards";
loading.style.backgroundColor = defaultSetting.background;
loading.setAttribute("class","H5_loading");
loading.setAttribute("id","H5_loading");
var loading_process = doc.createElement("div");
loading_process.setAttribute("class","H5_loading_process");
var divs = new Array();
for(var i = 0; i < 8; i++){
div = doc.createElement("div");
divs.push(div);
div.style.background = defaultSetting.color;
loading_process.appendChild(div);
}
loading.appendChild(loading_process);
doc.documentElement.appendChild(loading);
win.H5_loading = {
show : function(option){
loading.style.display = "block";
if(option){
if(option.color){
for(var i = 0; i < divs.length; i++){
divs[i].style.backgroundColor = option.color;
}
}
if(option.background){
loading.style.backgroundColor = option.background;
}
if(option.timeout){
fadeIn = "fadeIn "+ option.timeout +"s forwards";
}
if(option.scale && (typeof option.scale) == "number"){
loading_process.style.transform = "scale("+ option.scale +","+ option.scale +")";
}
}
loading.style.animation = fadeIn;
loading.style.webkitAnimation = fadeIn;
loading.style.MozAnimation = fadeIn;
loading.style.msAnimation = fadeIn;
},
hide : function(timeout){
if(timeout){
fadeOut = "fadeOut "+ timeout +"s forwards";
}else{
timeout = defaultSetting.timeout;
}
loading.style.animation = fadeOut;
loading.style.webkitAnimation = fadeOut;
loading.style.MozAnimation = fadeOut;
loading.style.msAnimation = fadeOut;
setTimeout(function(){
loading.style.display = "none";
},timeout*500);
}
};
})(document,window);
/*! RESOURCE: FileSaver_edu.js */
var saveAs = saveAs
|| (typeof navigator !== "undefined" &&
navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob.bind(navigator))
|| (function(view) {
"use strict";
if (typeof navigator !== "undefined" &&
/MSIE [1-9]\./.test(navigator.userAgent)) {
return;
}
var
doc = view.document
, get_URL = function() {
return view.URL || view.webkitURL || view;
}
, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
, can_use_save_link = !view.externalHost && "download" in save_link
, click = function(node) {
var event = doc.createEvent("MouseEvents");
event.initMouseEvent(
"click", true, false, view, 0, 0, 0, 0, 0
, false, false, false, false, 0, null
);
node.dispatchEvent(event);
}
, webkit_req_fs = view.webkitRequestFileSystem
, req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem
, throw_outside = function(ex) {
(view.setImmediate || view.setTimeout)(function() {
throw ex;
}, 0);
}
, force_saveable_type = "application/octet-stream"
, fs_min_size = 0
, deletion_queue = []
, process_deletion_queue = function() {
var i = deletion_queue.length;
while (i--) {
var file = deletion_queue[i];
if (typeof file === "string") {
get_URL().revokeObjectURL(file);
} else {
file.remove();
}
}
deletion_queue.length = 0;
}
, dispatch = function(filesaver, event_types, event) {
event_types = [].concat(event_types);
var i = event_types.length;
while (i--) {
var listener = filesaver["on" + event_types[i]];
if (typeof listener === "function") {
try {
listener.call(filesaver, event || filesaver);
} catch (ex) {
throw_outside(ex);
}
}
}
}
, FileSaver = function(blob, name) {
var
filesaver = this
, type = blob.type
, blob_changed = false
, object_url
, target_view
, get_object_url = function() {
var object_url = get_URL().createObjectURL(blob);
deletion_queue.push(object_url);
return object_url;
}
, dispatch_all = function() {
dispatch(filesaver, "writestart progress write writeend".split(" "));
}
, fs_error = function() {
if (blob_changed || !object_url) {
object_url = get_object_url(blob);
}
if (target_view) {
target_view.location.href = object_url;
} else {
window.open(object_url, "_blank");
}
filesaver.readyState = filesaver.DONE;
dispatch_all();
}
, abortable = function(func) {
return function() {
if (filesaver.readyState !== filesaver.DONE) {
return func.apply(this, arguments);
}
};
}
, create_if_not_found = {create: true, exclusive: false}
, slice
;
filesaver.readyState = filesaver.INIT;
if (!name) {
name = "download";
}
if (can_use_save_link) {
object_url = get_object_url(blob);
save_link.href = object_url;
save_link.download = name;
click(save_link);
filesaver.readyState = filesaver.DONE;
dispatch_all();
return;
}
if (view.chrome && type && type !== force_saveable_type) {
slice = blob.slice || blob.webkitSlice;
blob = slice.call(blob, 0, blob.size, force_saveable_type);
blob_changed = true;
}
if (webkit_req_fs && name !== "download") {
name += ".download";
}
if (type === force_saveable_type || webkit_req_fs) {
target_view = view;
}
if (!req_fs) {
fs_error();
return;
}
fs_min_size += blob.size;
req_fs(view.TEMPORARY, fs_min_size, abortable(function(fs) {
fs.root.getDirectory("saved", create_if_not_found, abortable(function(dir) {
var save = function() {
dir.getFile(name, create_if_not_found, abortable(function(file) {
file.createWriter(abortable(function(writer) {
writer.onwriteend = function(event) {
target_view.location.href = file.toURL();
deletion_queue.push(file);
filesaver.readyState = filesaver.DONE;
dispatch(filesaver, "writeend", event);
};
writer.onerror = function() {
var error = writer.error;
if (error.code !== error.ABORT_ERR) {
fs_error();
}
};
"writestart progress write abort".split(" ").forEach(function(event) {
writer["on" + event] = filesaver["on" + event];
});
writer.write(blob);
filesaver.abort = function() {
writer.abort();
filesaver.readyState = filesaver.DONE;
};
filesaver.readyState = filesaver.WRITING;
}), fs_error);
}), fs_error);
};
dir.getFile(name, {create: false}, abortable(function(file) {
file.remove();
save();
}), abortable(function(ex) {
if (ex.code === ex.NOT_FOUND_ERR) {
save();
} else {
fs_error();
}
}));
}), fs_error);
}), fs_error);
}
, FS_proto = FileSaver.prototype
, saveAs = function(blob, name) {
return new FileSaver(blob, name);
}
;
FS_proto.abort = function() {
var filesaver = this;
filesaver.readyState = filesaver.DONE;
dispatch(filesaver, "abort");
};
FS_proto.readyState = FS_proto.INIT = 0;
FS_proto.WRITING = 1;
FS_proto.DONE = 2;
FS_proto.error =
FS_proto.onwritestart =
FS_proto.onprogress =
FS_proto.onwrite =
FS_proto.onabort =
FS_proto.onerror =
FS_proto.onwriteend =
null;
view.addEventListener("unload", process_deletion_queue, false);
saveAs.unload = function() {
process_deletion_queue();
view.removeEventListener("unload", process_deletion_queue, false);
};
return saveAs;
}(
typeof self !== "undefined" && self
|| typeof window !== "undefined" && window
|| this.content
));
if (typeof module !== "undefined" && module !== null) {
module.exports = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
define([], function() {
return saveAs;
});
}
/*! RESOURCE: AppointmentBookingConfigHelper */
var APP_BOOKING_CONSTANTS = {};
APP_BOOKING_CONSTANTS.MESSAGES = {};
APP_BOOKING_CONSTANTS.MESSAGES.ERROR = {};
APP_BOOKING_CONSTANTS.MESSAGES.ERROR.ONSUBMIT = "";
APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DAILYSCHEDULE = "";
APP_BOOKING_CONSTANTS.MESSAGES.ERROR.BREAKTIME = "";
APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DURATION = "";
APP_BOOKING_CONSTANTS.MESSAGES.AVAILABLE = "";
APP_BOOKING_CONSTANTS.MESSAGES.BREAK = "";
APP_BOOKING_CONSTANTS.MESSAGES.INSUFFICIENT_TIME = "";
APP_BOOKING_CONSTANTS.MESSAGES.FETCHED = false;
var AppointmentBookingConfigHelper = Class.create();
AppointmentBookingConfigHelper.prototype = {
initialize : function () {
this.htmlTemplate = '';
},
clearTimespans : function () {
var macroElem = $j("#appointmentBookingTimeSlotContainer")[0];
if (macroElem) {
macroElem.innerHTML = '';
}
},
setBookableTime : function (bookableTime) {
g_form.setValue("bookable_time", bookableTime);
},
initEventHandlers : function() {
var breakStartElem = $j("#break-start");
var breakEndElem = $j("#break-end");
if (breakStartElem && breakEndElem) {
breakStartElem.change(function() {
var configHelper = new AppointmentBookingConfigHelper();
if(configHelper.validateBreakTimes()){
configHelper.refreshTimeSlots();
}
});
breakEndElem.change(function() {
var configHelper = new AppointmentBookingConfigHelper();
if(configHelper.validateBreakTimes()){
configHelper.refreshTimeSlots();
}
});
}
},
validateDailySchedule : function () {
var dailyStartTime = g_form.getValue("daily_start_time");
var dailyEndTime = g_form.getValue("daily_end_time");
g_form.hideFieldMsg('daily_start_time', true);
g_form.hideFieldMsg('daily_end_time', true);
if (!this.compareTime(dailyStartTime,dailyEndTime)) {
g_form.showFieldMsg('daily_start_time',APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DAILYSCHEDULE,'error');
return false;
}
return true;
},
validateBreakTimes : function () {
var considerBreak = g_form.getValue("include_daily_break");
var breakStartElem = $j("#break-start");
var breakEndElem = $j("#break-end");
g_form.hideFieldMsg('include_daily_break', true);
if (breakStartElem && breakEndElem) {
if(breakStartElem[0].value == "" || breakEndElem[0].value == "")
return true;
if (!this.compareTime(breakStartElem[0].value, breakEndElem[0].value)) {
g_form.showFieldMsg('include_daily_break',getMessage("Break start time cannot be after break end time"),'error');
return false;
}
}
return true;
},
validateDurations : function(){
var appointmentDuration = g_form.getValue("appointment_duration");
var workDuration = g_form.getValue("work_duration");
var avgTravelDuration = g_form.getValue("average_travel_duration");
g_form.hideFieldMsg('appointment_duration', true);
if((Number(workDuration) + Number(avgTravelDuration)) > Number(appointmentDuration)){
g_form.showFieldMsg('appointment_duration',APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DURATION,'error');
return false;
}
return true;
},
validateOnSubmit : function() {
var shouldSubmit = true;
g_form.clearMessages();
if (!this.validateDailySchedule()) {
g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.ONSUBMIT);
g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DAILYSCHEDULE);
shouldSubmit = false;
}
if (!this.validateBreakTimes()) {
if (shouldSubmit)
g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.ONSUBMIT);
g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.BREAKTIME);
shouldSubmit = false;
}
if (!this.validateDurations()) {
if (shouldSubmit)
g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.ONSUBMIT);
g_form.addErrorMessage(APP_BOOKING_CONSTANTS.MESSAGES.ERROR.DURATION);
shouldSubmit = false;
}
return shouldSubmit;
},
compareTime : function(start, end) {
if (start && end) {
var startComponentsArr = start.split(":");
var endComponentsArr = end.split(":");
var len = Math.min(startComponentsArr.length, endComponentsArr.length);
var startNumeric = 0;
var endNumeric = 0;
try {
for (var i = len-1;i>=0;i--){
startNumeric = startNumeric/60.0 + parseInt(startComponentsArr[i]);
endNumeric = endNumeric/60.0 + parseInt(endComponentsArr[i]);
}
return startNumeric <= endNumeric;
} catch(err) {
return false;
}
}
},
refreshTimeSlots : function() {
if (!APP_BOOKING_CONSTANTS.MESSAGES.FETCHED) {
var appointmentBookingAjax = new GlideAjax('sn_apptmnt_booking.AppointmentBookingAjaxUtil');
appointmentBookingAjax.addParam('sysparm_name','getTranslatedMessagesForAppBookingConfig');
appointmentBookingAjax.getXML(this.processAppBookingTranslationMessagesResponse.bind(this));
} else
this._refreshTimeSlots();
},
processAppBookingTranslationMessagesResponse : function(response, args) {
translatedMessages = response.responseXML.documentElement.getAttribute("answer");
if (translatedMessages) {
APP_BOOKING_CONSTANTS = JSON.parse(translatedMessages);
APP_BOOKING_CONSTANTS.MESSAGES.FETCHED = true;
this._refreshTimeSlots();
}
},
_refreshTimeSlots : function() {
var timeSlots = this.processTimeSpans();
var bookableTime = [];
for (var i = 0; i < timeSlots.length; i++) {
var slot = timeSlots[i];
if (slot) {
var slotClassName = "time-slot";
if (!slot.available)
slotClassName += "-disable";
this.htmlTemplate += '<div class="'+slotClassName+'">';
if (slot.available)
this.htmlTemplate += '<div class="time-slot-label"><span data-index='+i+' action-value='+i+' class="icon-check"></span></div>';
else
this.htmlTemplate += '<div class="time-slot-label"></div>';
this.htmlTemplate += '<div class="time-slot-value"> <span class="m-l-xs m-r-xs"> '+slot.start+' </span>';
this.htmlTemplate += '<span class="m-l-xs m-r-xs"> - </span>';
this.htmlTemplate += '<span class="m-l-xs m-r-xs"> '+slot.end+' </span> </div>';
if (slot.available)
bookableTime.push(slot.start + "-" + slot.end);
if (!slot.available)
this.htmlTemplate += '<div class="time-slot-reason"> <span class="m-l-xs m-r-xs"> - '+slot.reason+' </span> </div>';
this.htmlTemplate += '</div>';
}
}
this.setBookableTime(bookableTime.join()+"");
this.updateTimeSlots();
},
processTimeSpans : function () {
var windowDuration = g_form.getValue("appointment_duration");
var dailyStartTime = g_form.getValue("daily_start_time");
var dailyEndTime = g_form.getValue("daily_end_time");
if (this.isNil(windowDuration) || this.isNil(dailyStartTime) || this.isNil(dailyEndTime))
return [];
var considerBreak = g_form.getValue("include_daily_break");
var breakStartElem = $j("#break-start")[0];
var breakEndElem = $j("#break-end")[0];
var breakStartTime = "0:00", breakEndTime = "0:00";
if ((considerBreak == true || considerBreak == "true") && breakStartElem && breakEndElem) {
breakStartTime = breakStartElem.value+"";
breakEndTime = breakEndElem.value+"";
considerBreak = true;
var breakString = breakStartTime + "-" + breakEndTime;
g_form.setValue("break_time",breakString);
}
return this.buildTimeSpans(dailyStartTime, dailyEndTime, breakStartTime, breakEndTime, windowDuration, considerBreak);
},
isNil : function(value) {
return (value == "" || value == null || value == undefined || value == "null" || value == "undefined");
},
updateTimeSlots : function() {
var macroElem = $j("#appointmentBookingTimeSlotContainer")[0];
if (macroElem) {
macroElem.innerHTML = this.htmlTemplate;
}
},
setHourMin: function(now, hourMin){
var arr = hourMin.split(/[-: ]/);
var hour = Number(arr[0]);
var min = Number(arr[1]);
now.setHours(hour);
now.setMinutes(min);
now.setSeconds(0);
return now;
},
buildTimeSpans : function (dailyStartTime, dailyEndTime, breakStartTime, breakEndTime, windowDuration, considerBreak) {
var timeSpans = [], now = new Date();
var CONSTANTS = {};
CONSTANTS.AVAILABLE = APP_BOOKING_CONSTANTS.MESSAGES.AVAILABLE;
CONSTANTS.BREAK = APP_BOOKING_CONSTANTS.MESSAGES.BREAK;
CONSTANTS.INSUFFICIENT_TIME = APP_BOOKING_CONSTANTS.MESSAGES.INSUFFICIENT_TIME;
CONSTANTS.MAX_MINUTES_IN_A_DAY = 1440;
var start = this.setHourMin(new Date(), dailyStartTime);
var end = this.setHourMin(new Date(), dailyEndTime);
if (start.getTimezoneOffset() != end.getTimezoneOffset()) {
start.setDate(start.getDate() + 1);
end.setDate(end.getDate() + 1);
}
var currNumVal = start.getTime(), dailyEndNumVal = end.getTime();
var endNumVal = dailyEndNumVal;
var startTimeStamp = dailyStartTime;
if (currNumVal >= dailyEndNumVal) {
console.error("daily start time cannot be on or after daily end time");
return timeSpans;
}
var breakStart = this.setHourMin(new Date(), breakStartTime);
var breakEnd = this.setHourMin(new Date(), breakEndTime);
var breakStartNumVal = breakStart.getTime(), breakEndNumVal = breakEnd.getTime();
var breakStartTimeStamp = -1, breakEndTimeStamp = -1;
if (considerBreak)
considerBreak = this.shouldConsiderBreak(currNumVal, endNumVal, breakStartNumVal,breakEndNumVal);
if (considerBreak) {
breakStartTimeStamp = this.getTimestamp(breakStart);
breakEndTimeStamp = this.getTimestamp(breakEnd);
}
if (considerBreak && breakStartNumVal < currNumVal) {
currNumVal = breakStartNumVal;
start = breakStart;
startTimeStamp = this.getTimestamp(breakStart);
}
var maxCounter = 0;
while (currNumVal < dailyEndNumVal || maxCounter > CONSTANTS.MAX_MINUTES_IN_A_DAY) {
var nextWindow = this.addMinutes(start, parseInt(windowDuration));
endNumVal = nextWindow.getTime();
if (endNumVal > dailyEndNumVal)
break;
var breakOverlapStartTime = this.doBreakOverlapStartTime(currNumVal, endNumVal, breakStartNumVal,breakEndNumVal);
var breakOverlapEndTime = this.doBreakOverlapEndTime(currNumVal, endNumVal, breakStartNumVal,breakEndNumVal);
if (considerBreak && (breakOverlapStartTime || breakOverlapEndTime)) {
if (breakOverlapEndTime) {
timeSpans.push(this.getWindowSpan(startTimeStamp, breakStartTimeStamp, false, CONSTANTS.INSUFFICIENT_TIME));
}
timeSpans.push(this.getWindowSpan(breakStartTimeStamp, breakEndTimeStamp, false, CONSTANTS.BREAK));
currNumVal = breakEnd.getTime();
start = breakEnd;
startTimeStamp = breakEndTimeStamp;
} else {
var endTimeStamp = this.getTimestamp(nextWindow);
timeSpans.push(this.getWindowSpan(startTimeStamp, endTimeStamp, true, CONSTANTS.AVAILABLE));
startTimeStamp = endTimeStamp;
start = nextWindow;
currNumVal = start.getTime();
}
maxCounter++;
}
return timeSpans;
},
getWindowSpan : function (start, end, available, reason) {
var windowSpan = {};
windowSpan.start = start;
windowSpan.end = end;
windowSpan.window = start + "-" + end;
windowSpan.available = available;
windowSpan.reason = reason;
return windowSpan;
},
shouldConsiderBreak : function (windowStart, windowEnd, breakStart, breakEnd) {
var considerBreak = false;
if (!breakStart || !breakEnd || breakStart == breakEnd)
return false;
if (breakStart > breakEnd) {
return false;
}
if (breakStart < windowStart && breakEnd <= windowStart) {
return false;
}
if (breakStart >= windowEnd && breakEnd > windowEnd) {
return false;
}
return true;
},
doBreakOverlapStartTime : function (windowStart, windowEnd, breakStart, breakEnd) {
return (breakStart <= windowStart && breakEnd > windowStart);
},
doBreakOverlapEndTime : function (windowStart, windowEnd, breakStart, breakEnd) {
return (breakStart > windowStart && breakStart < windowEnd);
},
dateTimeInyyyymmdd : function (dt, time) {
var dateVal = this._getDateInyyyymmdd(dt);
var dateTimeVal = dateVal + " " + time;
return dateTimeVal;
},
_getDateInyyyymmdd : function (dateVal) {
if (dateVal) {
var d = new Date(dateVal), month = '' + (d.getMonth() + 1), day = ''
+ d.getDate(), year = d.getFullYear();
if (month.length < 2)
month = '0' + month;
if (day.length < 2)
day = '0' + day;
return [ year, month, day ].join('-');
}
return null;
},
addMinutes : function (dt, minutes) {
return new Date(dt.getTime() + minutes * 60000);
},
getTimestamp : function (dt) {
if (dt && dt instanceof Date) {
var hours = dt.getHours(), minutes = dt.getMinutes(), seconds = dt
.getSeconds();
if (hours < 10) {
hours = "0" + hours;
}
if (minutes < 10) {
minutes = "0" + minutes;
}
if (seconds < 10) {
seconds = "0" + seconds;
}
return hours + ":" + minutes;
}
return null;
},
hideBreakTime : function(){
document.getElementById("break-container").style.visibility="hidden";
},
showBreakTime : function(){
document.getElementById("break-container").style.visibility="visible";
},
setBreakStart : function(startTime){
document.getElementById("break-start").value = startTime;
},
setBreakEnd : function(endTime){
document.getElementById("break-end").value = endTime;
}
};
/*! RESOURCE: pdb_HighchartsConfigBuilder */
var HighchartsBuilder = {
getChartConfig: function(chartOptions, tzOffset) {
var chartTitle = chartOptions.title.text,
xAxisTitle = chartOptions.xAxis.title.text,
xAxisCategories = chartOptions.xAxis.categories,
yAxisTitle = chartOptions.yAxis.title.text,
series = chartOptions.series;
this.convertEpochtoMs(xAxisCategories);
this.formatDataSeries(xAxisCategories, series);
var config = {
chart: {
type: 'area',
zoomType: 'x'
},
credits: {
enabled: false
},
title: {
text: chartTitle
},
xAxis: {
type: 'datetime',
title: {
text: xAxisTitle,
style: {textTransform: 'capitalize'}
}
},
yAxis: {
reversedStacks: false,
title: {
text: yAxisTitle,
style: {textTransform: 'capitalize'}
}
},
plotOptions: {
area: {
stacking: 'normal'
},
series: {
marker: {
enabled: true,
symbol: 'circle',
radius: 2
},
step: 'center'
}
},
tooltip: {
valueDecimals: 2,
style: {
whiteSpace: "wrap",
width: "200px"
}
},
series: series
};
var convertedOffset = -1 * (tzOffset/60);
Highcharts.setOptions({
lang: {
thousandsSep: ','
},
global: {
timezoneOffset: convertedOffset
}
});
return config;
},
convertEpochtoMs: function(categories) {
categories.forEach(function(point, index, arr) {
arr[index] *= 1000;
});
},
formatDataSeries: function(categories, series) {
series.forEach(function(row, index, arr) {
arr[index].data.forEach(function(innerRow, innerIndex, innerArr) {
var value = innerRow;
if (value == "NaN") {
value = 0;
}
var xValue = categories[innerIndex];
innerArr[innerIndex] = [xValue, value];
});
});
}
};
/*! RESOURCE: getReferenceAdvanced */
function getReferenceAdvancedDesktop(fake, fieldName, fieldList) {
var fieldReference;
if(g_form.getValue(fieldName))
{
try{
fieldReference = g_form.getGlideUIElement(fieldName).reference;
}
catch(error_getReferenceAdvance)
{
fieldReference = g_form.getReference(fieldName).tableName;
}
}
else if (fieldName.match(':'))
{
var table_sysid = fieldName.split(':');
var table_name = table_sysid[0];
var table_record_sysid = table_sysid[1];
fieldReference = table_name;
}
return getReferenceAdvanced(g_form, fieldName, fieldList, fieldReference);
}
function getReferenceAdvancedPortal(g_form, fieldName, fieldList) {
if (!g_form || typeof g_form != "object") {
alert("The getReferenceAdvanced() function requires the g_form object to be passed from the Service Portal.");
return;
}
var fieldReference = '';
if(g_form.getValue(fieldName))
{
fieldReference = g_form.getField(fieldName).refTable;
}
else if (fieldName.match(':'))
{
var table_sysid = fieldName.split(':');
var table_name = table_sysid[0];
var table_record_sysid = table_sysid[1];
fieldReference = table_name;
}
return getReferenceAdvanced(g_form, fieldName, fieldList, fieldReference);
}
function getReferenceAdvanced(g_form, fieldName, fieldList, fieldReference) {
var log = 'SCA API LOG: getReferenceAdvanced';
var table_sysid = '';
var table_name = '';
var table_record_sysid = '';
var ui_type = 'desktop';
try{g_form.getReference(fieldName).tableName;}catch(e1){ui_type='portal';}
if (ui_type == 'portal')
{
log+= 'for Portal';
if (!g_form || typeof g_form != "object")
{
alert("The getReferenceAdvanced() function requires the g_form object to be passed from the Service Portal.");
return;
}
if(g_form.getValue(fieldName))
{
fieldReference = g_form.getField(fieldName).refTable;
}
else if (fieldName.match(':'))
{
table_sysid = fieldName.split(':');
table_name = table_sysid[0];
table_record_sysid = table_sysid[1];
fieldReference = table_name;
}
}
else
{
log+= '\n for Desktop';
if(g_form.getValue(fieldName))
{
try
{
fieldReference = g_form.getGlideUIElement(fieldName).reference;
}
catch(error_getReferenceAdvance)
{
fieldReference = g_form.getReference(fieldName).tableName;
}
}
else if (fieldName.match(':'))
{
table_sysid = fieldName.split(':');
table_name = table_sysid[0];
table_record_sysid = table_sysid[1];
fieldReference = table_name;
}
}
if (!fieldName)
{
alert("The getReferenceAdvanced() function requires a field to be passed.");
return;
}
if (!fieldList) {
alert("The getReferenceAdvanced() function requires a string of field(s) you wish to return.");
return;
}
log+= '\n fieldName: '+fieldName;
log+= '\n fieldList: '+fieldList;
if (fieldList.toString().indexOf(";") > -1) {
fieldList = fieldList.replace(/;/g, "%3B");
}
var fieldValue = '';
if(fieldName.match(':') && !g_form.getValue(fieldName))
{
table_sysid = fieldName.split(':');
table_name = table_sysid[0];
table_record_sysid = table_sysid[1];
fieldValue = table_record_sysid;
}
else
{
fieldValue = g_form.getValue(fieldName);
if (!fieldValue) {
alert("The getReferenceAdvanced() function requires the field '" + fieldName + "' to have a value.");
return;
}
}
var restEndPoint = "api/snc/getreferenceadvanced/";
restEndPoint = restEndPoint + fieldValue + "/" + fieldReference + "/" + fieldList;
var serverRequest = new XMLHttpRequest();
serverRequest.open("get", restEndPoint, false);
serverRequest.setRequestHeader("X-UserToken", g_ck);
serverRequest.setRequestHeader("Accept", "application/json");
serverRequest.setRequestHeader("Content-Type", "application/json");
serverRequest.send();
if (serverRequest.status === 200)
{
var serverResponse = JSON.parse(serverRequest.response);
if (serverResponse.result == "error")
{
alert("The getReferenceAdvanced encountered an error retrieving the data.");
return;
}
else
{
var refResponse = JSON.parse(serverResponse.result);
return refResponse;
}
}
else
{
log+= '\n FATAL ERROR WITH CONNECTION. Request status: '+serverRequest.status;
log+= '\n controllare se l utente ha i ruoli sca_solution_center, sca_service_manager, u_sca_admin, I&TS_TechnicalCatalog_VisibilityRole';
}
console.log(log);
}
/*! RESOURCE: Google Analytics */
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-77770576-1', 'auto');
ga('send', 'pageview');
/*! RESOURCE: ScrumCloneReleaseTeamDialog */
var ScrumCloneReleaseTeamDialog = Class.create();
ScrumCloneReleaseTeamDialog.prototype = {
initialize: function () {
this.setUpFacade();
},
setUpFacade: function () {
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
this._mstrDlg = new dialogClass("task_window");
this._mstrDlg.setTitle(getMessage("Add Team Members"));
this._mstrDlg.setBody(this.getMarkUp(), false, false);
},
setUpEvents: function () {
var dialog = this._mstrDlg;
var _this = this;
var okButton = $("ok");
if (okButton) {
okButton.on("click", function () {
var mapData = {};
if (_this.fillDataMap (mapData)) {
var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembers2Processor");
for (var strKey in mapData) {
processor.addParam(strKey, mapData[strKey]);
}
_this.showStatus(getMessage("Adding team members..."));
processor.getXML(function () {
_this.refresh();
dialog.destroy();
});
} else {
dialog.destroy();
}
});
}
var cancelButton = $("cancel");
if (cancelButton) {
cancelButton.on("click", function () {
dialog.destroy();
});
}
var okNGButton = $("okNG");
if (okNGButton) {
okNGButton.on("click", function () {
dialog.destroy();
});
}
var cancelNGButton = $("cancelNG");
if (cancelNGButton) {
cancelNGButton.on("click", function () {
dialog.destroy();
});
}
var teamCombo = $("teamId");
if (teamCombo) {
teamCombo.on("change", function (){
_this.updateMembers ();
});
}
},
updateMembers: function () {
var arrMemberInfo = [];
var teamCombo = $("teamId");
if (teamCombo) {
var strTeamSysId = teamCombo.value;
var recTeamMember = new GlideRecord ("scrum_pp_release_team_member");
recTeamMember.addQuery ("team", strTeamSysId);
recTeamMember.query ();
while (recTeamMember.next ()) {
var recSysUser = new GlideRecord ("sys_user");
recSysUser.addQuery ("sys_id", recTeamMember.name);
recSysUser.query ();
var strName = recSysUser.next () ? recSysUser.name : "";
var strPoints = recTeamMember.default_sprint_points + "";
arrMemberInfo.push ({name: strName, points: strPoints});
}
}
if (arrMemberInfo.length > 0) {
var strHtml = "<tr><th style='text-align: left; white-space: nowrap'>" +
"Member</th><th style='text-align: left; white-space: nowrap'>Sprint Points</th><tr>";
for (var nSlot = 0; nSlot < arrMemberInfo.length; ++nSlot) {
var strMemberName = arrMemberInfo[nSlot].name + "";
var strMemberPoints = arrMemberInfo[nSlot].points + "";
strHtml += "<tr><td  style='text-align: left; white-space: nowrap'>" + strMemberName +
"</td><td style='text-align: left; white-space: nowrap'>" + strMemberPoints + "</td></tr>";
}
$("memberId").update (strHtml);
} else {
$("memberId").update ("<tr><td style='font-weight: bold'>"+getMessage("No team members")+"</td></tr>");
}
},
refresh: function(){
GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
},
getScrumReleaseTeamSysId: function () {
return g_form.getUniqueValue() + "";
},
getUserChosenTeamSysIds: function () {
return $F('teamId') + "";
},
showStatus: function (strMessage) {
$("task_controls").update(strMessage);
},
display: function(bIsVisible) {
$("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
},
getMarkUp: function () {
var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
groupAjax.addParam('sysparm_name', 'getTeamInfo');
groupAjax.addParam('sysparm_scrum_team_sysid', this.getScrumReleaseTeamSysId());
groupAjax.getXML(this.generateMarkUp.bind(this));
},
generateMarkUp: function(response) {
var mapTeamInfo = {};
var teamData = response.responseXML.getElementsByTagName("team");
var strName, strSysId;
for (var i = 0; i < teamData.length; i++) {
strName = teamData[i].getAttribute("name");
strSysId = teamData[i].getAttribute("sysid");
mapTeamInfo[strName] = {
name: strName,
sysid: strSysId
};
}
var arrTeamNames = [];
for (var strTeamName in mapTeamInfo) {
arrTeamNames.push (strTeamName + "");
}
arrTeamNames.sort ();
var strMarkUp = "";
if (arrTeamNames.length > 0) {
var strTable = "<div class='row'><div class='form-group'><label class='col-sm-3 control-label' for='teamId'>"+getMessage("Team")+"</label><span class='col-sm-9'><select class='form-control' id='teamId'>";
for (var nSlot = 0; nSlot < arrTeamNames.length; ++nSlot) {
strName = arrTeamNames[nSlot];
strSysId = mapTeamInfo [strName].sysid;
strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
}
strTable += "</select></span></div></div>";
var strTable2 = "<div class='row' style='padding-top:10px;'><div id='memberId' class='col-sm-12'></div></div>";
strMarkUp = "<div id='task_controls'>" + strTable + strTable2 +
"<div style='text-align:right;padding-top:20px;'>"+
"<button id='cancel' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>"+
"&nbsp;&nbsp;<button id='ok' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
"</div></div>";
} else {
strMarkUp = "<div id='task_controls'><p>No release teams found</p>" +
"<div style='padding-top:20px;text-align:right;'>"+
"<button id='cancelNG' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>"+
"&nbsp;&nbsp;<button id='okNG' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
"</div></div>";
}
this._mstrDlg.setBody(strMarkUp, false, false);
this.setUpEvents();
this.display(true);
},
fillDataMap: function (mapData) {
var strChosenTeamSysId = this.getUserChosenTeamSysIds ();
if (strChosenTeamSysId) {
mapData.sysparm_name = "createReleaseTeamMembers";
mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId ();
mapData.sysparm_teams = strChosenTeamSysId;
return true;
} else {
return false;
}
}
};
/*! RESOURCE: EvtMgmtPriorityOverride */
function normalizePriority(columnName) {
var regexComma = /,/g;
var index = getIndexByColumn(columnName);
jQuery("tbody.list2_body tr.list_row:not([smart-priority-override])").each(function() {
var row = jQuery(this);
var cell = jQuery(row.find("td:not(.list_decoration_cell)")[index]);
var value = cell.text();
if (!value)
return;
value = value.replace(regexComma, "");
if (isNaN(value))
return;
var priority = parseInt(parseInt(value)/1000);
cell.text(priority);
row.attr("smart-priority-override", "true");
});
}
function getIndexByColumn(name) {
var index = -1;
jQuery("thead th.list_header_cell").each(function(idx){
var curr = jQuery(this);
if (curr.attr('name') === name) {
if (index == -1) {
index = idx;
}
}
});
return index;
}
/*! RESOURCE: x_eneld_ec.gblFilters.0.1.js */
(function (angular) {
angular.module('gbl.filters',[])
.filter('getPercentages', function() {
return function(input, colori, type, descr) {
var output = [];
var arr_temp = input.split('/');
var a = '';
arr_temp.forEach(function(item) {
var arch = {};
arch.archetype = item.split('%')[1];
arch.percentage = item.split('%')[0];
arch.myclasscolor = colori[arch.archetype];
arch.type = type[arch.archetype];
arch.description_type = descr[arch.archetype];
output.push(arch);
});
return output;
};
})
.filter('contains', function() {
return function (array, item) {
return array.indexOf(item) >= 0;
};
})
.filter('makeUppercase', function () {
return function (item) {
return item.toUpperCase();
};
})
.filter('capitalize', function() {
return function(input) {
return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
};
})
.filter('ellipsis', function () {
return function (text, length) {
if (text.length > length) {
return text.substr(0, length) + '...';
}
return text;
};
})
.filter('cut', function () {
return function (value, wordwise, max, tail) {
if (!value) return '';
max = parseInt(max, 10);
if (!max) return value;
if (value.length <= max) return value;
value = value.substr(0, max);
if (wordwise) {
var lastspace = value.lastIndexOf(' ');
if (lastspace !== -1) {
if (value.charAt(lastspace-1) === '.' || value.charAt(lastspace-1) === ',') {
lastspace = lastspace - 1;
}
value = value.substr(0, lastspace);
}
}
return value + (tail || ' …');
};
});
}(angular));
/*! RESOURCE: opEmployeeSeniority.directive.js */
(function(angular){
var app = angular.module('opApp');
app.directive("opEmployeeSeniority", function($timeout){
return {
restrict: 'A',
scope: {
data: '='
},
link: function(scope, element){
var circleData = {
datasets: [{
data: scope.data.values,
backgroundColor: scope.data.colors,
borderWidth:scope.data.borderWidth
}]
};
var circleOptions = {
rotation:scope.data.rotation,
elements: {
arc: {
roundedCornersFor: 0
}
},
tooltips: {
enabled: false
},
cutoutPercentage: scope.data.innerCutout,
hover: {
mode: null
},
responsive: false
};
var config = {
type: 'doughnut',
data: circleData,
options: circleOptions,
plugins: [{
beforeDraw: function(chart, options){
if(scope.data.showDescription) drawText(chart);
},
afterUpdate: function (chart){
drawStartAngle(chart);
},
afterDraw: function (chart){
drawEndAngle(chart);
}
}]
};
$timeout(function(){
var genderChart = new Chart(element[0].getContext("2d"), config);
},1000);
function drawText(chart){
var width = chart.chart.width;
var height = chart.chart.height;
var ctxInfo = chart.chart.ctx;
var ctxTitle = chart.chart.ctx;
var info = scope.data.info;
var title = scope.data.title;
ctxInfo.restore();
ctxInfo.font = scope.data.infoFont;
ctxInfo.fillStyle = scope.data.infoColor || '#000';
ctxInfo.textBaseline = "middle";
var infoX = Math.round((width - ctxInfo.measureText(info).width) / 2);
var infoY = height / 2 + (scope.data.offsetY ? scope.data.offsetY : 0);
ctxInfo.fillText(info, infoX, infoY);
ctxInfo.save();
ctxTitle.restore();
ctxTitle.font = scope.data.titleFont;
ctxTitle.fillStyle = scope.data.titleColor || '#000';
ctxTitle.textBaseline = "middle";
var titleX = Math.round((width - ctxTitle.measureText(title).width) / 2);
var titleY = infoY + (scope.data.distance ? scope.data.distance : 10);
ctxTitle.fillText(title, titleX, titleY);
ctxTitle.save();
}
function drawStartAngle(chart){
if (chart.config.options.elements.arc.roundedCornersFor !== undefined && chart.config.data.datasets[0].data[0] != 0 && chart.config.data.datasets[0].data[1]!= 0) {
var a=chart.config.data.datasets.length -1;
for (var i in chart.config.data.datasets) {
var arc = chart.getDatasetMeta(i).data[chart.config.options.elements.arc.roundedCornersFor];
arc.round = {
x: (chart.chartArea.left + chart.chartArea.right) / 2,
y: (chart.chartArea.top + chart.chartArea.bottom) / 2,
radius: chart.innerRadius + chart.radiusLength / 2 + (a * chart.radiusLength),
thickness: chart.radiusLength / 2 ,
backgroundColor: scope.data.colors[0]
};
a--;
}
}
}
function drawEndAngle(chart){
var point1={},point2={},point3={},point4={};
var angle1,angle2;
if (chart.config.options.elements.arc.roundedCornersFor !== undefined && chart.config.data.datasets[0].data[0] != 0 && chart.config.data.datasets[0].data[1]!= 0) {
var ctx = chart.chart.ctx;
for (var i in chart.config.data.datasets) {
var arc = chart.getDatasetMeta(i).data[chart.config.options.elements.arc.roundedCornersFor];
var startAngle = Math.PI / 2 - arc._view.startAngle;
var endAngle = Math.PI / 2 - arc._view.endAngle;
ctx.save();
ctx.translate(arc.round.x, arc.round.y);
ctx.fillStyle = arc.round.backgroundColor;
ctx.beginPath();
angle1= startAngle - Math.PI / 2 + Math.atan(arc.round.thickness/arc.round.radius);
angle2=arc._view.startAngle + Math.atan(arc.round.thickness/arc.round.radius);
point1.x=Math.sqrt(Math.pow(arc.round.radius,2)+Math.pow(arc.round.thickness,2))*Math.cos(angle1);
point1.y= - Math.sqrt(Math.pow(arc.round.radius,2)+Math.pow(arc.round.thickness,2))*Math.sin(angle1);
point2.x=(arc.round.radius-arc.round.thickness)*Math.sin(startAngle);
point2.y=(arc.round.radius-arc.round.thickness)*(Math.cos(startAngle));
point3.x=Math.sqrt(Math.pow(arc.round.radius,2)+Math.pow(arc.round.thickness,2))*Math.cos(angle2);
point3.y=Math.sqrt(Math.pow(arc.round.radius,2)+Math.pow(arc.round.thickness,2))*Math.sin(angle2);
point4.x=(arc.round.radius+arc.round.thickness)*Math.sin(startAngle);
point4.y=(arc.round.radius+arc.round.thickness)*Math.cos(startAngle);
ctx.moveTo(point1.x,point1.y);
ctx.lineTo(point2.x,point2.y);
ctx.lineTo(point3.x,point3.y);
ctx.lineTo(point4.x,point4.y);
ctx.closePath();
ctx.fill();
ctx.fillStyle = scope.data.colors[1];
ctx.beginPath();
angle1= endAngle - Math.PI / 2 + Math.atan(arc.round.thickness/arc.round.radius);
angle2=arc._view.endAngle +  Math.atan(arc.round.thickness/arc.round.radius);
point1.x=Math.sqrt(Math.pow(arc.round.radius,2)+Math.pow(arc.round.thickness,2))*Math.cos(angle1);
point1.y= - Math.sqrt(Math.pow(arc.round.radius,2)+Math.pow(arc.round.thickness,2))*Math.sin(angle1);
point2.x=(arc.round.radius-arc.round.thickness)*Math.sin(endAngle);
point2.y=(arc.round.radius-arc.round.thickness)*(Math.cos(endAngle));
point3.x=Math.sqrt(Math.pow(arc.round.radius,2)+Math.pow(arc.round.thickness,2))*Math.cos(angle2);
point3.y=Math.sqrt(Math.pow(arc.round.radius,2)+Math.pow(arc.round.thickness,2))*Math.sin(angle2);
point4.x=(arc.round.radius+arc.round.thickness)*Math.sin(endAngle);
point4.y=(arc.round.radius+arc.round.thickness)*Math.cos(endAngle);
ctx.moveTo(point1.x,point1.y);
ctx.lineTo(point2.x,point2.y);
ctx.lineTo(point3.x,point3.y);
ctx.lineTo(point4.x,point4.y);
ctx.closePath();
ctx.fill();
ctx.restore();
}
}
}
}
};
});
})(window.angular);
/*! RESOURCE: PmPreDatedTaskHandler */
var PmPreDatedTaskHandler = Class.create();
PmPreDatedTaskHandler.prototype = {
initialize: function() {
},
showConfirmDialogIfRequired: function(tableName, taskId, newTaskStartDate, doConfirm, doCancel) {
var ga = new GlideAjax('AjaxProjectTaskUtil') ;
ga.addParam('sysparm_name', 'isTaskPredated');
ga.addParam('task_id', taskId);
ga.addParam('table_name', tableName);
ga.addParam('task_start_date', newTaskStartDate);
ga.getXMLWait();
var isPredated = parseFloat(ga.getAnswer()) < 0;
if( isPredated)
this.showConfirmDialog(doConfirm, doCancel);
else
doConfirm();
},
showConfirmDialog: function(doConfirm, doCancel) {
var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
var dialog = new dialogClass('glide_confirm_standard');
dialog.setTitle(getMessage('Move date'));
dialog.setPreference('warning', true);
dialog.setPreference('title', getMessage("Project start date will be moved prior to existing start date. Do you want to proceed?"));
dialog.setPreference('onPromptComplete', doConfirm);
dialog.setPreference('onPromptCancel', doCancel);
dialog.on('closeconfirm', doCancel);
dialog.render();
}
};
/*! RESOURCE: qrcode.js */
var QRCode;
(function () {
function QR8bitByte(data) {
this.mode = QRMode.MODE_8BIT_BYTE;
this.data = data;
this.parsedData = [];
for (var i = 0, l = this.data.length; i < l; i++) {
var byteArray = [];
var code = this.data.charCodeAt(i);
if (code > 0x10000) {
byteArray[0] = 0xF0 | ((code & 0x1C0000) >>> 18);
byteArray[1] = 0x80 | ((code & 0x3F000) >>> 12);
byteArray[2] = 0x80 | ((code & 0xFC0) >>> 6);
byteArray[3] = 0x80 | (code & 0x3F);
} else if (code > 0x800) {
byteArray[0] = 0xE0 | ((code & 0xF000) >>> 12);
byteArray[1] = 0x80 | ((code & 0xFC0) >>> 6);
byteArray[2] = 0x80 | (code & 0x3F);
} else if (code > 0x80) {
byteArray[0] = 0xC0 | ((code & 0x7C0) >>> 6);
byteArray[1] = 0x80 | (code & 0x3F);
} else {
byteArray[0] = code;
}
this.parsedData.push(byteArray);
}
this.parsedData = Array.prototype.concat.apply([], this.parsedData);
if (this.parsedData.length != this.data.length) {
this.parsedData.unshift(191);
this.parsedData.unshift(187);
this.parsedData.unshift(239);
}
}
QR8bitByte.prototype = {
getLength: function (buffer) {
return this.parsedData.length;
},
write: function (buffer) {
for (var i = 0, l = this.parsedData.length; i < l; i++) {
buffer.put(this.parsedData[i], 8);
}
}
};
function QRCodeModel(typeNumber, errorCorrectLevel) {
this.typeNumber = typeNumber;
this.errorCorrectLevel = errorCorrectLevel;
this.modules = null;
this.moduleCount = 0;
this.dataCache = null;
this.dataList = [];
}
QRCodeModel.prototype={addData:function(data){var newData=new QR8bitByte(data);this.dataList.push(newData);this.dataCache=null;},isDark:function(row,col){if(row<0||this.moduleCount<=row||col<0||this.moduleCount<=col){throw new Error(row+","+col);}
return this.modules[row][col];},getModuleCount:function(){return this.moduleCount;},make:function(){this.makeImpl(false,this.getBestMaskPattern());},makeImpl:function(test,maskPattern){this.moduleCount=this.typeNumber*4+17;this.modules=new Array(this.moduleCount);for(var row=0;row<this.moduleCount;row++){this.modules[row]=new Array(this.moduleCount);for(var col=0;col<this.moduleCount;col++){this.modules[row][col]=null;}}
this.setupPositionProbePattern(0,0);this.setupPositionProbePattern(this.moduleCount-7,0);this.setupPositionProbePattern(0,this.moduleCount-7);this.setupPositionAdjustPattern();this.setupTimingPattern();this.setupTypeInfo(test,maskPattern);if(this.typeNumber>=7){this.setupTypeNumber(test);}
if(this.dataCache==null){this.dataCache=QRCodeModel.createData(this.typeNumber,this.errorCorrectLevel,this.dataList);}
this.mapData(this.dataCache,maskPattern);},setupPositionProbePattern:function(row,col){for(var r=-1;r<=7;r++){if(row+r<=-1||this.moduleCount<=row+r)continue;for(var c=-1;c<=7;c++){if(col+c<=-1||this.moduleCount<=col+c)continue;if((0<=r&&r<=6&&(c==0||c==6))||(0<=c&&c<=6&&(r==0||r==6))||(2<=r&&r<=4&&2<=c&&c<=4)){this.modules[row+r][col+c]=true;}else{this.modules[row+r][col+c]=false;}}}},getBestMaskPattern:function(){var minLostPoint=0;var pattern=0;for(var i=0;i<8;i++){this.makeImpl(true,i);var lostPoint=QRUtil.getLostPoint(this);if(i==0||minLostPoint>lostPoint){minLostPoint=lostPoint;pattern=i;}}
return pattern;},createMovieClip:function(target_mc,instance_name,depth){var qr_mc=target_mc.createEmptyMovieClip(instance_name,depth);var cs=1;this.make();for(var row=0;row<this.modules.length;row++){var y=row*cs;for(var col=0;col<this.modules[row].length;col++){var x=col*cs;var dark=this.modules[row][col];if(dark){qr_mc.beginFill(0,100);qr_mc.moveTo(x,y);qr_mc.lineTo(x+cs,y);qr_mc.lineTo(x+cs,y+cs);qr_mc.lineTo(x,y+cs);qr_mc.endFill();}}}
return qr_mc;},setupTimingPattern:function(){for(var r=8;r<this.moduleCount-8;r++){if(this.modules[r][6]!=null){continue;}
this.modules[r][6]=(r%2==0);}
for(var c=8;c<this.moduleCount-8;c++){if(this.modules[6][c]!=null){continue;}
this.modules[6][c]=(c%2==0);}},setupPositionAdjustPattern:function(){var pos=QRUtil.getPatternPosition(this.typeNumber);for(var i=0;i<pos.length;i++){for(var j=0;j<pos.length;j++){var row=pos[i];var col=pos[j];if(this.modules[row][col]!=null){continue;}
for(var r=-2;r<=2;r++){for(var c=-2;c<=2;c++){if(r==-2||r==2||c==-2||c==2||(r==0&&c==0)){this.modules[row+r][col+c]=true;}else{this.modules[row+r][col+c]=false;}}}}}},setupTypeNumber:function(test){var bits=QRUtil.getBCHTypeNumber(this.typeNumber);for(var i=0;i<18;i++){var mod=(!test&&((bits>>i)&1)==1);this.modules[Math.floor(i/3)][i%3+this.moduleCount-8-3]=mod;}
for(var i=0;i<18;i++){var mod=(!test&&((bits>>i)&1)==1);this.modules[i%3+this.moduleCount-8-3][Math.floor(i/3)]=mod;}},setupTypeInfo:function(test,maskPattern){var data=(this.errorCorrectLevel<<3)|maskPattern;var bits=QRUtil.getBCHTypeInfo(data);for(var i=0;i<15;i++){var mod=(!test&&((bits>>i)&1)==1);if(i<6){this.modules[i][8]=mod;}else if(i<8){this.modules[i+1][8]=mod;}else{this.modules[this.moduleCount-15+i][8]=mod;}}
for(var i=0;i<15;i++){var mod=(!test&&((bits>>i)&1)==1);if(i<8){this.modules[8][this.moduleCount-i-1]=mod;}else if(i<9){this.modules[8][15-i-1+1]=mod;}else{this.modules[8][15-i-1]=mod;}}
this.modules[this.moduleCount-8][8]=(!test);},mapData:function(data,maskPattern){var inc=-1;var row=this.moduleCount-1;var bitIndex=7;var byteIndex=0;for(var col=this.moduleCount-1;col>0;col-=2){if(col==6)col--;while(true){for(var c=0;c<2;c++){if(this.modules[row][col-c]==null){var dark=false;if(byteIndex<data.length){dark=(((data[byteIndex]>>>bitIndex)&1)==1);}
var mask=QRUtil.getMask(maskPattern,row,col-c);if(mask){dark=!dark;}
this.modules[row][col-c]=dark;bitIndex--;if(bitIndex==-1){byteIndex++;bitIndex=7;}}}
row+=inc;if(row<0||this.moduleCount<=row){row-=inc;inc=-inc;break;}}}}};QRCodeModel.PAD0=0xEC;QRCodeModel.PAD1=0x11;QRCodeModel.createData=function(typeNumber,errorCorrectLevel,dataList){var rsBlocks=QRRSBlock.getRSBlocks(typeNumber,errorCorrectLevel);var buffer=new QRBitBuffer();for(var i=0;i<dataList.length;i++){var data=dataList[i];buffer.put(data.mode,4);buffer.put(data.getLength(),QRUtil.getLengthInBits(data.mode,typeNumber));data.write(buffer);}
var totalDataCount=0;for(var i=0;i<rsBlocks.length;i++){totalDataCount+=rsBlocks[i].dataCount;}
if(buffer.getLengthInBits()>totalDataCount*8){throw new Error("code length overflow. ("
+buffer.getLengthInBits()
+">"
+totalDataCount*8
+")");}
if(buffer.getLengthInBits()+4<=totalDataCount*8){buffer.put(0,4);}
while(buffer.getLengthInBits()%8!=0){buffer.putBit(false);}
while(true){if(buffer.getLengthInBits()>=totalDataCount*8){break;}
buffer.put(QRCodeModel.PAD0,8);if(buffer.getLengthInBits()>=totalDataCount*8){break;}
buffer.put(QRCodeModel.PAD1,8);}
return QRCodeModel.createBytes(buffer,rsBlocks);};QRCodeModel.createBytes=function(buffer,rsBlocks){var offset=0;var maxDcCount=0;var maxEcCount=0;var dcdata=new Array(rsBlocks.length);var ecdata=new Array(rsBlocks.length);for(var r=0;r<rsBlocks.length;r++){var dcCount=rsBlocks[r].dataCount;var ecCount=rsBlocks[r].totalCount-dcCount;maxDcCount=Math.max(maxDcCount,dcCount);maxEcCount=Math.max(maxEcCount,ecCount);dcdata[r]=new Array(dcCount);for(var i=0;i<dcdata[r].length;i++){dcdata[r][i]=0xff&buffer.buffer[i+offset];}
offset+=dcCount;var rsPoly=QRUtil.getErrorCorrectPolynomial(ecCount);var rawPoly=new QRPolynomial(dcdata[r],rsPoly.getLength()-1);var modPoly=rawPoly.mod(rsPoly);ecdata[r]=new Array(rsPoly.getLength()-1);for(var i=0;i<ecdata[r].length;i++){var modIndex=i+modPoly.getLength()-ecdata[r].length;ecdata[r][i]=(modIndex>=0)?modPoly.get(modIndex):0;}}
var totalCodeCount=0;for(var i=0;i<rsBlocks.length;i++){totalCodeCount+=rsBlocks[i].totalCount;}
var data=new Array(totalCodeCount);var index=0;for(var i=0;i<maxDcCount;i++){for(var r=0;r<rsBlocks.length;r++){if(i<dcdata[r].length){data[index++]=dcdata[r][i];}}}
for(var i=0;i<maxEcCount;i++){for(var r=0;r<rsBlocks.length;r++){if(i<ecdata[r].length){data[index++]=ecdata[r][i];}}}
return data;};var QRMode={MODE_NUMBER:1<<0,MODE_ALPHA_NUM:1<<1,MODE_8BIT_BYTE:1<<2,MODE_KANJI:1<<3};var QRErrorCorrectLevel={L:1,M:0,Q:3,H:2};var QRMaskPattern={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};var QRUtil={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:(1<<10)|(1<<8)|(1<<5)|(1<<4)|(1<<2)|(1<<1)|(1<<0),G18:(1<<12)|(1<<11)|(1<<10)|(1<<9)|(1<<8)|(1<<5)|(1<<2)|(1<<0),G15_MASK:(1<<14)|(1<<12)|(1<<10)|(1<<4)|(1<<1),getBCHTypeInfo:function(data){var d=data<<10;while(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G15)>=0){d^=(QRUtil.G15<<(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G15)));}
return((data<<10)|d)^QRUtil.G15_MASK;},getBCHTypeNumber:function(data){var d=data<<12;while(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G18)>=0){d^=(QRUtil.G18<<(QRUtil.getBCHDigit(d)-QRUtil.getBCHDigit(QRUtil.G18)));}
return(data<<12)|d;},getBCHDigit:function(data){var digit=0;while(data!=0){digit++;data>>>=1;}
return digit;},getPatternPosition:function(typeNumber){return QRUtil.PATTERN_POSITION_TABLE[typeNumber-1];},getMask:function(maskPattern,i,j){switch(maskPattern){case QRMaskPattern.PATTERN000:return(i+j)%2==0;case QRMaskPattern.PATTERN001:return i%2==0;case QRMaskPattern.PATTERN010:return j%3==0;case QRMaskPattern.PATTERN011:return(i+j)%3==0;case QRMaskPattern.PATTERN100:return(Math.floor(i/2)+Math.floor(j/3))%2==0;case QRMaskPattern.PATTERN101:return(i*j)%2+(i*j)%3==0;case QRMaskPattern.PATTERN110:return((i*j)%2+(i*j)%3)%2==0;case QRMaskPattern.PATTERN111:return((i*j)%3+(i+j)%2)%2==0;default:throw new Error("bad maskPattern:"+maskPattern);}},getErrorCorrectPolynomial:function(errorCorrectLength){var a=new QRPolynomial([1],0);for(var i=0;i<errorCorrectLength;i++){a=a.multiply(new QRPolynomial([1,QRMath.gexp(i)],0));}
return a;},getLengthInBits:function(mode,type){if(1<=type&&type<10){switch(mode){case QRMode.MODE_NUMBER:return 10;case QRMode.MODE_ALPHA_NUM:return 9;case QRMode.MODE_8BIT_BYTE:return 8;case QRMode.MODE_KANJI:return 8;default:throw new Error("mode:"+mode);}}else if(type<27){switch(mode){case QRMode.MODE_NUMBER:return 12;case QRMode.MODE_ALPHA_NUM:return 11;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 10;default:throw new Error("mode:"+mode);}}else if(type<41){switch(mode){case QRMode.MODE_NUMBER:return 14;case QRMode.MODE_ALPHA_NUM:return 13;case QRMode.MODE_8BIT_BYTE:return 16;case QRMode.MODE_KANJI:return 12;default:throw new Error("mode:"+mode);}}else{throw new Error("type:"+type);}},getLostPoint:function(qrCode){var moduleCount=qrCode.getModuleCount();var lostPoint=0;for(var row=0;row<moduleCount;row++){for(var col=0;col<moduleCount;col++){var sameCount=0;var dark=qrCode.isDark(row,col);for(var r=-1;r<=1;r++){if(row+r<0||moduleCount<=row+r){continue;}
for(var c=-1;c<=1;c++){if(col+c<0||moduleCount<=col+c){continue;}
if(r==0&&c==0){continue;}
if(dark==qrCode.isDark(row+r,col+c)){sameCount++;}}}
if(sameCount>5){lostPoint+=(3+sameCount-5);}}}
for(var row=0;row<moduleCount-1;row++){for(var col=0;col<moduleCount-1;col++){var count=0;if(qrCode.isDark(row,col))count++;if(qrCode.isDark(row+1,col))count++;if(qrCode.isDark(row,col+1))count++;if(qrCode.isDark(row+1,col+1))count++;if(count==0||count==4){lostPoint+=3;}}}
for(var row=0;row<moduleCount;row++){for(var col=0;col<moduleCount-6;col++){if(qrCode.isDark(row,col)&&!qrCode.isDark(row,col+1)&&qrCode.isDark(row,col+2)&&qrCode.isDark(row,col+3)&&qrCode.isDark(row,col+4)&&!qrCode.isDark(row,col+5)&&qrCode.isDark(row,col+6)){lostPoint+=40;}}}
for(var col=0;col<moduleCount;col++){for(var row=0;row<moduleCount-6;row++){if(qrCode.isDark(row,col)&&!qrCode.isDark(row+1,col)&&qrCode.isDark(row+2,col)&&qrCode.isDark(row+3,col)&&qrCode.isDark(row+4,col)&&!qrCode.isDark(row+5,col)&&qrCode.isDark(row+6,col)){lostPoint+=40;}}}
var darkCount=0;for(var col=0;col<moduleCount;col++){for(var row=0;row<moduleCount;row++){if(qrCode.isDark(row,col)){darkCount++;}}}
var ratio=Math.abs(100*darkCount/moduleCount/moduleCount-50)/5;lostPoint+=ratio*10;return lostPoint;}};var QRMath={glog:function(n){if(n<1){throw new Error("glog("+n+")");}
return QRMath.LOG_TABLE[n];},gexp:function(n){while(n<0){n+=255;}
while(n>=256){n-=255;}
return QRMath.EXP_TABLE[n];},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)};for(var i=0;i<8;i++){QRMath.EXP_TABLE[i]=1<<i;}
for(var i=8;i<256;i++){QRMath.EXP_TABLE[i]=QRMath.EXP_TABLE[i-4]^QRMath.EXP_TABLE[i-5]^QRMath.EXP_TABLE[i-6]^QRMath.EXP_TABLE[i-8];}
for(var i=0;i<255;i++){QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]]=i;}
function QRPolynomial(num,shift){if(num.length==undefined){throw new Error(num.length+"/"+shift);}
var offset=0;while(offset<num.length&&num[offset]==0){offset++;}
this.num=new Array(num.length-offset+shift);for(var i=0;i<num.length-offset;i++){this.num[i]=num[i+offset];}}
QRPolynomial.prototype={get:function(index){return this.num[index];},getLength:function(){return this.num.length;},multiply:function(e){var num=new Array(this.getLength()+e.getLength()-1);for(var i=0;i<this.getLength();i++){for(var j=0;j<e.getLength();j++){num[i+j]^=QRMath.gexp(QRMath.glog(this.get(i))+QRMath.glog(e.get(j)));}}
return new QRPolynomial(num,0);},mod:function(e){if(this.getLength()-e.getLength()<0){return this;}
var ratio=QRMath.glog(this.get(0))-QRMath.glog(e.get(0));var num=new Array(this.getLength());for(var i=0;i<this.getLength();i++){num[i]=this.get(i);}
for(var i=0;i<e.getLength();i++){num[i]^=QRMath.gexp(QRMath.glog(e.get(i))+ratio);}
return new QRPolynomial(num,0).mod(e);}};function QRRSBlock(totalCount,dataCount){this.totalCount=totalCount;this.dataCount=dataCount;}
QRRSBlock.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]];QRRSBlock.getRSBlocks=function(typeNumber,errorCorrectLevel){var rsBlock=QRRSBlock.getRsBlockTable(typeNumber,errorCorrectLevel);if(rsBlock==undefined){throw new Error("bad rs block @ typeNumber:"+typeNumber+"/errorCorrectLevel:"+errorCorrectLevel);}
var length=rsBlock.length/3;var list=[];for(var i=0;i<length;i++){var count=rsBlock[i*3+0];var totalCount=rsBlock[i*3+1];var dataCount=rsBlock[i*3+2];for(var j=0;j<count;j++){list.push(new QRRSBlock(totalCount,dataCount));}}
return list;};QRRSBlock.getRsBlockTable=function(typeNumber,errorCorrectLevel){switch(errorCorrectLevel){case QRErrorCorrectLevel.L:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+0];case QRErrorCorrectLevel.M:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+1];case QRErrorCorrectLevel.Q:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+2];case QRErrorCorrectLevel.H:return QRRSBlock.RS_BLOCK_TABLE[(typeNumber-1)*4+3];default:return undefined;}};function QRBitBuffer(){this.buffer=[];this.length=0;}
QRBitBuffer.prototype={get:function(index){var bufIndex=Math.floor(index/8);return((this.buffer[bufIndex]>>>(7-index%8))&1)==1;},put:function(num,length){for(var i=0;i<length;i++){this.putBit(((num>>>(length-i-1))&1)==1);}},getLengthInBits:function(){return this.length;},putBit:function(bit){var bufIndex=Math.floor(this.length/8);if(this.buffer.length<=bufIndex){this.buffer.push(0);}
if(bit){this.buffer[bufIndex]|=(0x80>>>(this.length%8));}
this.length++;}};var QRCodeLimitLength=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]];
function _isSupportCanvas() {
return typeof CanvasRenderingContext2D != "undefined";
}
function _getAndroid() {
var android = false;
var sAgent = navigator.userAgent;
if (/android/i.test(sAgent)) {
android = true;
var aMat = sAgent.toString().match(/android ([0-9]\.[0-9])/i);
if (aMat && aMat[1]) {
android = parseFloat(aMat[1]);
}
}
return android;
}
var svgDrawer = (function() {
var Drawing = function (el, htOption) {
this._el = el;
this._htOption = htOption;
};
Drawing.prototype.draw = function (oQRCode) {
var _htOption = this._htOption;
var _el = this._el;
var nCount = oQRCode.getModuleCount();
var nWidth = Math.floor(_htOption.width / nCount);
var nHeight = Math.floor(_htOption.height / nCount);
this.clear();
function makeSVG(tag, attrs) {
var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
for (var k in attrs)
if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
return el;
}
var svg = makeSVG("svg" , {'viewBox': '0 0 ' + String(nCount) + " " + String(nCount), 'width': '100%', 'height': '100%', 'fill': _htOption.colorLight});
svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
_el.appendChild(svg);
svg.appendChild(makeSVG("rect", {"fill": _htOption.colorLight, "width": "100%", "height": "100%"}));
svg.appendChild(makeSVG("rect", {"fill": _htOption.colorDark, "width": "1", "height": "1", "id": "template"}));
for (var row = 0; row < nCount; row++) {
for (var col = 0; col < nCount; col++) {
if (oQRCode.isDark(row, col)) {
var child = makeSVG("use", {"x": String(col), "y": String(row)});
child.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#template")
svg.appendChild(child);
}
}
}
};
Drawing.prototype.clear = function () {
while (this._el.hasChildNodes())
this._el.removeChild(this._el.lastChild);
};
return Drawing;
})();
var useSVG = document.documentElement.tagName.toLowerCase() === "svg";
var Drawing = useSVG ? svgDrawer : !_isSupportCanvas() ? (function () {
var Drawing = function (el, htOption) {
this._el = el;
this._htOption = htOption;
};
Drawing.prototype.draw = function (oQRCode) {
var _htOption = this._htOption;
var _el = this._el;
var nCount = oQRCode.getModuleCount();
var nWidth = Math.floor(_htOption.width / nCount);
var nHeight = Math.floor(_htOption.height / nCount);
var aHTML = ['<table style="border:0;border-collapse:collapse;">'];
for (var row = 0; row < nCount; row++) {
aHTML.push('<tr>');
for (var col = 0; col < nCount; col++) {
aHTML.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' + nWidth + 'px;height:' + nHeight + 'px;background-color:' + (oQRCode.isDark(row, col) ? _htOption.colorDark : _htOption.colorLight) + ';"></td>');
}
aHTML.push('</tr>');
}
aHTML.push('</table>');
_el.innerHTML = aHTML.join('');
var elTable = _el.childNodes[0];
var nLeftMarginTable = (_htOption.width - elTable.offsetWidth) / 2;
var nTopMarginTable = (_htOption.height - elTable.offsetHeight) / 2;
if (nLeftMarginTable > 0 && nTopMarginTable > 0) {
elTable.style.margin = nTopMarginTable + "px " + nLeftMarginTable + "px";
}
};
Drawing.prototype.clear = function () {
this._el.innerHTML = '';
};
return Drawing;
})() : (function () {
function _onMakeImage() {
this._elImage.src = this._elCanvas.toDataURL("image/png");
this._elImage.style.display = "block";
this._elCanvas.style.display = "none";
}
if (this._android && this._android <= 2.1) {
var factor = 1 / window.devicePixelRatio;
var drawImage = CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
if (("nodeName" in image) && /img/i.test(image.nodeName)) {
for (var i = arguments.length - 1; i >= 1; i--) {
arguments[i] = arguments[i] * factor;
}
} else if (typeof dw == "undefined") {
arguments[1] *= factor;
arguments[2] *= factor;
arguments[3] *= factor;
arguments[4] *= factor;
}
drawImage.apply(this, arguments);
};
}
function _safeSetDataURI(fSuccess, fFail) {
var self = this;
self._fFail = fFail;
self._fSuccess = fSuccess;
if (self._bSupportDataURI === null) {
var el = document.createElement("img");
var fOnError = function() {
self._bSupportDataURI = false;
if (self._fFail) {
self._fFail.call(self);
}
};
var fOnSuccess = function() {
self._bSupportDataURI = true;
if (self._fSuccess) {
self._fSuccess.call(self);
}
};
el.onabort = fOnError;
el.onerror = fOnError;
el.onload = fOnSuccess;
el.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
return;
} else if (self._bSupportDataURI === true && self._fSuccess) {
self._fSuccess.call(self);
} else if (self._bSupportDataURI === false && self._fFail) {
self._fFail.call(self);
}
};
var Drawing = function (el, htOption) {
this._bIsPainted = false;
this._android = _getAndroid();
this._htOption = htOption;
this._elCanvas = document.createElement("canvas");
this._elCanvas.width = htOption.width;
this._elCanvas.height = htOption.height;
el.appendChild(this._elCanvas);
this._el = el;
this._oContext = this._elCanvas.getContext("2d");
this._bIsPainted = false;
this._elImage = document.createElement("img");
this._elImage.alt = "Scan me!";
this._elImage.style.display = "none";
this._el.appendChild(this._elImage);
this._bSupportDataURI = null;
};
Drawing.prototype.draw = function (oQRCode) {
var _elImage = this._elImage;
var _oContext = this._oContext;
var _htOption = this._htOption;
var nCount = oQRCode.getModuleCount();
var nWidth = _htOption.width / nCount;
var nHeight = _htOption.height / nCount;
var nRoundedWidth = Math.round(nWidth);
var nRoundedHeight = Math.round(nHeight);
_elImage.style.display = "none";
this.clear();
for (var row = 0; row < nCount; row++) {
for (var col = 0; col < nCount; col++) {
var bIsDark = oQRCode.isDark(row, col);
var nLeft = col * nWidth;
var nTop = row * nHeight;
_oContext.strokeStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
_oContext.lineWidth = 1;
_oContext.fillStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
_oContext.fillRect(nLeft, nTop, nWidth, nHeight);
_oContext.strokeRect(
Math.floor(nLeft) + 0.5,
Math.floor(nTop) + 0.5,
nRoundedWidth,
nRoundedHeight
);
_oContext.strokeRect(
Math.ceil(nLeft) - 0.5,
Math.ceil(nTop) - 0.5,
nRoundedWidth,
nRoundedHeight
);
}
}
this._bIsPainted = true;
};
Drawing.prototype.makeImage = function () {
if (this._bIsPainted) {
_safeSetDataURI.call(this, _onMakeImage);
}
};
Drawing.prototype.isPainted = function () {
return this._bIsPainted;
};
Drawing.prototype.clear = function () {
this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height);
this._bIsPainted = false;
};
Drawing.prototype.round = function (nNumber) {
if (!nNumber) {
return nNumber;
}
return Math.floor(nNumber * 1000) / 1000;
};
return Drawing;
})();
function _getTypeNumber(sText, nCorrectLevel) {
var nType = 1;
var length = _getUTF8Length(sText);
for (var i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
var nLimit = 0;
switch (nCorrectLevel) {
case QRErrorCorrectLevel.L :
nLimit = QRCodeLimitLength[i][0];
break;
case QRErrorCorrectLevel.M :
nLimit = QRCodeLimitLength[i][1];
break;
case QRErrorCorrectLevel.Q :
nLimit = QRCodeLimitLength[i][2];
break;
case QRErrorCorrectLevel.H :
nLimit = QRCodeLimitLength[i][3];
break;
}
if (length <= nLimit) {
break;
} else {
nType++;
}
}
if (nType > QRCodeLimitLength.length) {
throw new Error("Too long data");
}
return nType;
}
function _getUTF8Length(sText) {
var replacedText = encodeURI(sText).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
return replacedText.length + (replacedText.length != sText ? 3 : 0);
}
QRCode = function (el, vOption) {
this._htOption = {
width : 256,
height : 256,
typeNumber : 4,
colorDark : "#000000",
colorLight : "#ffffff",
correctLevel : QRErrorCorrectLevel.H
};
if (typeof vOption === 'string') {
vOption	= {
text : vOption
};
}
if (vOption) {
for (var i in vOption) {
this._htOption[i] = vOption[i];
}
}
if (typeof el == "string") {
el = document.getElementById(el);
}
if (this._htOption.useSVG) {
Drawing = svgDrawer;
}
this._android = _getAndroid();
this._el = el;
this._oQRCode = null;
this._oDrawing = new Drawing(this._el, this._htOption);
if (this._htOption.text) {
this.makeCode(this._htOption.text);
}
};
QRCode.prototype.makeCode = function (sText) {
this._oQRCode = new QRCodeModel(_getTypeNumber(sText, this._htOption.correctLevel), this._htOption.correctLevel);
this._oQRCode.addData(sText);
this._oQRCode.make();
this._el.title = sText;
this._oDrawing.draw(this._oQRCode);
this.makeImage();
};
QRCode.prototype.makeImage = function () {
if (typeof this._oDrawing.makeImage == "function" && (!this._android || this._android >= 3)) {
this._oDrawing.makeImage();
}
};
QRCode.prototype.clear = function () {
this._oDrawing.clear();
};
QRCode.CorrectLevel = QRErrorCorrectLevel;
})();
/*! RESOURCE: c3.js */
(function (window) {
'use strict';
var c3 = { version: "0.4.11-rc4" };
var c3_chart_fn,
c3_chart_internal_fn,
c3_chart_internal_axis_fn;
function API(owner) {
this.owner = owner;
}
function inherit(base, derived) {
if (Object.create) {
derived.prototype = Object.create(base.prototype);
} else {
var f = function f() {};
f.prototype = base.prototype;
derived.prototype = new f();
}
derived.prototype.constructor = derived;
return derived;
}
function Chart(config) {
var $$ = this.internal = new ChartInternal(this);
$$.loadConfig(config);
$$.beforeInit(config);
$$.init();
$$.afterInit(config);
(function bindThis(fn, target, argThis) {
Object.keys(fn).forEach(function (key) {
target[key] = fn[key].bind(argThis);
if (Object.keys(fn[key]).length > 0) {
bindThis(fn[key], target[key], argThis);
}
});
})(c3_chart_fn, this, this);
}
function ChartInternal(api) {
var $$ = this;
$$.d3 = window.d3 ? window.d3 : typeof require !== 'undefined' ? require("d3") : undefined;
$$.api = api;
$$.config = $$.getDefaultConfig();
$$.data = {};
$$.cache = {};
$$.axes = {};
}
c3.generate = function (config) {
return new Chart(config);
};
c3.chart = {
fn: Chart.prototype,
internal: {
fn: ChartInternal.prototype,
axis: {
fn: Axis.prototype
}
}
};
c3_chart_fn = c3.chart.fn;
c3_chart_internal_fn = c3.chart.internal.fn;
c3_chart_internal_axis_fn = c3.chart.internal.axis.fn;
c3_chart_internal_fn.beforeInit = function () {
};
c3_chart_internal_fn.afterInit = function () {
};
c3_chart_internal_fn.init = function () {
var $$ = this, config = $$.config;
$$.initParams();
if (config.data_url) {
$$.convertUrlToData(config.data_url, config.data_mimeType, config.data_keys, $$.initWithData);
}
else if (config.data_json) {
$$.initWithData($$.convertJsonToData(config.data_json, config.data_keys));
}
else if (config.data_rows) {
$$.initWithData($$.convertRowsToData(config.data_rows));
}
else if (config.data_columns) {
$$.initWithData($$.convertColumnsToData(config.data_columns));
}
else {
throw Error('url or json or rows or columns is required.');
}
};
c3_chart_internal_fn.initParams = function () {
var $$ = this, d3 = $$.d3, config = $$.config;
$$.clipId = "c3-" + (+new Date()) + '-clip',
$$.clipIdForXAxis = $$.clipId + '-xaxis',
$$.clipIdForYAxis = $$.clipId + '-yaxis',
$$.clipIdForGrid = $$.clipId + '-grid',
$$.clipIdForSubchart = $$.clipId + '-subchart',
$$.clipPath = $$.getClipPath($$.clipId),
$$.clipPathForXAxis = $$.getClipPath($$.clipIdForXAxis),
$$.clipPathForYAxis = $$.getClipPath($$.clipIdForYAxis);
$$.clipPathForGrid = $$.getClipPath($$.clipIdForGrid),
$$.clipPathForSubchart = $$.getClipPath($$.clipIdForSubchart),
$$.dragStart = null;
$$.dragging = false;
$$.flowing = false;
$$.cancelClick = false;
$$.mouseover = false;
$$.transiting = false;
$$.color = $$.generateColor();
$$.levelColor = $$.generateLevelColor();
$$.dataTimeFormat = config.data_xLocaltime ? d3.time.format : d3.time.format.utc;
$$.axisTimeFormat = config.axis_x_localtime ? d3.time.format : d3.time.format.utc;
$$.defaultAxisTimeFormat = $$.axisTimeFormat.multi([
[".%L", function (d) { return d.getMilliseconds(); }],
[":%S", function (d) { return d.getSeconds(); }],
["%I:%M", function (d) { return d.getMinutes(); }],
["%I %p", function (d) { return d.getHours(); }],
["%-m/%-d", function (d) { return d.getDay() && d.getDate() !== 1; }],
["%-m/%-d", function (d) { return d.getDate() !== 1; }],
["%-m/%-d", function (d) { return d.getMonth(); }],
["%Y/%-m/%-d", function () { return true; }]
]);
$$.hiddenTargetIds = [];
$$.hiddenLegendIds = [];
$$.focusedTargetIds = [];
$$.defocusedTargetIds = [];
$$.xOrient = config.axis_rotated ? "left" : "bottom";
$$.yOrient = config.axis_rotated ? (config.axis_y_inner ? "top" : "bottom") : (config.axis_y_inner ? "right" : "left");
$$.y2Orient = config.axis_rotated ? (config.axis_y2_inner ? "bottom" : "top") : (config.axis_y2_inner ? "left" : "right");
$$.subXOrient = config.axis_rotated ? "left" : "bottom";
$$.isLegendRight = config.legend_position === 'right';
$$.isLegendInset = config.legend_position === 'inset';
$$.isLegendTop = config.legend_inset_anchor === 'top-left' || config.legend_inset_anchor === 'top-right';
$$.isLegendLeft = config.legend_inset_anchor === 'top-left' || config.legend_inset_anchor === 'bottom-left';
$$.legendStep = 0;
$$.legendItemWidth = 0;
$$.legendItemHeight = 0;
$$.currentMaxTickWidths = {
x: 0,
y: 0,
y2: 0
};
$$.rotated_padding_left = 30;
$$.rotated_padding_right = config.axis_rotated && !config.axis_x_show ? 0 : 30;
$$.rotated_padding_top = 5;
$$.withoutFadeIn = {};
$$.intervalForObserveInserted = undefined;
$$.axes.subx = d3.selectAll([]);
};
c3_chart_internal_fn.initChartElements = function () {
if (this.initBar) { this.initBar(); }
if (this.initLine) { this.initLine(); }
if (this.initArc) { this.initArc(); }
if (this.initGauge) { this.initGauge(); }
if (this.initText) { this.initText(); }
};
c3_chart_internal_fn.initWithData = function (data) {
var $$ = this, d3 = $$.d3, config = $$.config;
var defs, main, binding = true;
$$.axis = new Axis($$);
if ($$.initPie) { $$.initPie(); }
if ($$.initBrush) { $$.initBrush(); }
if ($$.initZoom) { $$.initZoom(); }
if (!config.bindto) {
$$.selectChart = d3.selectAll([]);
}
else if (typeof config.bindto.node === 'function') {
$$.selectChart = config.bindto;
}
else {
$$.selectChart = d3.select(config.bindto);
}
if ($$.selectChart.empty()) {
$$.selectChart = d3.select(document.createElement('div')).style('opacity', 0);
$$.observeInserted($$.selectChart);
binding = false;
}
$$.selectChart.html("").classed("c3", true);
$$.data.xs = {};
$$.data.targets = $$.convertDataToTargets(data);
if (config.data_filter) {
$$.data.targets = $$.data.targets.filter(config.data_filter);
}
if (config.data_hide) {
$$.addHiddenTargetIds(config.data_hide === true ? $$.mapToIds($$.data.targets) : config.data_hide);
}
if (config.legend_hide) {
$$.addHiddenLegendIds(config.legend_hide === true ? $$.mapToIds($$.data.targets) : config.legend_hide);
}
if ($$.hasType('gauge')) {
config.legend_show = false;
}
$$.updateSizes();
$$.updateScales();
$$.x.domain(d3.extent($$.getXDomain($$.data.targets)));
$$.y.domain($$.getYDomain($$.data.targets, 'y'));
$$.y2.domain($$.getYDomain($$.data.targets, 'y2'));
$$.subX.domain($$.x.domain());
$$.subY.domain($$.y.domain());
$$.subY2.domain($$.y2.domain());
$$.orgXDomain = $$.x.domain();
if ($$.brush) { $$.brush.scale($$.subX); }
if (config.zoom_enabled) { $$.zoom.scale($$.x); }
$$.svg = $$.selectChart.append("svg")
.style("overflow", "hidden")
.on('mouseenter', function () { return config.onmouseover.call($$); })
.on('mouseleave', function () { return config.onmouseout.call($$); });
if ($$.config.svg_classname) {
$$.svg.attr('class', $$.config.svg_classname);
}
defs = $$.svg.append("defs");
$$.clipChart = $$.appendClip(defs, $$.clipId);
$$.clipXAxis = $$.appendClip(defs, $$.clipIdForXAxis);
$$.clipYAxis = $$.appendClip(defs, $$.clipIdForYAxis);
$$.clipGrid = $$.appendClip(defs, $$.clipIdForGrid);
$$.clipSubchart = $$.appendClip(defs, $$.clipIdForSubchart);
$$.updateSvgSize();
main = $$.main = $$.svg.append("g").attr("transform", $$.getTranslate('main'));
if ($$.initSubchart) { $$.initSubchart(); }
if ($$.initTooltip) { $$.initTooltip(); }
if ($$.initLegend) { $$.initLegend(); }
if ($$.initTitle) { $$.initTitle(); }
main.append("text")
.attr("class", CLASS.text + ' ' + CLASS.empty)
.attr("text-anchor", "middle")
.attr("dominant-baseline", "middle");
$$.initRegion();
$$.initGrid();
main.append('g')
.attr("clip-path", $$.clipPath)
.attr('class', CLASS.chart);
if (config.grid_lines_front) { $$.initGridLines(); }
$$.initEventRect();
$$.initChartElements();
main.insert('rect', config.zoom_privileged ? null : 'g.' + CLASS.regions)
.attr('class', CLASS.zoomRect)
.attr('width', $$.width)
.attr('height', $$.height)
.style('opacity', 0)
.on("dblclick.zoom", null);
if (config.axis_x_extent) { $$.brush.extent($$.getDefaultExtent()); }
$$.axis.init();
$$.updateTargets($$.data.targets);
if (binding) {
$$.updateDimension();
$$.config.oninit.call($$);
$$.redraw({
withTransition: false,
withTransform: true,
withUpdateXDomain: true,
withUpdateOrgXDomain: true,
withTransitionForAxis: false
});
}
$$.bindResize();
$$.api.element = $$.selectChart.node();
};
c3_chart_internal_fn.smoothLines = function (el, type) {
var $$ = this;
if (type === 'grid') {
el.each(function () {
var g = $$.d3.select(this),
x1 = g.attr('x1'),
x2 = g.attr('x2'),
y1 = g.attr('y1'),
y2 = g.attr('y2');
g.attr({
'x1': Math.ceil(x1),
'x2': Math.ceil(x2),
'y1': Math.ceil(y1),
'y2': Math.ceil(y2)
});
});
}
};
c3_chart_internal_fn.updateSizes = function () {
var $$ = this, config = $$.config;
var legendHeight = $$.legend ? $$.getLegendHeight() : 0,
legendWidth = $$.legend ? $$.getLegendWidth() : 0,
legendHeightForBottom = $$.isLegendRight || $$.isLegendInset ? 0 : legendHeight,
hasArc = $$.hasArcType(),
xAxisHeight = config.axis_rotated || hasArc ? 0 : $$.getHorizontalAxisHeight('x'),
subchartHeight = config.subchart_show && !hasArc ? (config.subchart_size_height + xAxisHeight) : 0;
$$.currentWidth = $$.getCurrentWidth();
$$.currentHeight = $$.getCurrentHeight();
$$.margin = config.axis_rotated ? {
top: $$.getHorizontalAxisHeight('y2') + $$.getCurrentPaddingTop(),
right: hasArc ? 0 : $$.getCurrentPaddingRight(),
bottom: $$.getHorizontalAxisHeight('y') + legendHeightForBottom + $$.getCurrentPaddingBottom(),
left: subchartHeight + (hasArc ? 0 : $$.getCurrentPaddingLeft())
} : {
top: 4 + $$.getCurrentPaddingTop(),
right: hasArc ? 0 : $$.getCurrentPaddingRight(),
bottom: xAxisHeight + subchartHeight + legendHeightForBottom + $$.getCurrentPaddingBottom(),
left: hasArc ? 0 : $$.getCurrentPaddingLeft()
};
$$.margin2 = config.axis_rotated ? {
top: $$.margin.top,
right: NaN,
bottom: 20 + legendHeightForBottom,
left: $$.rotated_padding_left
} : {
top: $$.currentHeight - subchartHeight - legendHeightForBottom,
right: NaN,
bottom: xAxisHeight + legendHeightForBottom,
left: $$.margin.left
};
$$.margin3 = {
top: 0,
right: NaN,
bottom: 0,
left: 0
};
if ($$.updateSizeForLegend) { $$.updateSizeForLegend(legendHeight, legendWidth); }
$$.width = $$.currentWidth - $$.margin.left - $$.margin.right;
$$.height = $$.currentHeight - $$.margin.top - $$.margin.bottom;
if ($$.width < 0) { $$.width = 0; }
if ($$.height < 0) { $$.height = 0; }
$$.width2 = config.axis_rotated ? $$.margin.left - $$.rotated_padding_left - $$.rotated_padding_right : $$.width;
$$.height2 = config.axis_rotated ? $$.height : $$.currentHeight - $$.margin2.top - $$.margin2.bottom;
if ($$.width2 < 0) { $$.width2 = 0; }
if ($$.height2 < 0) { $$.height2 = 0; }
$$.arcWidth = $$.width - ($$.isLegendRight ? legendWidth + 10 : 0);
$$.arcHeight = $$.height - ($$.isLegendRight ? 0 : 10);
if ($$.hasType('gauge')) {
$$.arcHeight += $$.height - $$.getGaugeLabelHeight();
}
if ($$.updateRadius) { $$.updateRadius(); }
if ($$.isLegendRight && hasArc) {
$$.margin3.left = $$.arcWidth / 2 + $$.radiusExpanded * 1.1;
}
};
c3_chart_internal_fn.updateTargets = function (targets) {
var $$ = this;
$$.updateTargetsForText(targets);
$$.updateTargetsForBar(targets);
$$.updateTargetsForLine(targets);
if ($$.hasArcType() && $$.updateTargetsForArc) { $$.updateTargetsForArc(targets); }
if ($$.updateTargetsForSubchart) { $$.updateTargetsForSubchart(targets); }
$$.showTargets();
};
c3_chart_internal_fn.showTargets = function () {
var $$ = this;
$$.svg.selectAll('.' + CLASS.target).filter(function (d) { return $$.isTargetToShow(d.id); })
.transition().duration($$.config.transition_duration)
.style("opacity", 1);
};
c3_chart_internal_fn.redraw = function (options, transitions) {
var $$ = this, main = $$.main, d3 = $$.d3, config = $$.config;
var areaIndices = $$.getShapeIndices($$.isAreaType), barIndices = $$.getShapeIndices($$.isBarType), lineIndices = $$.getShapeIndices($$.isLineType);
var withY, withSubchart, withTransition, withTransitionForExit, withTransitionForAxis,
withTransform, withUpdateXDomain, withUpdateOrgXDomain, withTrimXDomain, withLegend,
withEventRect, withDimension, withUpdateXAxis;
var hideAxis = $$.hasArcType();
var drawArea, drawBar, drawLine, xForText, yForText;
var duration, durationForExit, durationForAxis;
var waitForDraw, flow;
var targetsToShow = $$.filterTargetsToShow($$.data.targets), tickValues, i, intervalForCulling, xDomainForZoom;
var xv = $$.xv.bind($$), cx, cy;
options = options || {};
withY = getOption(options, "withY", true);
withSubchart = getOption(options, "withSubchart", true);
withTransition = getOption(options, "withTransition", true);
withTransform = getOption(options, "withTransform", false);
withUpdateXDomain = getOption(options, "withUpdateXDomain", false);
withUpdateOrgXDomain = getOption(options, "withUpdateOrgXDomain", false);
withTrimXDomain = getOption(options, "withTrimXDomain", true);
withUpdateXAxis = getOption(options, "withUpdateXAxis", withUpdateXDomain);
withLegend = getOption(options, "withLegend", false);
withEventRect = getOption(options, "withEventRect", true);
withDimension = getOption(options, "withDimension", true);
withTransitionForExit = getOption(options, "withTransitionForExit", withTransition);
withTransitionForAxis = getOption(options, "withTransitionForAxis", withTransition);
duration = withTransition ? config.transition_duration : 0;
durationForExit = withTransitionForExit ? duration : 0;
durationForAxis = withTransitionForAxis ? duration : 0;
transitions = transitions || $$.axis.generateTransitions(durationForAxis);
if (withLegend && config.legend_show) {
$$.updateLegend($$.mapToIds($$.data.targets), options, transitions);
} else if (withDimension) {
$$.updateDimension(true);
}
if ($$.isCategorized() && targetsToShow.length === 0) {
$$.x.domain([0, $$.axes.x.selectAll('.tick').size()]);
}
if (targetsToShow.length) {
$$.updateXDomain(targetsToShow, withUpdateXDomain, withUpdateOrgXDomain, withTrimXDomain);
if (!config.axis_x_tick_values) {
tickValues = $$.axis.updateXAxisTickValues(targetsToShow);
}
} else {
$$.xAxis.tickValues([]);
$$.subXAxis.tickValues([]);
}
if (config.zoom_rescale && !options.flow) {
xDomainForZoom = $$.x.orgDomain();
}
$$.y.domain($$.getYDomain(targetsToShow, 'y', xDomainForZoom));
$$.y2.domain($$.getYDomain(targetsToShow, 'y2', xDomainForZoom));
if (!config.axis_y_tick_values && config.axis_y_tick_count) {
$$.yAxis.tickValues($$.axis.generateTickValues($$.y.domain(), config.axis_y_tick_count));
}
if (!config.axis_y2_tick_values && config.axis_y2_tick_count) {
$$.y2Axis.tickValues($$.axis.generateTickValues($$.y2.domain(), config.axis_y2_tick_count));
}
$$.axis.redraw(transitions, hideAxis);
$$.axis.updateLabels(withTransition);
if ((withUpdateXDomain || withUpdateXAxis) && targetsToShow.length) {
if (config.axis_x_tick_culling && tickValues) {
for (i = 1; i < tickValues.length; i++) {
if (tickValues.length / i < config.axis_x_tick_culling_max) {
intervalForCulling = i;
break;
}
}
$$.svg.selectAll('.' + CLASS.axisX + ' .tick text').each(function (e) {
var index = tickValues.indexOf(e);
if (index >= 0) {
d3.select(this).style('display', index % intervalForCulling ? 'none' : 'block');
}
});
} else {
$$.svg.selectAll('.' + CLASS.axisX + ' .tick text').style('display', 'block');
}
}
drawArea = $$.generateDrawArea ? $$.generateDrawArea(areaIndices, false) : undefined;
drawBar = $$.generateDrawBar ? $$.generateDrawBar(barIndices) : undefined;
drawLine = $$.generateDrawLine ? $$.generateDrawLine(lineIndices, false) : undefined;
xForText = $$.generateXYForText(areaIndices, barIndices, lineIndices, true);
yForText = $$.generateXYForText(areaIndices, barIndices, lineIndices, false);
if (withY) {
$$.subY.domain($$.getYDomain(targetsToShow, 'y'));
$$.subY2.domain($$.getYDomain(targetsToShow, 'y2'));
}
$$.updateXgridFocus();
main.select("text." + CLASS.text + '.' + CLASS.empty)
.attr("x", $$.width / 2)
.attr("y", $$.height / 2)
.text(config.data_empty_label_text)
.transition()
.style('opacity', targetsToShow.length ? 0 : 1);
$$.updateGrid(duration);
$$.updateRegion(duration);
$$.updateBar(durationForExit);
$$.updateLine(durationForExit);
$$.updateArea(durationForExit);
$$.updateCircle();
if ($$.hasDataLabel()) {
$$.updateText(durationForExit);
}
if ($$.redrawTitle) { $$.redrawTitle(); }
if ($$.redrawArc) { $$.redrawArc(duration, durationForExit, withTransform); }
if ($$.redrawSubchart) {
$$.redrawSubchart(withSubchart, transitions, duration, durationForExit, areaIndices, barIndices, lineIndices);
}
main.selectAll('.' + CLASS.selectedCircles)
.filter($$.isBarType.bind($$))
.selectAll('circle')
.remove();
if (config.interaction_enabled && !options.flow && withEventRect) {
$$.redrawEventRect();
if ($$.updateZoom) { $$.updateZoom(); }
}
$$.updateCircleY();
cx = ($$.config.axis_rotated ? $$.circleY : $$.circleX).bind($$);
cy = ($$.config.axis_rotated ? $$.circleX : $$.circleY).bind($$);
if (options.flow) {
flow = $$.generateFlow({
targets: targetsToShow,
flow: options.flow,
duration: options.flow.duration,
drawBar: drawBar,
drawLine: drawLine,
drawArea: drawArea,
cx: cx,
cy: cy,
xv: xv,
xForText: xForText,
yForText: yForText
});
}
if ((duration || flow) && $$.isTabVisible()) {
d3.transition().duration(duration).each(function () {
var transitionsToWait = [];
[
$$.redrawBar(drawBar, true),
$$.redrawLine(drawLine, true),
$$.redrawArea(drawArea, true),
$$.redrawCircle(cx, cy, true),
$$.redrawText(xForText, yForText, options.flow, true),
$$.redrawRegion(true),
$$.redrawGrid(true),
].forEach(function (transitions) {
transitions.forEach(function (transition) {
transitionsToWait.push(transition);
});
});
waitForDraw = $$.generateWait();
transitionsToWait.forEach(function (t) {
waitForDraw.add(t);
});
})
.call(waitForDraw, function () {
if (flow) {
flow();
}
if (config.onrendered) {
config.onrendered.call($$);
}
});
}
else {
$$.redrawBar(drawBar);
$$.redrawLine(drawLine);
$$.redrawArea(drawArea);
$$.redrawCircle(cx, cy);
$$.redrawText(xForText, yForText, options.flow);
$$.redrawRegion();
$$.redrawGrid();
if (config.onrendered) {
config.onrendered.call($$);
}
}
$$.mapToIds($$.data.targets).forEach(function (id) {
$$.withoutFadeIn[id] = true;
});
};
c3_chart_internal_fn.updateAndRedraw = function (options) {
var $$ = this, config = $$.config, transitions;
options = options || {};
options.withTransition = getOption(options, "withTransition", true);
options.withTransform = getOption(options, "withTransform", false);
options.withLegend = getOption(options, "withLegend", false);
options.withUpdateXDomain = true;
options.withUpdateOrgXDomain = true;
options.withTransitionForExit = false;
options.withTransitionForTransform = getOption(options, "withTransitionForTransform", options.withTransition);
$$.updateSizes();
if (!(options.withLegend && config.legend_show)) {
transitions = $$.axis.generateTransitions(options.withTransitionForAxis ? config.transition_duration : 0);
$$.updateScales();
$$.updateSvgSize();
$$.transformAll(options.withTransitionForTransform, transitions);
}
$$.redraw(options, transitions);
};
c3_chart_internal_fn.redrawWithoutRescale = function () {
this.redraw({
withY: false,
withSubchart: false,
withEventRect: false,
withTransitionForAxis: false
});
};
c3_chart_internal_fn.isTimeSeries = function () {
return this.config.axis_x_type === 'timeseries';
};
c3_chart_internal_fn.isCategorized = function () {
return this.config.axis_x_type.indexOf('categor') >= 0;
};
c3_chart_internal_fn.isCustomX = function () {
var $$ = this, config = $$.config;
return !$$.isTimeSeries() && (config.data_x || notEmpty(config.data_xs));
};
c3_chart_internal_fn.isTimeSeriesY = function () {
return this.config.axis_y_type === 'timeseries';
};
c3_chart_internal_fn.getTranslate = function (target) {
var $$ = this, config = $$.config, x, y;
if (target === 'main') {
x = asHalfPixel($$.margin.left);
y = asHalfPixel($$.margin.top);
} else if (target === 'context') {
x = asHalfPixel($$.margin2.left);
y = asHalfPixel($$.margin2.top);
} else if (target === 'legend') {
x = $$.margin3.left;
y = $$.margin3.top;
} else if (target === 'x') {
x = 0;
y = config.axis_rotated ? 0 : $$.height;
} else if (target === 'y') {
x = 0;
y = config.axis_rotated ? $$.height : 0;
} else if (target === 'y2') {
x = config.axis_rotated ? 0 : $$.width;
y = config.axis_rotated ? 1 : 0;
} else if (target === 'subx') {
x = 0;
y = config.axis_rotated ? 0 : $$.height2;
} else if (target === 'arc') {
x = $$.arcWidth / 2;
y = $$.arcHeight / 2;
}
return "translate(" + x + "," + y + ")";
};
c3_chart_internal_fn.initialOpacity = function (d) {
return d.value !== null && this.withoutFadeIn[d.id] ? 1 : 0;
};
c3_chart_internal_fn.initialOpacityForCircle = function (d) {
return d.value !== null && this.withoutFadeIn[d.id] ? this.opacityForCircle(d) : 0;
};
c3_chart_internal_fn.opacityForCircle = function (d) {
var opacity = this.config.point_show ? 1 : 0;
return isValue(d.value) ? (this.isScatterType(d) ? 0.5 : opacity) : 0;
};
c3_chart_internal_fn.opacityForText = function () {
return this.hasDataLabel() ? 1 : 0;
};
c3_chart_internal_fn.xx = function (d) {
return d ? this.x(d.x) : null;
};
c3_chart_internal_fn.xv = function (d) {
var $$ = this, value = d.value;
if ($$.isTimeSeries()) {
value = $$.parseDate(d.value);
}
else if ($$.isCategorized() && typeof d.value === 'string') {
value = $$.config.axis_x_categories.indexOf(d.value);
}
return Math.ceil($$.x(value));
};
c3_chart_internal_fn.yv = function (d) {
var $$ = this,
yScale = d.axis && d.axis === 'y2' ? $$.y2 : $$.y;
return Math.ceil(yScale(d.value));
};
c3_chart_internal_fn.subxx = function (d) {
return d ? this.subX(d.x) : null;
};
c3_chart_internal_fn.transformMain = function (withTransition, transitions) {
var $$ = this,
xAxis, yAxis, y2Axis;
if (transitions && transitions.axisX) {
xAxis = transitions.axisX;
} else {
xAxis  = $$.main.select('.' + CLASS.axisX);
if (withTransition) { xAxis = xAxis.transition(); }
}
if (transitions && transitions.axisY) {
yAxis = transitions.axisY;
} else {
yAxis = $$.main.select('.' + CLASS.axisY);
if (withTransition) { yAxis = yAxis.transition(); }
}
if (transitions && transitions.axisY2) {
y2Axis = transitions.axisY2;
} else {
y2Axis = $$.main.select('.' + CLASS.axisY2);
if (withTransition) { y2Axis = y2Axis.transition(); }
}
(withTransition ? $$.main.transition() : $$.main).attr("transform", $$.getTranslate('main'));
xAxis.attr("transform", $$.getTranslate('x'));
yAxis.attr("transform", $$.getTranslate('y'));
y2Axis.attr("transform", $$.getTranslate('y2'));
$$.main.select('.' + CLASS.chartArcs).attr("transform", $$.getTranslate('arc'));
};
c3_chart_internal_fn.transformAll = function (withTransition, transitions) {
var $$ = this;
$$.transformMain(withTransition, transitions);
if ($$.config.subchart_show) { $$.transformContext(withTransition, transitions); }
if ($$.legend) { $$.transformLegend(withTransition); }
};
c3_chart_internal_fn.updateSvgSize = function () {
var $$ = this,
brush = $$.svg.select(".c3-brush .background");
$$.svg.attr('width', $$.currentWidth).attr('height', $$.currentHeight);
$$.svg.selectAll(['#' + $$.clipId, '#' + $$.clipIdForGrid]).select('rect')
.attr('width', $$.width)
.attr('height', $$.height);
$$.svg.select('#' + $$.clipIdForXAxis).select('rect')
.attr('x', $$.getXAxisClipX.bind($$))
.attr('y', $$.getXAxisClipY.bind($$))
.attr('width', $$.getXAxisClipWidth.bind($$))
.attr('height', $$.getXAxisClipHeight.bind($$));
$$.svg.select('#' + $$.clipIdForYAxis).select('rect')
.attr('x', $$.getYAxisClipX.bind($$))
.attr('y', $$.getYAxisClipY.bind($$))
.attr('width', $$.getYAxisClipWidth.bind($$))
.attr('height', $$.getYAxisClipHeight.bind($$));
$$.svg.select('#' + $$.clipIdForSubchart).select('rect')
.attr('width', $$.width)
.attr('height', brush.size() ? brush.attr('height') : 0);
$$.svg.select('.' + CLASS.zoomRect)
.attr('width', $$.width)
.attr('height', $$.height);
$$.selectChart.style('max-height', $$.currentHeight + "px");
};
c3_chart_internal_fn.updateDimension = function (withoutAxis) {
var $$ = this;
if (!withoutAxis) {
if ($$.config.axis_rotated) {
$$.axes.x.call($$.xAxis);
$$.axes.subx.call($$.subXAxis);
} else {
$$.axes.y.call($$.yAxis);
$$.axes.y2.call($$.y2Axis);
}
}
$$.updateSizes();
$$.updateScales();
$$.updateSvgSize();
$$.transformAll(false);
};
c3_chart_internal_fn.observeInserted = function (selection) {
var $$ = this, observer;
if (typeof MutationObserver === 'undefined') {
window.console.error("MutationObserver not defined.");
return;
}
observer= new MutationObserver(function (mutations) {
mutations.forEach(function (mutation) {
if (mutation.type === 'childList' && mutation.previousSibling) {
observer.disconnect();
$$.intervalForObserveInserted = window.setInterval(function () {
if (selection.node().parentNode) {
window.clearInterval($$.intervalForObserveInserted);
$$.updateDimension();
if ($$.brush) { $$.brush.update(); }
$$.config.oninit.call($$);
$$.redraw({
withTransform: true,
withUpdateXDomain: true,
withUpdateOrgXDomain: true,
withTransition: false,
withTransitionForTransform: false,
withLegend: true
});
selection.transition().style('opacity', 1);
}
}, 10);
}
});
});
observer.observe(selection.node(), {attributes: true, childList: true, characterData: true});
};
c3_chart_internal_fn.bindResize = function () {
var $$ = this, config = $$.config;
$$.resizeFunction = $$.generateResize();
$$.resizeFunction.add(function () {
config.onresize.call($$);
});
if (config.resize_auto) {
$$.resizeFunction.add(function () {
if ($$.resizeTimeout !== undefined) {
window.clearTimeout($$.resizeTimeout);
}
$$.resizeTimeout = window.setTimeout(function () {
delete $$.resizeTimeout;
$$.api.flush();
}, 100);
});
}
$$.resizeFunction.add(function () {
config.onresized.call($$);
});
if (window.attachEvent) {
window.attachEvent('onresize', $$.resizeFunction);
} else if (window.addEventListener) {
window.addEventListener('resize', $$.resizeFunction, false);
} else {
var wrapper = window.onresize;
if (!wrapper) {
wrapper = $$.generateResize();
} else if (!wrapper.add || !wrapper.remove) {
wrapper = $$.generateResize();
wrapper.add(window.onresize);
}
wrapper.add($$.resizeFunction);
window.onresize = wrapper;
}
};
c3_chart_internal_fn.generateResize = function () {
var resizeFunctions = [];
function callResizeFunctions() {
resizeFunctions.forEach(function (f) {
f();
});
}
callResizeFunctions.add = function (f) {
resizeFunctions.push(f);
};
callResizeFunctions.remove = function (f) {
for (var i = 0; i < resizeFunctions.length; i++) {
if (resizeFunctions[i] === f) {
resizeFunctions.splice(i, 1);
break;
}
}
};
return callResizeFunctions;
};
c3_chart_internal_fn.endall = function (transition, callback) {
var n = 0;
transition
.each(function () { ++n; })
.each("end", function () {
if (!--n) { callback.apply(this, arguments); }
});
};
c3_chart_internal_fn.generateWait = function () {
var transitionsToWait = [],
f = function (transition, callback) {
var timer = setInterval(function () {
var done = 0;
transitionsToWait.forEach(function (t) {
if (t.empty()) {
done += 1;
return;
}
try {
t.transition();
} catch (e) {
done += 1;
}
});
if (done === transitionsToWait.length) {
clearInterval(timer);
if (callback) { callback(); }
}
}, 10);
};
f.add = function (transition) {
transitionsToWait.push(transition);
};
return f;
};
c3_chart_internal_fn.parseDate = function (date) {
var $$ = this, parsedDate;
if (date instanceof Date) {
parsedDate = date;
} else if (typeof date === 'string') {
parsedDate = $$.dataTimeFormat($$.config.data_xFormat).parse(date);
} else if (typeof date === 'number' && !isNaN(date)) {
parsedDate = new Date(+date);
}
if (!parsedDate || isNaN(+parsedDate)) {
window.console.error("Failed to parse x '" + date + "' to Date object");
}
return parsedDate;
};
c3_chart_internal_fn.isTabVisible = function () {
var hidden;
if (typeof document.hidden !== "undefined") {
hidden = "hidden";
} else if (typeof document.mozHidden !== "undefined") {
hidden = "mozHidden";
} else if (typeof document.msHidden !== "undefined") {
hidden = "msHidden";
} else if (typeof document.webkitHidden !== "undefined") {
hidden = "webkitHidden";
}
return document[hidden] ? false : true;
};
c3_chart_internal_fn.getDefaultConfig = function () {
var config = {
bindto: '#chart',
svg_classname: undefined,
size_width: undefined,
size_height: undefined,
padding_left: undefined,
padding_right: undefined,
padding_top: undefined,
padding_bottom: undefined,
resize_auto: true,
zoom_enabled: false,
zoom_extent: undefined,
zoom_privileged: false,
zoom_rescale: false,
zoom_onzoom: function () {},
zoom_onzoomstart: function () {},
zoom_onzoomend: function () {},
zoom_x_min: undefined,
zoom_x_max: undefined,
interaction_enabled: true,
onmouseover: function () {},
onmouseout: function () {},
onresize: function () {},
onresized: function () {},
oninit: function () {},
onrendered: function () {},
transition_duration: 350,
data_x: undefined,
data_xs: {},
data_xFormat: '%Y-%m-%d',
data_xLocaltime: true,
data_xSort: true,
data_idConverter: function (id) { return id; },
data_names: {},
data_classes: {},
data_groups: [],
data_axes: {},
data_type: undefined,
data_types: {},
data_labels: {},
data_order: 'desc',
data_regions: {},
data_color: undefined,
data_colors: {},
data_hide: false,
data_filter: undefined,
data_selection_enabled: false,
data_selection_grouped: false,
data_selection_isselectable: function () { return true; },
data_selection_multiple: true,
data_selection_draggable: false,
data_onclick: function () {},
data_onmouseover: function () {},
data_onmouseout: function () {},
data_onselected: function () {},
data_onunselected: function () {},
data_url: undefined,
data_json: undefined,
data_rows: undefined,
data_columns: undefined,
data_mimeType: undefined,
data_keys: undefined,
data_empty_label_text: "",
subchart_show: false,
subchart_size_height: 60,
subchart_axis_x_show: true,
subchart_onbrush: function () {},
color_pattern: [],
color_threshold: {},
legend_show: true,
legend_hide: false,
legend_position: 'bottom',
legend_inset_anchor: 'top-left',
legend_inset_x: 10,
legend_inset_y: 0,
legend_inset_step: undefined,
legend_item_onclick: undefined,
legend_item_onmouseover: undefined,
legend_item_onmouseout: undefined,
legend_equally: false,
legend_padding: 0,
legend_item_tile_width: 10,
legend_item_tile_height: 10,
axis_rotated: false,
axis_x_show: true,
axis_x_type: 'indexed',
axis_x_localtime: true,
axis_x_categories: [],
axis_x_tick_centered: false,
axis_x_tick_format: undefined,
axis_x_tick_culling: {},
axis_x_tick_culling_max: 10,
axis_x_tick_count: undefined,
axis_x_tick_fit: true,
axis_x_tick_values: null,
axis_x_tick_rotate: 0,
axis_x_tick_outer: true,
axis_x_tick_multiline: true,
axis_x_tick_width: null,
axis_x_max: undefined,
axis_x_min: undefined,
axis_x_padding: {},
axis_x_height: undefined,
axis_x_extent: undefined,
axis_x_label: {},
axis_y_show: true,
axis_y_type: undefined,
axis_y_max: undefined,
axis_y_min: undefined,
axis_y_inverted: false,
axis_y_center: undefined,
axis_y_inner: undefined,
axis_y_label: {},
axis_y_tick_format: undefined,
axis_y_tick_outer: true,
axis_y_tick_values: null,
axis_y_tick_count: undefined,
axis_y_tick_time_value: undefined,
axis_y_tick_time_interval: undefined,
axis_y_padding: {},
axis_y_default: undefined,
axis_y2_show: false,
axis_y2_max: undefined,
axis_y2_min: undefined,
axis_y2_inverted: false,
axis_y2_center: undefined,
axis_y2_inner: undefined,
axis_y2_label: {},
axis_y2_tick_format: undefined,
axis_y2_tick_outer: true,
axis_y2_tick_values: null,
axis_y2_tick_count: undefined,
axis_y2_padding: {},
axis_y2_default: undefined,
grid_x_show: false,
grid_x_type: 'tick',
grid_x_lines: [],
grid_y_show: false,
grid_y_lines: [],
grid_y_ticks: 10,
grid_focus_show: true,
grid_lines_front: true,
point_show: true,
point_r: 2.5,
point_sensitivity: 10,
point_focus_expand_enabled: true,
point_focus_expand_r: undefined,
point_select_r: undefined,
line_connectNull: false,
line_step_type: 'step',
bar_width: undefined,
bar_width_ratio: 0.6,
bar_width_max: undefined,
bar_zerobased: true,
area_zerobased: true,
pie_label_show: true,
pie_label_format: undefined,
pie_label_threshold: 0.05,
pie_expand: {},
pie_expand_duration: 50,
gauge_label_show: true,
gauge_label_format: undefined,
gauge_min: 0,
gauge_max: 100,
gauge_units: undefined,
gauge_width: undefined,
gauge_expand: {},
gauge_expand_duration: 50,
donut_label_show: true,
donut_label_format: undefined,
donut_label_threshold: 0.05,
donut_width: undefined,
donut_title: "",
donut_expand: {},
donut_expand_duration: 50,
spline_interpolation_type: 'cardinal',
regions: [],
tooltip_show: true,
tooltip_grouped: true,
tooltip_format_title: undefined,
tooltip_format_name: undefined,
tooltip_format_value: undefined,
tooltip_position: undefined,
tooltip_contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
return this.getTooltipContent ? this.getTooltipContent(d, defaultTitleFormat, defaultValueFormat, color) : '';
},
tooltip_init_show: false,
tooltip_init_x: 0,
tooltip_init_position: {top: '0px', left: '50px'},
tooltip_onshow: function () {},
tooltip_onhide: function () {},
title_text: undefined,
title_padding: {
top: 0,
right: 0,
bottom: 0,
left: 0
},
title_position: 'top-center',
};
Object.keys(this.additionalConfig).forEach(function (key) {
config[key] = this.additionalConfig[key];
}, this);
return config;
};
c3_chart_internal_fn.additionalConfig = {};
c3_chart_internal_fn.loadConfig = function (config) {
var this_config = this.config, target, keys, read;
function find() {
var key = keys.shift();
if (key && target && typeof target === 'object' && key in target) {
target = target[key];
return find();
}
else if (!key) {
return target;
}
else {
return undefined;
}
}
Object.keys(this_config).forEach(function (key) {
target = config;
keys = key.split('_');
read = find();
if (isDefined(read)) {
this_config[key] = read;
}
});
};
c3_chart_internal_fn.getScale = function (min, max, forTimeseries) {
return (forTimeseries ? this.d3.time.scale() : this.d3.scale.linear()).range([min, max]);
};
c3_chart_internal_fn.getX = function (min, max, domain, offset) {
var $$ = this,
scale = $$.getScale(min, max, $$.isTimeSeries()),
_scale = domain ? scale.domain(domain) : scale, key;
if ($$.isCategorized()) {
offset = offset || function () { return 0; };
scale = function (d, raw) {
var v = _scale(d) + offset(d);
return raw ? v : Math.ceil(v);
};
} else {
scale = function (d, raw) {
var v = _scale(d);
return raw ? v : Math.ceil(v);
};
}
for (key in _scale) {
scale[key] = _scale[key];
}
scale.orgDomain = function () {
return _scale.domain();
};
if ($$.isCategorized()) {
scale.domain = function (domain) {
if (!arguments.length) {
domain = this.orgDomain();
return [domain[0], domain[1] + 1];
}
_scale.domain(domain);
return scale;
};
}
return scale;
};
c3_chart_internal_fn.getY = function (min, max, domain) {
var scale = this.getScale(min, max, this.isTimeSeriesY());
if (domain) { scale.domain(domain); }
return scale;
};
c3_chart_internal_fn.getYScale = function (id) {
return this.axis.getId(id) === 'y2' ? this.y2 : this.y;
};
c3_chart_internal_fn.getSubYScale = function (id) {
return this.axis.getId(id) === 'y2' ? this.subY2 : this.subY;
};
c3_chart_internal_fn.updateScales = function () {
var $$ = this, config = $$.config,
forInit = !$$.x;
$$.xMin = config.axis_rotated ? 1 : 0;
$$.xMax = config.axis_rotated ? $$.height : $$.width;
$$.yMin = config.axis_rotated ? 0 : $$.height;
$$.yMax = config.axis_rotated ? $$.width : 1;
$$.subXMin = $$.xMin;
$$.subXMax = $$.xMax;
$$.subYMin = config.axis_rotated ? 0 : $$.height2;
$$.subYMax = config.axis_rotated ? $$.width2 : 1;
$$.x = $$.getX($$.xMin, $$.xMax, forInit ? undefined : $$.x.orgDomain(), function () { return $$.xAxis.tickOffset(); });
$$.y = $$.getY($$.yMin, $$.yMax, forInit ? config.axis_y_default : $$.y.domain());
$$.y2 = $$.getY($$.yMin, $$.yMax, forInit ? config.axis_y2_default : $$.y2.domain());
$$.subX = $$.getX($$.xMin, $$.xMax, $$.orgXDomain, function (d) { return d % 1 ? 0 : $$.subXAxis.tickOffset(); });
$$.subY = $$.getY($$.subYMin, $$.subYMax, forInit ? config.axis_y_default : $$.subY.domain());
$$.subY2 = $$.getY($$.subYMin, $$.subYMax, forInit ? config.axis_y2_default : $$.subY2.domain());
$$.xAxisTickFormat = $$.axis.getXAxisTickFormat();
$$.xAxisTickValues = $$.axis.getXAxisTickValues();
$$.yAxisTickValues = $$.axis.getYAxisTickValues();
$$.y2AxisTickValues = $$.axis.getY2AxisTickValues();
$$.xAxis = $$.axis.getXAxis($$.x, $$.xOrient, $$.xAxisTickFormat, $$.xAxisTickValues, config.axis_x_tick_outer);
$$.subXAxis = $$.axis.getXAxis($$.subX, $$.subXOrient, $$.xAxisTickFormat, $$.xAxisTickValues, config.axis_x_tick_outer);
$$.yAxis = $$.axis.getYAxis($$.y, $$.yOrient, config.axis_y_tick_format, $$.yAxisTickValues, config.axis_y_tick_outer);
$$.y2Axis = $$.axis.getYAxis($$.y2, $$.y2Orient, config.axis_y2_tick_format, $$.y2AxisTickValues, config.axis_y2_tick_outer);
if (!forInit) {
if ($$.brush) { $$.brush.scale($$.subX); }
if (config.zoom_enabled) { $$.zoom.scale($$.x); }
}
if ($$.updateArc) { $$.updateArc(); }
};
c3_chart_internal_fn.getYDomainMin = function (targets) {
var $$ = this, config = $$.config,
ids = $$.mapToIds(targets), ys = $$.getValuesAsIdKeyed(targets),
j, k, baseId, idsInGroup, id, hasNegativeValue;
if (config.data_groups.length > 0) {
hasNegativeValue = $$.hasNegativeValueInTargets(targets);
for (j = 0; j < config.data_groups.length; j++) {
idsInGroup = config.data_groups[j].filter(function (id) { return ids.indexOf(id) >= 0; });
if (idsInGroup.length === 0) { continue; }
baseId = idsInGroup[0];
if (hasNegativeValue && ys[baseId]) {
ys[baseId].forEach(function (v, i) {
ys[baseId][i] = v < 0 ? v : 0;
});
}
for (k = 1; k < idsInGroup.length; k++) {
id = idsInGroup[k];
if (! ys[id]) { continue; }
ys[id].forEach(function (v, i) {
if ($$.axis.getId(id) === $$.axis.getId(baseId) && ys[baseId] && !(hasNegativeValue && +v > 0)) {
ys[baseId][i] += +v;
}
});
}
}
}
return $$.d3.min(Object.keys(ys).map(function (key) { return $$.d3.min(ys[key]); }));
};
c3_chart_internal_fn.getYDomainMax = function (targets) {
var $$ = this, config = $$.config,
ids = $$.mapToIds(targets), ys = $$.getValuesAsIdKeyed(targets),
j, k, baseId, idsInGroup, id, hasPositiveValue;
if (config.data_groups.length > 0) {
hasPositiveValue = $$.hasPositiveValueInTargets(targets);
for (j = 0; j < config.data_groups.length; j++) {
idsInGroup = config.data_groups[j].filter(function (id) { return ids.indexOf(id) >= 0; });
if (idsInGroup.length === 0) { continue; }
baseId = idsInGroup[0];
if (hasPositiveValue && ys[baseId]) {
ys[baseId].forEach(function (v, i) {
ys[baseId][i] = v > 0 ? v : 0;
});
}
for (k = 1; k < idsInGroup.length; k++) {
id = idsInGroup[k];
if (! ys[id]) { continue; }
ys[id].forEach(function (v, i) {
if ($$.axis.getId(id) === $$.axis.getId(baseId) && ys[baseId] && !(hasPositiveValue && +v < 0)) {
ys[baseId][i] += +v;
}
});
}
}
}
return $$.d3.max(Object.keys(ys).map(function (key) { return $$.d3.max(ys[key]); }));
};
c3_chart_internal_fn.getYDomain = function (targets, axisId, xDomain) {
var $$ = this, config = $$.config,
targetsByAxisId = targets.filter(function (t) { return $$.axis.getId(t.id) === axisId; }),
yTargets = xDomain ? $$.filterByXDomain(targetsByAxisId, xDomain) : targetsByAxisId,
yMin = axisId === 'y2' ? config.axis_y2_min : config.axis_y_min,
yMax = axisId === 'y2' ? config.axis_y2_max : config.axis_y_max,
yDomainMin = $$.getYDomainMin(yTargets),
yDomainMax = $$.getYDomainMax(yTargets),
domain, domainLength, padding, padding_top, padding_bottom,
center = axisId === 'y2' ? config.axis_y2_center : config.axis_y_center,
yDomainAbs, lengths, diff, ratio, isAllPositive, isAllNegative,
isZeroBased = ($$.hasType('bar', yTargets) && config.bar_zerobased) || ($$.hasType('area', yTargets) && config.area_zerobased),
isInverted = axisId === 'y2' ? config.axis_y2_inverted : config.axis_y_inverted,
showHorizontalDataLabel = $$.hasDataLabel() && config.axis_rotated,
showVerticalDataLabel = $$.hasDataLabel() && !config.axis_rotated;
yDomainMin = isValue(yMin) ? yMin : isValue(yMax) ? (yDomainMin < yMax ? yDomainMin : yMax - 10) : yDomainMin;
yDomainMax = isValue(yMax) ? yMax : isValue(yMin) ? (yMin < yDomainMax ? yDomainMax : yMin + 10) : yDomainMax;
if (yTargets.length === 0) {
return axisId === 'y2' ? $$.y2.domain() : $$.y.domain();
}
if (isNaN(yDomainMin)) {
yDomainMin = 0;
}
if (isNaN(yDomainMax)) {
yDomainMax = yDomainMin;
}
if (yDomainMin === yDomainMax) {
yDomainMin < 0 ? yDomainMax = 0 : yDomainMin = 0;
}
isAllPositive = yDomainMin >= 0 && yDomainMax >= 0;
isAllNegative = yDomainMin <= 0 && yDomainMax <= 0;
if ((isValue(yMin) && isAllPositive) || (isValue(yMax) && isAllNegative)) {
isZeroBased = false;
}
if (isZeroBased) {
if (isAllPositive) { yDomainMin = 0; }
if (isAllNegative) { yDomainMax = 0; }
}
domainLength = Math.abs(yDomainMax - yDomainMin);
padding = padding_top = padding_bottom = domainLength * 0.1;
if (typeof center !== 'undefined') {
yDomainAbs = Math.max(Math.abs(yDomainMin), Math.abs(yDomainMax));
yDomainMax = center + yDomainAbs;
yDomainMin = center - yDomainAbs;
}
if (showHorizontalDataLabel) {
lengths = $$.getDataLabelLength(yDomainMin, yDomainMax, 'width');
diff = diffDomain($$.y.range());
ratio = [lengths[0] / diff, lengths[1] / diff];
padding_top += domainLength * (ratio[1] / (1 - ratio[0] - ratio[1]));
padding_bottom += domainLength * (ratio[0] / (1 - ratio[0] - ratio[1]));
} else if (showVerticalDataLabel) {
lengths = $$.getDataLabelLength(yDomainMin, yDomainMax, 'height');
padding_top += $$.axis.convertPixelsToAxisPadding(lengths[1], domainLength);
padding_bottom += $$.axis.convertPixelsToAxisPadding(lengths[0], domainLength);
}
if (axisId === 'y' && notEmpty(config.axis_y_padding)) {
padding_top = $$.axis.getPadding(config.axis_y_padding, 'top', padding_top, domainLength);
padding_bottom = $$.axis.getPadding(config.axis_y_padding, 'bottom', padding_bottom, domainLength);
}
if (axisId === 'y2' && notEmpty(config.axis_y2_padding)) {
padding_top = $$.axis.getPadding(config.axis_y2_padding, 'top', padding_top, domainLength);
padding_bottom = $$.axis.getPadding(config.axis_y2_padding, 'bottom', padding_bottom, domainLength);
}
if (isZeroBased) {
if (isAllPositive) { padding_bottom = yDomainMin; }
if (isAllNegative) { padding_top = -yDomainMax; }
}
domain = [yDomainMin - padding_bottom, yDomainMax + padding_top];
return isInverted ? domain.reverse() : domain;
};
c3_chart_internal_fn.getXDomainMin = function (targets) {
var $$ = this, config = $$.config;
return isDefined(config.axis_x_min) ?
($$.isTimeSeries() ? this.parseDate(config.axis_x_min) : config.axis_x_min) :
$$.d3.min(targets, function (t) { return $$.d3.min(t.values, function (v) { return v.x; }); });
};
c3_chart_internal_fn.getXDomainMax = function (targets) {
var $$ = this, config = $$.config;
return isDefined(config.axis_x_max) ?
($$.isTimeSeries() ? this.parseDate(config.axis_x_max) : config.axis_x_max) :
$$.d3.max(targets, function (t) { return $$.d3.max(t.values, function (v) { return v.x; }); });
};
c3_chart_internal_fn.getXDomainPadding = function (domain) {
var $$ = this, config = $$.config,
diff = domain[1] - domain[0],
maxDataCount, padding, paddingLeft, paddingRight;
if ($$.isCategorized()) {
padding = 0;
} else if ($$.hasType('bar')) {
maxDataCount = $$.getMaxDataCount();
padding = maxDataCount > 1 ? (diff / (maxDataCount - 1)) / 2 : 0.5;
} else {
padding = diff * 0.01;
}
if (typeof config.axis_x_padding === 'object' && notEmpty(config.axis_x_padding)) {
paddingLeft = isValue(config.axis_x_padding.left) ? config.axis_x_padding.left : padding;
paddingRight = isValue(config.axis_x_padding.right) ? config.axis_x_padding.right : padding;
} else if (typeof config.axis_x_padding === 'number') {
paddingLeft = paddingRight = config.axis_x_padding;
} else {
paddingLeft = paddingRight = padding;
}
return {left: paddingLeft, right: paddingRight};
};
c3_chart_internal_fn.getXDomain = function (targets) {
var $$ = this,
xDomain = [$$.getXDomainMin(targets), $$.getXDomainMax(targets)],
firstX = xDomain[0], lastX = xDomain[1],
padding = $$.getXDomainPadding(xDomain),
min = 0, max = 0;
if ((firstX - lastX) === 0 && !$$.isCategorized()) {
if ($$.isTimeSeries()) {
firstX = new Date(firstX.getTime() * 0.5);
lastX = new Date(lastX.getTime() * 1.5);
} else {
firstX = firstX === 0 ? 1 : (firstX * 0.5);
lastX = lastX === 0 ? -1 : (lastX * 1.5);
}
}
if (firstX || firstX === 0) {
min = $$.isTimeSeries() ? new Date(firstX.getTime() - padding.left) : firstX - padding.left;
}
if (lastX || lastX === 0) {
max = $$.isTimeSeries() ? new Date(lastX.getTime() + padding.right) : lastX + padding.right;
}
return [min, max];
};
c3_chart_internal_fn.updateXDomain = function (targets, withUpdateXDomain, withUpdateOrgXDomain, withTrim, domain) {
var $$ = this, config = $$.config;
if (withUpdateOrgXDomain) {
$$.x.domain(domain ? domain : $$.d3.extent($$.getXDomain(targets)));
$$.orgXDomain = $$.x.domain();
if (config.zoom_enabled) { $$.zoom.scale($$.x).updateScaleExtent(); }
$$.subX.domain($$.x.domain());
if ($$.brush) { $$.brush.scale($$.subX); }
}
if (withUpdateXDomain) {
$$.x.domain(domain ? domain : (!$$.brush || $$.brush.empty()) ? $$.orgXDomain : $$.brush.extent());
if (config.zoom_enabled) { $$.zoom.scale($$.x).updateScaleExtent(); }
}
if (withTrim) { $$.x.domain($$.trimXDomain($$.x.orgDomain())); }
return $$.x.domain();
};
c3_chart_internal_fn.trimXDomain = function (domain) {
var zoomDomain = this.getZoomDomain(),
min = zoomDomain[0], max = zoomDomain[1];
if (domain[0] <= min) {
domain[1] = +domain[1] + (min - domain[0]);
domain[0] = min;
}
if (max <= domain[1]) {
domain[0] = +domain[0] - (domain[1] - max);
domain[1] = max;
}
return domain;
};
c3_chart_internal_fn.isX = function (key) {
var $$ = this, config = $$.config;
return (config.data_x && key === config.data_x) || (notEmpty(config.data_xs) && hasValue(config.data_xs, key));
};
c3_chart_internal_fn.isNotX = function (key) {
return !this.isX(key);
};
c3_chart_internal_fn.getXKey = function (id) {
var $$ = this, config = $$.config;
return config.data_x ? config.data_x : notEmpty(config.data_xs) ? config.data_xs[id] : null;
};
c3_chart_internal_fn.getXValuesOfXKey = function (key, targets) {
var $$ = this,
xValues, ids = targets && notEmpty(targets) ? $$.mapToIds(targets) : [];
ids.forEach(function (id) {
if ($$.getXKey(id) === key) {
xValues = $$.data.xs[id];
}
});
return xValues;
};
c3_chart_internal_fn.getIndexByX = function (x) {
var $$ = this,
data = $$.filterByX($$.data.targets, x);
return data.length ? data[0].index : null;
};
c3_chart_internal_fn.getXValue = function (id, i) {
var $$ = this;
return id in $$.data.xs && $$.data.xs[id] && isValue($$.data.xs[id][i]) ? $$.data.xs[id][i] : i;
};
c3_chart_internal_fn.getOtherTargetXs = function () {
var $$ = this,
idsForX = Object.keys($$.data.xs);
return idsForX.length ? $$.data.xs[idsForX[0]] : null;
};
c3_chart_internal_fn.getOtherTargetX = function (index) {
var xs = this.getOtherTargetXs();
return xs && index < xs.length ? xs[index] : null;
};
c3_chart_internal_fn.addXs = function (xs) {
var $$ = this;
Object.keys(xs).forEach(function (id) {
$$.config.data_xs[id] = xs[id];
});
};
c3_chart_internal_fn.hasMultipleX = function (xs) {
return this.d3.set(Object.keys(xs).map(function (id) { return xs[id]; })).size() > 1;
};
c3_chart_internal_fn.isMultipleX = function () {
return notEmpty(this.config.data_xs) || !this.config.data_xSort || this.hasType('scatter');
};
c3_chart_internal_fn.addName = function (data) {
var $$ = this, name;
if (data) {
name = $$.config.data_names[data.id];
data.name = name !== undefined ? name : data.id;
}
return data;
};
c3_chart_internal_fn.getValueOnIndex = function (values, index) {
var valueOnIndex = values.filter(function (v) { return v.index === index; });
return valueOnIndex.length ? valueOnIndex[0] : null;
};
c3_chart_internal_fn.updateTargetX = function (targets, x) {
var $$ = this;
targets.forEach(function (t) {
t.values.forEach(function (v, i) {
v.x = $$.generateTargetX(x[i], t.id, i);
});
$$.data.xs[t.id] = x;
});
};
c3_chart_internal_fn.updateTargetXs = function (targets, xs) {
var $$ = this;
targets.forEach(function (t) {
if (xs[t.id]) {
$$.updateTargetX([t], xs[t.id]);
}
});
};
c3_chart_internal_fn.generateTargetX = function (rawX, id, index) {
var $$ = this, x;
if ($$.isTimeSeries()) {
x = rawX ? $$.parseDate(rawX) : $$.parseDate($$.getXValue(id, index));
}
else if ($$.isCustomX() && !$$.isCategorized()) {
x = isValue(rawX) ? +rawX : $$.getXValue(id, index);
}
else {
x = index;
}
return x;
};
c3_chart_internal_fn.cloneTarget = function (target) {
return {
id : target.id,
id_org : target.id_org,
values : target.values.map(function (d) {
return {x: d.x, value: d.value, id: d.id};
})
};
};
c3_chart_internal_fn.updateXs = function () {
var $$ = this;
if ($$.data.targets.length) {
$$.xs = [];
$$.data.targets[0].values.forEach(function (v) {
$$.xs[v.index] = v.x;
});
}
};
c3_chart_internal_fn.getPrevX = function (i) {
var x = this.xs[i - 1];
return typeof x !== 'undefined' ? x : null;
};
c3_chart_internal_fn.getNextX = function (i) {
var x = this.xs[i + 1];
return typeof x !== 'undefined' ? x : null;
};
c3_chart_internal_fn.getMaxDataCount = function () {
var $$ = this;
return $$.d3.max($$.data.targets, function (t) { return t.values.length; });
};
c3_chart_internal_fn.getMaxDataCountTarget = function (targets) {
var length = targets.length, max = 0, maxTarget;
if (length > 1) {
targets.forEach(function (t) {
if (t.values.length > max) {
maxTarget = t;
max = t.values.length;
}
});
} else {
maxTarget = length ? targets[0] : null;
}
return maxTarget;
};
c3_chart_internal_fn.getEdgeX = function (targets) {
var $$ = this;
return !targets.length ? [0, 0] : [
$$.d3.min(targets, function (t) { return t.values[0].x; }),
$$.d3.max(targets, function (t) { return t.values[t.values.length - 1].x; })
];
};
c3_chart_internal_fn.mapToIds = function (targets) {
return targets.map(function (d) { return d.id; });
};
c3_chart_internal_fn.mapToTargetIds = function (ids) {
var $$ = this;
return ids ? [].concat(ids) : $$.mapToIds($$.data.targets);
};
c3_chart_internal_fn.hasTarget = function (targets, id) {
var ids = this.mapToIds(targets), i;
for (i = 0; i < ids.length; i++) {
if (ids[i] === id) {
return true;
}
}
return false;
};
c3_chart_internal_fn.isTargetToShow = function (targetId) {
return this.hiddenTargetIds.indexOf(targetId) < 0;
};
c3_chart_internal_fn.isLegendToShow = function (targetId) {
return this.hiddenLegendIds.indexOf(targetId) < 0;
};
c3_chart_internal_fn.filterTargetsToShow = function (targets) {
var $$ = this;
return targets.filter(function (t) { return $$.isTargetToShow(t.id); });
};
c3_chart_internal_fn.mapTargetsToUniqueXs = function (targets) {
var $$ = this;
var xs = $$.d3.set($$.d3.merge(targets.map(function (t) { return t.values.map(function (v) { return +v.x; }); }))).values();
xs = $$.isTimeSeries() ? xs.map(function (x) { return new Date(+x); }) : xs.map(function (x) { return +x; });
return xs.sort(function (a, b) { return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN; });
};
c3_chart_internal_fn.addHiddenTargetIds = function (targetIds) {
this.hiddenTargetIds = this.hiddenTargetIds.concat(targetIds);
};
c3_chart_internal_fn.removeHiddenTargetIds = function (targetIds) {
this.hiddenTargetIds = this.hiddenTargetIds.filter(function (id) { return targetIds.indexOf(id) < 0; });
};
c3_chart_internal_fn.addHiddenLegendIds = function (targetIds) {
this.hiddenLegendIds = this.hiddenLegendIds.concat(targetIds);
};
c3_chart_internal_fn.removeHiddenLegendIds = function (targetIds) {
this.hiddenLegendIds = this.hiddenLegendIds.filter(function (id) { return targetIds.indexOf(id) < 0; });
};
c3_chart_internal_fn.getValuesAsIdKeyed = function (targets) {
var ys = {};
targets.forEach(function (t) {
ys[t.id] = [];
t.values.forEach(function (v) {
ys[t.id].push(v.value);
});
});
return ys;
};
c3_chart_internal_fn.checkValueInTargets = function (targets, checker) {
var ids = Object.keys(targets), i, j, values;
for (i = 0; i < ids.length; i++) {
values = targets[ids[i]].values;
for (j = 0; j < values.length; j++) {
if (checker(values[j].value)) {
return true;
}
}
}
return false;
};
c3_chart_internal_fn.hasNegativeValueInTargets = function (targets) {
return this.checkValueInTargets(targets, function (v) { return v < 0; });
};
c3_chart_internal_fn.hasPositiveValueInTargets = function (targets) {
return this.checkValueInTargets(targets, function (v) { return v > 0; });
};
c3_chart_internal_fn.isOrderDesc = function () {
var config = this.config;
return typeof(config.data_order) === 'string' && config.data_order.toLowerCase() === 'desc';
};
c3_chart_internal_fn.isOrderAsc = function () {
var config = this.config;
return typeof(config.data_order) === 'string' && config.data_order.toLowerCase() === 'asc';
};
c3_chart_internal_fn.orderTargets = function (targets) {
var $$ = this, config = $$.config, orderAsc = $$.isOrderAsc(), orderDesc = $$.isOrderDesc();
if (orderAsc || orderDesc) {
targets.sort(function (t1, t2) {
var reducer = function (p, c) { return p + Math.abs(c.value); };
var t1Sum = t1.values.reduce(reducer, 0),
t2Sum = t2.values.reduce(reducer, 0);
return orderAsc ? t2Sum - t1Sum : t1Sum - t2Sum;
});
} else if (isFunction(config.data_order)) {
targets.sort(config.data_order);
}
return targets;
};
c3_chart_internal_fn.filterByX = function (targets, x) {
return this.d3.merge(targets.map(function (t) { return t.values; })).filter(function (v) { return v.x - x === 0; });
};
c3_chart_internal_fn.filterRemoveNull = function (data) {
return data.filter(function (d) { return isValue(d.value); });
};
c3_chart_internal_fn.filterByXDomain = function (targets, xDomain) {
return targets.map(function (t) {
return {
id: t.id,
id_org: t.id_org,
values: t.values.filter(function (v) {
return xDomain[0] <= v.x && v.x <= xDomain[1];
})
};
});
};
c3_chart_internal_fn.hasDataLabel = function () {
var config = this.config;
if (typeof config.data_labels === 'boolean' && config.data_labels) {
return true;
} else if (typeof config.data_labels === 'object' && notEmpty(config.data_labels)) {
return true;
}
return false;
};
c3_chart_internal_fn.getDataLabelLength = function (min, max, key) {
var $$ = this,
lengths = [0, 0], paddingCoef = 1.3;
$$.selectChart.select('svg').selectAll('.dummy')
.data([min, max])
.enter().append('text')
.text(function (d) { return $$.dataLabelFormat(d.id)(d); })
.each(function (d, i) {
lengths[i] = this.getBoundingClientRect()[key] * paddingCoef;
})
.remove();
return lengths;
};
c3_chart_internal_fn.isNoneArc = function (d) {
return this.hasTarget(this.data.targets, d.id);
},
c3_chart_internal_fn.isArc = function (d) {
return 'data' in d && this.hasTarget(this.data.targets, d.data.id);
};
c3_chart_internal_fn.findSameXOfValues = function (values, index) {
var i, targetX = values[index].x, sames = [];
for (i = index - 1; i >= 0; i--) {
if (targetX !== values[i].x) { break; }
sames.push(values[i]);
}
for (i = index; i < values.length; i++) {
if (targetX !== values[i].x) { break; }
sames.push(values[i]);
}
return sames;
};
c3_chart_internal_fn.findClosestFromTargets = function (targets, pos) {
var $$ = this, candidates;
candidates = targets.map(function (target) {
return $$.findClosest(target.values, pos);
});
return $$.findClosest(candidates, pos);
};
c3_chart_internal_fn.findClosest = function (values, pos) {
var $$ = this, minDist = $$.config.point_sensitivity, closest;
values.filter(function (v) { return v && $$.isBarType(v.id); }).forEach(function (v) {
var shape = $$.main.select('.' + CLASS.bars + $$.getTargetSelectorSuffix(v.id) + ' .' + CLASS.bar + '-' + v.index).node();
if (!closest && $$.isWithinBar(shape)) {
closest = v;
}
});
values.filter(function (v) { return v && !$$.isBarType(v.id); }).forEach(function (v) {
var d = $$.dist(v, pos);
if (d < minDist) {
minDist = d;
closest = v;
}
});
return closest;
};
c3_chart_internal_fn.dist = function (data, pos) {
var $$ = this, config = $$.config,
xIndex = config.axis_rotated ? 1 : 0,
yIndex = config.axis_rotated ? 0 : 1,
y = $$.circleY(data, data.index),
x = $$.x(data.x);
return Math.sqrt(Math.pow(x - pos[xIndex], 2) + Math.pow(y - pos[yIndex], 2));
};
c3_chart_internal_fn.convertValuesToStep = function (values) {
var converted = [].concat(values), i;
if (!this.isCategorized()) {
return values;
}
for (i = values.length + 1; 0 < i; i--) {
converted[i] = converted[i - 1];
}
converted[0] = {
x: converted[0].x - 1,
value: converted[0].value,
id: converted[0].id
};
converted[values.length + 1] = {
x: converted[values.length].x + 1,
value: converted[values.length].value,
id: converted[values.length].id
};
return converted;
};
c3_chart_internal_fn.updateDataAttributes = function (name, attrs) {
var $$ = this, config = $$.config, current = config['data_' + name];
if (typeof attrs === 'undefined') { return current; }
Object.keys(attrs).forEach(function (id) {
current[id] = attrs[id];
});
$$.redraw({withLegend: true});
return current;
};
c3_chart_internal_fn.convertUrlToData = function (url, mimeType, keys, done) {
var $$ = this, type = mimeType ? mimeType : 'csv';
$$.d3.xhr(url, function (error, data) {
var d;
if (!data) {
throw new Error(error.responseURL + ' ' + error.status + ' (' + error.statusText + ')');
}
if (type === 'json') {
d = $$.convertJsonToData(JSON.parse(data.response), keys);
} else if (type === 'tsv') {
d = $$.convertTsvToData(data.response);
} else {
d = $$.convertCsvToData(data.response);
}
done.call($$, d);
});
};
c3_chart_internal_fn.convertXsvToData = function (xsv, parser) {
var rows = parser.parseRows(xsv), d;
if (rows.length === 1) {
d = [{}];
rows[0].forEach(function (id) {
d[0][id] = null;
});
} else {
d = parser.parse(xsv);
}
return d;
};
c3_chart_internal_fn.convertCsvToData = function (csv) {
return this.convertXsvToData(csv, this.d3.csv);
};
c3_chart_internal_fn.convertTsvToData = function (tsv) {
return this.convertXsvToData(tsv, this.d3.tsv);
};
c3_chart_internal_fn.convertJsonToData = function (json, keys) {
var $$ = this,
new_rows = [], targetKeys, data;
if (keys) {
if (keys.x) {
targetKeys = keys.value.concat(keys.x);
$$.config.data_x = keys.x;
} else {
targetKeys = keys.value;
}
new_rows.push(targetKeys);
json.forEach(function (o) {
var new_row = [];
targetKeys.forEach(function (key) {
var v = isUndefined(o[key]) ? null : o[key];
new_row.push(v);
});
new_rows.push(new_row);
});
data = $$.convertRowsToData(new_rows);
} else {
Object.keys(json).forEach(function (key) {
new_rows.push([key].concat(json[key]));
});
data = $$.convertColumnsToData(new_rows);
}
return data;
};
c3_chart_internal_fn.convertRowsToData = function (rows) {
var keys = rows[0], new_row = {}, new_rows = [], i, j;
for (i = 1; i < rows.length; i++) {
new_row = {};
for (j = 0; j < rows[i].length; j++) {
if (isUndefined(rows[i][j])) {
throw new Error("Source data is missing a component at (" + i + "," + j + ")!");
}
new_row[keys[j]] = rows[i][j];
}
new_rows.push(new_row);
}
return new_rows;
};
c3_chart_internal_fn.convertColumnsToData = function (columns) {
var new_rows = [], i, j, key;
for (i = 0; i < columns.length; i++) {
key = columns[i][0];
for (j = 1; j < columns[i].length; j++) {
if (isUndefined(new_rows[j - 1])) {
new_rows[j - 1] = {};
}
if (isUndefined(columns[i][j])) {
throw new Error("Source data is missing a component at (" + i + "," + j + ")!");
}
new_rows[j - 1][key] = columns[i][j];
}
}
return new_rows;
};
c3_chart_internal_fn.convertDataToTargets = function (data, appendXs) {
var $$ = this, config = $$.config,
ids = $$.d3.keys(data[0]).filter($$.isNotX, $$),
xs = $$.d3.keys(data[0]).filter($$.isX, $$),
targets;
ids.forEach(function (id) {
var xKey = $$.getXKey(id);
if ($$.isCustomX() || $$.isTimeSeries()) {
if (xs.indexOf(xKey) >= 0) {
$$.data.xs[id] = (appendXs && $$.data.xs[id] ? $$.data.xs[id] : []).concat(
data.map(function (d) { return d[xKey]; })
.filter(isValue)
.map(function (rawX, i) { return $$.generateTargetX(rawX, id, i); })
);
}
else if (config.data_x) {
$$.data.xs[id] = $$.getOtherTargetXs();
}
else if (notEmpty(config.data_xs)) {
$$.data.xs[id] = $$.getXValuesOfXKey(xKey, $$.data.targets);
}
} else {
$$.data.xs[id] = data.map(function (d, i) { return i; });
}
});
ids.forEach(function (id) {
if (!$$.data.xs[id]) {
throw new Error('x is not defined for id = "' + id + '".');
}
});
targets = ids.map(function (id, index) {
var convertedId = config.data_idConverter(id);
return {
id: convertedId,
id_org: id,
values: data.map(function (d, i) {
var xKey = $$.getXKey(id), rawX = d[xKey], x = $$.generateTargetX(rawX, id, i),
value = d[id] !== null && !isNaN(d[id]) ? +d[id] : null;
if ($$.isCustomX() && $$.isCategorized() && index === 0 && rawX) {
if (i === 0) { config.axis_x_categories = []; }
config.axis_x_categories.push(rawX);
}
if (isUndefined(d[id]) || $$.data.xs[id].length <= i) {
x = undefined;
}
return {x: x, value: value, id: convertedId};
}).filter(function (v) { return isDefined(v.x); })
};
});
targets.forEach(function (t) {
var i;
if (config.data_xSort) {
t.values = t.values.sort(function (v1, v2) {
var x1 = v1.x || v1.x === 0 ? v1.x : Infinity,
x2 = v2.x || v2.x === 0 ? v2.x : Infinity;
return x1 - x2;
});
}
i = 0;
t.values.forEach(function (v) {
v.index = i++;
});
$$.data.xs[t.id].sort(function (v1, v2) {
return v1 - v2;
});
});
$$.hasNegativeValue = $$.hasNegativeValueInTargets(targets);
$$.hasPositiveValue = $$.hasPositiveValueInTargets(targets);
if (config.data_type) {
$$.setTargetType($$.mapToIds(targets).filter(function (id) { return ! (id in config.data_types); }), config.data_type);
}
targets.forEach(function (d) {
$$.addCache(d.id_org, d);
});
return targets;
};
c3_chart_internal_fn.load = function (targets, args) {
var $$ = this;
if (targets) {
if (args.filter) {
targets = targets.filter(args.filter);
}
if (args.type || args.types) {
targets.forEach(function (t) {
var type = args.types && args.types[t.id] ? args.types[t.id] : args.type;
$$.setTargetType(t.id, type);
});
}
$$.data.targets.forEach(function (d) {
for (var i = 0; i < targets.length; i++) {
if (d.id === targets[i].id) {
d.values = targets[i].values;
targets.splice(i, 1);
break;
}
}
});
$$.data.targets = $$.data.targets.concat(targets);
}
$$.updateTargets($$.data.targets);
$$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true, withLegend: true});
if (args.done) { args.done(); }
};
c3_chart_internal_fn.loadFromArgs = function (args) {
var $$ = this;
if (args.data) {
$$.load($$.convertDataToTargets(args.data), args);
}
else if (args.url) {
$$.convertUrlToData(args.url, args.mimeType, args.keys, function (data) {
$$.load($$.convertDataToTargets(data), args);
});
}
else if (args.json) {
$$.load($$.convertDataToTargets($$.convertJsonToData(args.json, args.keys)), args);
}
else if (args.rows) {
$$.load($$.convertDataToTargets($$.convertRowsToData(args.rows)), args);
}
else if (args.columns) {
$$.load($$.convertDataToTargets($$.convertColumnsToData(args.columns)), args);
}
else {
$$.load(null, args);
}
};
c3_chart_internal_fn.unload = function (targetIds, done) {
var $$ = this;
if (!done) {
done = function () {};
}
targetIds = targetIds.filter(function (id) { return $$.hasTarget($$.data.targets, id); });
if (!targetIds || targetIds.length === 0) {
done();
return;
}
$$.svg.selectAll(targetIds.map(function (id) { return $$.selectorTarget(id); }))
.transition()
.style('opacity', 0)
.remove()
.call($$.endall, done);
targetIds.forEach(function (id) {
$$.withoutFadeIn[id] = false;
if ($$.legend) {
$$.legend.selectAll('.' + CLASS.legendItem + $$.getTargetSelectorSuffix(id)).remove();
}
$$.data.targets = $$.data.targets.filter(function (t) {
return t.id !== id;
});
});
};
c3_chart_internal_fn.categoryName = function (i) {
var config = this.config;
return i < config.axis_x_categories.length ? config.axis_x_categories[i] : i;
};
c3_chart_internal_fn.initEventRect = function () {
var $$ = this;
$$.main.select('.' + CLASS.chart).append("g")
.attr("class", CLASS.eventRects)
.style('fill-opacity', 0);
};
c3_chart_internal_fn.redrawEventRect = function () {
var $$ = this, config = $$.config,
eventRectUpdate, maxDataCountTarget,
isMultipleX = $$.isMultipleX();
var eventRects = $$.main.select('.' + CLASS.eventRects)
.style('cursor', config.zoom_enabled ? config.axis_rotated ? 'ns-resize' : 'ew-resize' : null)
.classed(CLASS.eventRectsMultiple, isMultipleX)
.classed(CLASS.eventRectsSingle, !isMultipleX);
eventRects.selectAll('.' + CLASS.eventRect).remove();
$$.eventRect = eventRects.selectAll('.' + CLASS.eventRect);
if (isMultipleX) {
eventRectUpdate = $$.eventRect.data([0]);
$$.generateEventRectsForMultipleXs(eventRectUpdate.enter());
$$.updateEventRect(eventRectUpdate);
}
else {
maxDataCountTarget = $$.getMaxDataCountTarget($$.data.targets);
eventRects.datum(maxDataCountTarget ? maxDataCountTarget.values : []);
$$.eventRect = eventRects.selectAll('.' + CLASS.eventRect);
eventRectUpdate = $$.eventRect.data(function (d) { return d; });
$$.generateEventRectsForSingleX(eventRectUpdate.enter());
$$.updateEventRect(eventRectUpdate);
eventRectUpdate.exit().remove();
}
};
c3_chart_internal_fn.updateEventRect = function (eventRectUpdate) {
var $$ = this, config = $$.config,
x, y, w, h, rectW, rectX;
eventRectUpdate = eventRectUpdate || $$.eventRect.data(function (d) { return d; });
if ($$.isMultipleX()) {
x = 0;
y = 0;
w = $$.width;
h = $$.height;
}
else {
if (($$.isCustomX() || $$.isTimeSeries()) && !$$.isCategorized()) {
$$.updateXs();
rectW = function (d) {
var prevX = $$.getPrevX(d.index), nextX = $$.getNextX(d.index);
if (prevX === null && nextX === null) {
return config.axis_rotated ? $$.height : $$.width;
}
if (prevX === null) { prevX = $$.x.domain()[0]; }
if (nextX === null) { nextX = $$.x.domain()[1]; }
return Math.max(0, ($$.x(nextX) - $$.x(prevX)) / 2);
};
rectX = function (d) {
var prevX = $$.getPrevX(d.index), nextX = $$.getNextX(d.index),
thisX = $$.data.xs[d.id][d.index];
if (prevX === null && nextX === null) {
return 0;
}
if (prevX === null) { prevX = $$.x.domain()[0]; }
return ($$.x(thisX) + $$.x(prevX)) / 2;
};
} else {
rectW = $$.getEventRectWidth();
rectX = function (d) {
return $$.x(d.x) - (rectW / 2);
};
}
x = config.axis_rotated ? 0 : rectX;
y = config.axis_rotated ? rectX : 0;
w = config.axis_rotated ? $$.width : rectW;
h = config.axis_rotated ? rectW : $$.height;
}
eventRectUpdate
.attr('class', $$.classEvent.bind($$))
.attr("x", x)
.attr("y", y)
.attr("width", w)
.attr("height", h);
};
c3_chart_internal_fn.generateEventRectsForSingleX = function (eventRectEnter) {
var $$ = this, d3 = $$.d3, config = $$.config;
eventRectEnter.append("rect")
.attr("class", $$.classEvent.bind($$))
.style("cursor", config.data_selection_enabled && config.data_selection_grouped ? "pointer" : null)
.on('mouseover', function (d) {
var index = d.index;
if ($$.dragging || $$.flowing) { return; }
if ($$.hasArcType()) { return; }
if (config.point_focus_expand_enabled) { $$.expandCircles(index, null, true); }
$$.expandBars(index, null, true);
$$.main.selectAll('.' + CLASS.shape + '-' + index).each(function (d) {
config.data_onmouseover.call($$.api, d);
});
})
.on('mouseout', function (d) {
var index = d.index;
if (!$$.config) { return; }
if ($$.hasArcType()) { return; }
$$.hideXGridFocus();
$$.hideTooltip();
$$.unexpandCircles();
$$.unexpandBars();
$$.main.selectAll('.' + CLASS.shape + '-' + index).each(function (d) {
config.data_onmouseout.call($$.api, d);
});
})
.on('mousemove', function (d) {
var selectedData, index = d.index,
eventRect = $$.svg.select('.' + CLASS.eventRect + '-' + index);
if ($$.dragging || $$.flowing) { return; }
if ($$.hasArcType()) { return; }
if ($$.isStepType(d) && $$.config.line_step_type === 'step-after' && d3.mouse(this)[0] < $$.x($$.getXValue(d.id, index))) {
index -= 1;
}
selectedData = $$.filterTargetsToShow($$.data.targets).map(function (t) {
return $$.addName($$.getValueOnIndex(t.values, index));
});
if (config.tooltip_grouped) {
$$.showTooltip(selectedData, this);
$$.showXGridFocus(selectedData);
}
if (config.tooltip_grouped && (!config.data_selection_enabled || config.data_selection_grouped)) {
return;
}
$$.main.selectAll('.' + CLASS.shape + '-' + index)
.each(function () {
d3.select(this).classed(CLASS.EXPANDED, true);
if (config.data_selection_enabled) {
eventRect.style('cursor', config.data_selection_grouped ? 'pointer' : null);
}
if (!config.tooltip_grouped) {
$$.hideXGridFocus();
$$.hideTooltip();
if (!config.data_selection_grouped) {
$$.unexpandCircles(index);
$$.unexpandBars(index);
}
}
})
.filter(function (d) {
return $$.isWithinShape(this, d);
})
.each(function (d) {
if (config.data_selection_enabled && (config.data_selection_grouped || config.data_selection_isselectable(d))) {
eventRect.style('cursor', 'pointer');
}
if (!config.tooltip_grouped) {
$$.showTooltip([d], this);
$$.showXGridFocus([d]);
if (config.point_focus_expand_enabled) { $$.expandCircles(index, d.id, true); }
$$.expandBars(index, d.id, true);
}
});
})
.on('click', function (d) {
var index = d.index;
if ($$.hasArcType() || !$$.toggleShape) { return; }
if ($$.cancelClick) {
$$.cancelClick = false;
return;
}
if ($$.isStepType(d) && config.line_step_type === 'step-after' && d3.mouse(this)[0] < $$.x($$.getXValue(d.id, index))) {
index -= 1;
}
$$.main.selectAll('.' + CLASS.shape + '-' + index).each(function (d) {
if (config.data_selection_grouped || $$.isWithinShape(this, d)) {
$$.toggleShape(this, d, index);
$$.config.data_onclick.call($$.api, d, this);
}
});
})
.call(
config.data_selection_draggable && $$.drag ? (
d3.behavior.drag().origin(Object)
.on('drag', function () { $$.drag(d3.mouse(this)); })
.on('dragstart', function () { $$.dragstart(d3.mouse(this)); })
.on('dragend', function () { $$.dragend(); })
) : function () {}
);
};
c3_chart_internal_fn.generateEventRectsForMultipleXs = function (eventRectEnter) {
var $$ = this, d3 = $$.d3, config = $$.config;
function mouseout() {
$$.svg.select('.' + CLASS.eventRect).style('cursor', null);
$$.hideXGridFocus();
$$.hideTooltip();
$$.unexpandCircles();
$$.unexpandBars();
}
eventRectEnter.append('rect')
.attr('x', 0)
.attr('y', 0)
.attr('width', $$.width)
.attr('height', $$.height)
.attr('class', CLASS.eventRect)
.on('mouseout', function () {
if (!$$.config) { return; }
if ($$.hasArcType()) { return; }
mouseout();
})
.on('mousemove', function () {
var targetsToShow = $$.filterTargetsToShow($$.data.targets);
var mouse, closest, sameXData, selectedData;
if ($$.dragging) { return; }
if ($$.hasArcType(targetsToShow)) { return; }
mouse = d3.mouse(this);
closest = $$.findClosestFromTargets(targetsToShow, mouse);
if ($$.mouseover && (!closest || closest.id !== $$.mouseover.id)) {
config.data_onmouseout.call($$.api, $$.mouseover);
$$.mouseover = undefined;
}
if (! closest) {
mouseout();
return;
}
if ($$.isScatterType(closest) || !config.tooltip_grouped) {
sameXData = [closest];
} else {
sameXData = $$.filterByX(targetsToShow, closest.x);
}
selectedData = sameXData.map(function (d) {
return $$.addName(d);
});
$$.showTooltip(selectedData, this);
if (config.point_focus_expand_enabled) {
$$.expandCircles(closest.index, closest.id, true);
}
$$.expandBars(closest.index, closest.id, true);
$$.showXGridFocus(selectedData);
if ($$.isBarType(closest.id) || $$.dist(closest, mouse) < config.point_sensitivity) {
$$.svg.select('.' + CLASS.eventRect).style('cursor', 'pointer');
if (!$$.mouseover) {
config.data_onmouseover.call($$.api, closest);
$$.mouseover = closest;
}
}
})
.on('click', function () {
var targetsToShow = $$.filterTargetsToShow($$.data.targets);
var mouse, closest;
if ($$.hasArcType(targetsToShow)) { return; }
mouse = d3.mouse(this);
closest = $$.findClosestFromTargets(targetsToShow, mouse);
if (! closest) { return; }
if ($$.isBarType(closest.id) || $$.dist(closest, mouse) < config.point_sensitivity) {
$$.main.selectAll('.' + CLASS.shapes + $$.getTargetSelectorSuffix(closest.id)).selectAll('.' + CLASS.shape + '-' + closest.index).each(function () {
if (config.data_selection_grouped || $$.isWithinShape(this, closest)) {
$$.toggleShape(this, closest, closest.index);
$$.config.data_onclick.call($$.api, closest, this);
}
});
}
})
.call(
config.data_selection_draggable && $$.drag ? (
d3.behavior.drag().origin(Object)
.on('drag', function () { $$.drag(d3.mouse(this)); })
.on('dragstart', function () { $$.dragstart(d3.mouse(this)); })
.on('dragend', function () { $$.dragend(); })
) : function () {}
);
};
c3_chart_internal_fn.dispatchEvent = function (type, index, mouse) {
var $$ = this,
selector = '.' + CLASS.eventRect + (!$$.isMultipleX() ? '-' + index : ''),
eventRect = $$.main.select(selector).node(),
box = eventRect.getBoundingClientRect(),
x = box.left + (mouse ? mouse[0] : 0),
y = box.top + (mouse ? mouse[1] : 0),
event = document.createEvent("MouseEvents");
event.initMouseEvent(type, true, true, window, 0, x, y, x, y,
false, false, false, false, 0, null);
eventRect.dispatchEvent(event);
};
c3_chart_internal_fn.getCurrentWidth = function () {
var $$ = this, config = $$.config;
return config.size_width ? config.size_width : $$.getParentWidth();
};
c3_chart_internal_fn.getCurrentHeight = function () {
var $$ = this, config = $$.config,
h = config.size_height ? config.size_height : $$.getParentHeight();
return h > 0 ? h : 320 / ($$.hasType('gauge') ? 2 : 1);
};
c3_chart_internal_fn.getCurrentPaddingTop = function () {
var $$ = this,
config = $$.config,
padding = isValue(config.padding_top) ? config.padding_top : 0;
if ($$.title && $$.title.node()) {
padding += $$.getTitlePadding();
}
return padding;
};
c3_chart_internal_fn.getCurrentPaddingBottom = function () {
var config = this.config;
return isValue(config.padding_bottom) ? config.padding_bottom : 0;
};
c3_chart_internal_fn.getCurrentPaddingLeft = function (withoutRecompute) {
var $$ = this, config = $$.config;
if (isValue(config.padding_left)) {
return config.padding_left;
} else if (config.axis_rotated) {
return !config.axis_x_show ? 1 : Math.max(ceil10($$.getAxisWidthByAxisId('x', withoutRecompute)), 40);
} else if (!config.axis_y_show || config.axis_y_inner) {
return $$.axis.getYAxisLabelPosition().isOuter ? 30 : 1;
} else {
return ceil10($$.getAxisWidthByAxisId('y', withoutRecompute));
}
};
c3_chart_internal_fn.getCurrentPaddingRight = function () {
var $$ = this, config = $$.config,
defaultPadding = 10, legendWidthOnRight = $$.isLegendRight ? $$.getLegendWidth() + 20 : 0;
if (isValue(config.padding_right)) {
return config.padding_right + 1;
} else if (config.axis_rotated) {
return defaultPadding + legendWidthOnRight;
} else if (!config.axis_y2_show || config.axis_y2_inner) {
return 2 + legendWidthOnRight + ($$.axis.getY2AxisLabelPosition().isOuter ? 20 : 0);
} else {
return ceil10($$.getAxisWidthByAxisId('y2')) + legendWidthOnRight;
}
};
c3_chart_internal_fn.getParentRectValue = function (key) {
var parent = this.selectChart.node(), v;
while (parent && parent.tagName !== 'BODY') {
try {
v = parent.getBoundingClientRect()[key];
} catch(e) {
if (key === 'width') {
v = parent.offsetWidth;
}
}
if (v) {
break;
}
parent = parent.parentNode;
}
return v;
};
c3_chart_internal_fn.getParentWidth = function () {
return this.getParentRectValue('width');
};
c3_chart_internal_fn.getParentHeight = function () {
var h = this.selectChart.style('height');
return h.indexOf('px') > 0 ? +h.replace('px', '') : 0;
};
c3_chart_internal_fn.getSvgLeft = function (withoutRecompute) {
var $$ = this, config = $$.config,
hasLeftAxisRect = config.axis_rotated || (!config.axis_rotated && !config.axis_y_inner),
leftAxisClass = config.axis_rotated ? CLASS.axisX : CLASS.axisY,
leftAxis = $$.main.select('.' + leftAxisClass).node(),
svgRect = leftAxis && hasLeftAxisRect ? leftAxis.getBoundingClientRect() : {right: 0},
chartRect = $$.selectChart.node().getBoundingClientRect(),
hasArc = $$.hasArcType(),
svgLeft = svgRect.right - chartRect.left - (hasArc ? 0 : $$.getCurrentPaddingLeft(withoutRecompute));
return svgLeft > 0 ? svgLeft : 0;
};
c3_chart_internal_fn.getAxisWidthByAxisId = function (id, withoutRecompute) {
var $$ = this, position = $$.axis.getLabelPositionById(id);
return $$.axis.getMaxTickWidth(id, withoutRecompute) + (position.isInner ? 20 : 40);
};
c3_chart_internal_fn.getHorizontalAxisHeight = function (axisId) {
var $$ = this, config = $$.config, h = 30;
if (axisId === 'x' && !config.axis_x_show) { return 8; }
if (axisId === 'x' && config.axis_x_height) { return config.axis_x_height; }
if (axisId === 'y' && !config.axis_y_show) { return config.legend_show && !$$.isLegendRight && !$$.isLegendInset ? 10 : 1; }
if (axisId === 'y2' && !config.axis_y2_show) { return $$.rotated_padding_top; }
if (axisId === 'x' && !config.axis_rotated && config.axis_x_tick_rotate) {
h = 30 + $$.axis.getMaxTickWidth(axisId) * Math.cos(Math.PI * (90 - config.axis_x_tick_rotate) / 180);
}
return h + ($$.axis.getLabelPositionById(axisId).isInner ? 0 : 10) + (axisId === 'y2' ? -10 : 0);
};
c3_chart_internal_fn.getEventRectWidth = function () {
return Math.max(0, this.xAxis.tickInterval());
};
c3_chart_internal_fn.getShapeIndices = function (typeFilter) {
var $$ = this, config = $$.config,
indices = {}, i = 0, j, k;
$$.filterTargetsToShow($$.data.targets.filter(typeFilter, $$)).forEach(function (d) {
for (j = 0; j < config.data_groups.length; j++) {
if (config.data_groups[j].indexOf(d.id) < 0) { continue; }
for (k = 0; k < config.data_groups[j].length; k++) {
if (config.data_groups[j][k] in indices) {
indices[d.id] = indices[config.data_groups[j][k]];
break;
}
}
}
if (isUndefined(indices[d.id])) { indices[d.id] = i++; }
});
indices.__max__ = i - 1;
return indices;
};
c3_chart_internal_fn.getShapeX = function (offset, targetsNum, indices, isSub) {
var $$ = this, scale = isSub ? $$.subX : $$.x;
return function (d) {
var index = d.id in indices ? indices[d.id] : 0;
return d.x || d.x === 0 ? scale(d.x) - offset * (targetsNum / 2 - index) : 0;
};
};
c3_chart_internal_fn.getShapeY = function (isSub) {
var $$ = this;
return function (d) {
var scale = isSub ? $$.getSubYScale(d.id) : $$.getYScale(d.id);
return scale(d.value);
};
};
c3_chart_internal_fn.getShapeOffset = function (typeFilter, indices, isSub) {
var $$ = this,
targets = $$.orderTargets($$.filterTargetsToShow($$.data.targets.filter(typeFilter, $$))),
targetIds = targets.map(function (t) { return t.id; });
return function (d, i) {
var scale = isSub ? $$.getSubYScale(d.id) : $$.getYScale(d.id),
y0 = scale(0), offset = y0;
targets.forEach(function (t) {
var values = $$.isStepType(d) ? $$.convertValuesToStep(t.values) : t.values;
if (t.id === d.id || indices[t.id] !== indices[d.id]) { return; }
if (targetIds.indexOf(t.id) < targetIds.indexOf(d.id)) {
if (typeof values[i] === 'undefined' || +values[i].x !== +d.x) {
i = -1;
values.forEach(function (v, j) {
if (v.x === d.x) {
i = j;
}
});
}
if (i in values && values[i].value * d.value >= 0) {
offset += scale(values[i].value) - y0;
}
}
});
return offset;
};
};
c3_chart_internal_fn.isWithinShape = function (that, d) {
var $$ = this,
shape = $$.d3.select(that), isWithin;
if (!$$.isTargetToShow(d.id)) {
isWithin = false;
}
else if (that.nodeName === 'circle') {
isWithin = $$.isStepType(d) ? $$.isWithinStep(that, $$.getYScale(d.id)(d.value)) : $$.isWithinCircle(that, $$.pointSelectR(d) * 1.5);
}
else if (that.nodeName === 'path') {
isWithin = shape.classed(CLASS.bar) ? $$.isWithinBar(that) : true;
}
return isWithin;
};
c3_chart_internal_fn.getInterpolate = function (d) {
var $$ = this,
interpolation = $$.isInterpolationType($$.config.spline_interpolation_type) ? $$.config.spline_interpolation_type : 'cardinal';
return $$.isSplineType(d) ? interpolation : $$.isStepType(d) ? $$.config.line_step_type : "linear";
};
c3_chart_internal_fn.initLine = function () {
var $$ = this;
$$.main.select('.' + CLASS.chart).append("g")
.attr("class", CLASS.chartLines);
};
c3_chart_internal_fn.updateTargetsForLine = function (targets) {
var $$ = this, config = $$.config,
mainLineUpdate, mainLineEnter,
classChartLine = $$.classChartLine.bind($$),
classLines = $$.classLines.bind($$),
classAreas = $$.classAreas.bind($$),
classCircles = $$.classCircles.bind($$),
classFocus = $$.classFocus.bind($$);
mainLineUpdate = $$.main.select('.' + CLASS.chartLines).selectAll('.' + CLASS.chartLine)
.data(targets)
.attr('class', function (d) { return classChartLine(d) + classFocus(d); });
mainLineEnter = mainLineUpdate.enter().append('g')
.attr('class', classChartLine)
.style('opacity', 0)
.style("pointer-events", "none");
mainLineEnter.append('g')
.attr("class", classLines);
mainLineEnter.append('g')
.attr('class', classAreas);
mainLineEnter.append('g')
.attr("class", function (d) { return $$.generateClass(CLASS.selectedCircles, d.id); });
mainLineEnter.append('g')
.attr("class", classCircles)
.style("cursor", function (d) { return config.data_selection_isselectable(d) ? "pointer" : null; });
targets.forEach(function (t) {
$$.main.selectAll('.' + CLASS.selectedCircles + $$.getTargetSelectorSuffix(t.id)).selectAll('.' + CLASS.selectedCircle).each(function (d) {
d.value = t.values[d.index].value;
});
});
};
c3_chart_internal_fn.updateLine = function (durationForExit) {
var $$ = this;
$$.mainLine = $$.main.selectAll('.' + CLASS.lines).selectAll('.' + CLASS.line)
.data($$.lineData.bind($$));
$$.mainLine.enter().append('path')
.attr('class', $$.classLine.bind($$))
.style("stroke", $$.color);
$$.mainLine
.style("opacity", $$.initialOpacity.bind($$))
.style('shape-rendering', function (d) { return $$.isStepType(d) ? 'crispEdges' : ''; })
.attr('transform', null);
$$.mainLine.exit().transition().duration(durationForExit)
.style('opacity', 0)
.remove();
};
c3_chart_internal_fn.redrawLine = function (drawLine, withTransition) {
return [
(withTransition ? this.mainLine.transition(Math.random().toString()) : this.mainLine)
.attr("d", drawLine)
.style("stroke", this.color)
.style("opacity", 1)
];
};
c3_chart_internal_fn.generateDrawLine = function (lineIndices, isSub) {
var $$ = this, config = $$.config,
line = $$.d3.svg.line(),
getPoints = $$.generateGetLinePoints(lineIndices, isSub),
yScaleGetter = isSub ? $$.getSubYScale : $$.getYScale,
xValue = function (d) { return (isSub ? $$.subxx : $$.xx).call($$, d); },
yValue = function (d, i) {
return config.data_groups.length > 0 ? getPoints(d, i)[0][1] : yScaleGetter.call($$, d.id)(d.value);
};
line = config.axis_rotated ? line.x(yValue).y(xValue) : line.x(xValue).y(yValue);
if (!config.line_connectNull) { line = line.defined(function (d) { return d.value != null; }); }
return function (d) {
var values = config.line_connectNull ? $$.filterRemoveNull(d.values) : d.values,
x = isSub ? $$.x : $$.subX, y = yScaleGetter.call($$, d.id), x0 = 0, y0 = 0, path;
if ($$.isLineType(d)) {
if (config.data_regions[d.id]) {
path = $$.lineWithRegions(values, x, y, config.data_regions[d.id]);
} else {
if ($$.isStepType(d)) { values = $$.convertValuesToStep(values); }
path = line.interpolate($$.getInterpolate(d))(values);
}
} else {
if (values[0]) {
x0 = x(values[0].x);
y0 = y(values[0].value);
}
path = config.axis_rotated ? "M " + y0 + " " + x0 : "M " + x0 + " " + y0;
}
return path ? path : "M 0 0";
};
};
c3_chart_internal_fn.generateGetLinePoints = function (lineIndices, isSub) {
var $$ = this, config = $$.config,
lineTargetsNum = lineIndices.__max__ + 1,
x = $$.getShapeX(0, lineTargetsNum, lineIndices, !!isSub),
y = $$.getShapeY(!!isSub),
lineOffset = $$.getShapeOffset($$.isLineType, lineIndices, !!isSub),
yScale = isSub ? $$.getSubYScale : $$.getYScale;
return function (d, i) {
var y0 = yScale.call($$, d.id)(0),
offset = lineOffset(d, i) || y0,
posX = x(d), posY = y(d);
if (config.axis_rotated) {
if ((0 < d.value && posY < y0) || (d.value < 0 && y0 < posY)) { posY = y0; }
}
return [
[posX, posY - (y0 - offset)],
[posX, posY - (y0 - offset)],
[posX, posY - (y0 - offset)],
[posX, posY - (y0 - offset)]
];
};
};
c3_chart_internal_fn.lineWithRegions = function (d, x, y, _regions) {
var $$ = this, config = $$.config,
prev = -1, i, j,
s = "M", sWithRegion,
xp, yp, dx, dy, dd, diff, diffx2,
xOffset = $$.isCategorized() ? 0.5 : 0,
xValue, yValue,
regions = [];
function isWithinRegions(x, regions) {
var i;
for (i = 0; i < regions.length; i++) {
if (regions[i].start < x && x <= regions[i].end) { return true; }
}
return false;
}
if (isDefined(_regions)) {
for (i = 0; i < _regions.length; i++) {
regions[i] = {};
if (isUndefined(_regions[i].start)) {
regions[i].start = d[0].x;
} else {
regions[i].start = $$.isTimeSeries() ? $$.parseDate(_regions[i].start) : _regions[i].start;
}
if (isUndefined(_regions[i].end)) {
regions[i].end = d[d.length - 1].x;
} else {
regions[i].end = $$.isTimeSeries() ? $$.parseDate(_regions[i].end) : _regions[i].end;
}
}
}
xValue = config.axis_rotated ? function (d) { return y(d.value); } : function (d) { return x(d.x); };
yValue = config.axis_rotated ? function (d) { return x(d.x); } : function (d) { return y(d.value); };
function generateM(points) {
return 'M' + points[0][0] + ' ' + points[0][1] + ' ' + points[1][0] + ' ' + points[1][1];
}
if ($$.isTimeSeries()) {
sWithRegion = function (d0, d1, j, diff) {
var x0 = d0.x.getTime(), x_diff = d1.x - d0.x,
xv0 = new Date(x0 + x_diff * j),
xv1 = new Date(x0 + x_diff * (j + diff)),
points;
if (config.axis_rotated) {
points = [[y(yp(j)), x(xv0)], [y(yp(j + diff)), x(xv1)]];
} else {
points = [[x(xv0), y(yp(j))], [x(xv1), y(yp(j + diff))]];
}
return generateM(points);
};
} else {
sWithRegion = function (d0, d1, j, diff) {
var points;
if (config.axis_rotated) {
points = [[y(yp(j), true), x(xp(j))], [y(yp(j + diff), true), x(xp(j + diff))]];
} else {
points = [[x(xp(j), true), y(yp(j))], [x(xp(j + diff), true), y(yp(j + diff))]];
}
return generateM(points);
};
}
for (i = 0; i < d.length; i++) {
if (isUndefined(regions) || ! isWithinRegions(d[i].x, regions)) {
s += " " + xValue(d[i]) + " " + yValue(d[i]);
}
else {
xp = $$.getScale(d[i - 1].x + xOffset, d[i].x + xOffset, $$.isTimeSeries());
yp = $$.getScale(d[i - 1].value, d[i].value);
dx = x(d[i].x) - x(d[i - 1].x);
dy = y(d[i].value) - y(d[i - 1].value);
dd = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
diff = 2 / dd;
diffx2 = diff * 2;
for (j = diff; j <= 1; j += diffx2) {
s += sWithRegion(d[i - 1], d[i], j, diff);
}
}
prev = d[i].x;
}
return s;
};
c3_chart_internal_fn.updateArea = function (durationForExit) {
var $$ = this, d3 = $$.d3;
$$.mainArea = $$.main.selectAll('.' + CLASS.areas).selectAll('.' + CLASS.area)
.data($$.lineData.bind($$));
$$.mainArea.enter().append('path')
.attr("class", $$.classArea.bind($$))
.style("fill", $$.color)
.style("opacity", function () { $$.orgAreaOpacity = +d3.select(this).style('opacity'); return 0; });
$$.mainArea
.style("opacity", $$.orgAreaOpacity);
$$.mainArea.exit().transition().duration(durationForExit)
.style('opacity', 0)
.remove();
};
c3_chart_internal_fn.redrawArea = function (drawArea, withTransition) {
return [
(withTransition ? this.mainArea.transition(Math.random().toString()) : this.mainArea)
.attr("d", drawArea)
.style("fill", this.color)
.style("opacity", this.orgAreaOpacity)
];
};
c3_chart_internal_fn.generateDrawArea = function (areaIndices, isSub) {
var $$ = this, config = $$.config, area = $$.d3.svg.area(),
getPoints = $$.generateGetAreaPoints(areaIndices, isSub),
yScaleGetter = isSub ? $$.getSubYScale : $$.getYScale,
xValue = function (d) { return (isSub ? $$.subxx : $$.xx).call($$, d); },
value0 = function (d, i) {
return config.data_groups.length > 0 ? getPoints(d, i)[0][1] : yScaleGetter.call($$, d.id)($$.getAreaBaseValue(d.id));
},
value1 = function (d, i) {
return config.data_groups.length > 0 ? getPoints(d, i)[1][1] : yScaleGetter.call($$, d.id)(d.value);
};
area = config.axis_rotated ? area.x0(value0).x1(value1).y(xValue) : area.x(xValue).y0(value0).y1(value1);
if (!config.line_connectNull) {
area = area.defined(function (d) { return d.value !== null; });
}
return function (d) {
var values = config.line_connectNull ? $$.filterRemoveNull(d.values) : d.values,
x0 = 0, y0 = 0, path;
if ($$.isAreaType(d)) {
if ($$.isStepType(d)) { values = $$.convertValuesToStep(values); }
path = area.interpolate($$.getInterpolate(d))(values);
} else {
if (values[0]) {
x0 = $$.x(values[0].x);
y0 = $$.getYScale(d.id)(values[0].value);
}
path = config.axis_rotated ? "M " + y0 + " " + x0 : "M " + x0 + " " + y0;
}
return path ? path : "M 0 0";
};
};
c3_chart_internal_fn.getAreaBaseValue = function () {
return 0;
};
c3_chart_internal_fn.generateGetAreaPoints = function (areaIndices, isSub) {
var $$ = this, config = $$.config,
areaTargetsNum = areaIndices.__max__ + 1,
x = $$.getShapeX(0, areaTargetsNum, areaIndices, !!isSub),
y = $$.getShapeY(!!isSub),
areaOffset = $$.getShapeOffset($$.isAreaType, areaIndices, !!isSub),
yScale = isSub ? $$.getSubYScale : $$.getYScale;
return function (d, i) {
var y0 = yScale.call($$, d.id)(0),
offset = areaOffset(d, i) || y0,
posX = x(d), posY = y(d);
if (config.axis_rotated) {
if ((0 < d.value && posY < y0) || (d.value < 0 && y0 < posY)) { posY = y0; }
}
return [
[posX, offset],
[posX, posY - (y0 - offset)],
[posX, posY - (y0 - offset)],
[posX, offset]
];
};
};
c3_chart_internal_fn.updateCircle = function () {
var $$ = this;
$$.mainCircle = $$.main.selectAll('.' + CLASS.circles).selectAll('.' + CLASS.circle)
.data($$.lineOrScatterData.bind($$));
$$.mainCircle.enter().append("circle")
.attr("class", $$.classCircle.bind($$))
.attr("r", $$.pointR.bind($$))
.style("fill", $$.color);
$$.mainCircle
.style("opacity", $$.initialOpacityForCircle.bind($$));
$$.mainCircle.exit().remove();
};
c3_chart_internal_fn.redrawCircle = function (cx, cy, withTransition) {
var selectedCircles = this.main.selectAll('.' + CLASS.selectedCircle);
return [
(withTransition ? this.mainCircle.transition(Math.random().toString()) : this.mainCircle)
.style('opacity', this.opacityForCircle.bind(this))
.style("fill", this.color)
.attr("cx", cx)
.attr("cy", cy),
(withTransition ? selectedCircles.transition(Math.random().toString()) : selectedCircles)
.attr("cx", cx)
.attr("cy", cy)
];
};
c3_chart_internal_fn.circleX = function (d) {
return d.x || d.x === 0 ? this.x(d.x) : null;
};
c3_chart_internal_fn.updateCircleY = function () {
var $$ = this, lineIndices, getPoints;
if ($$.config.data_groups.length > 0) {
lineIndices = $$.getShapeIndices($$.isLineType),
getPoints = $$.generateGetLinePoints(lineIndices);
$$.circleY = function (d, i) {
return getPoints(d, i)[0][1];
};
} else {
$$.circleY = function (d) {
return $$.getYScale(d.id)(d.value);
};
}
};
c3_chart_internal_fn.getCircles = function (i, id) {
var $$ = this;
return (id ? $$.main.selectAll('.' + CLASS.circles + $$.getTargetSelectorSuffix(id)) : $$.main).selectAll('.' + CLASS.circle + (isValue(i) ? '-' + i : ''));
};
c3_chart_internal_fn.expandCircles = function (i, id, reset) {
var $$ = this,
r = $$.pointExpandedR.bind($$);
if (reset) { $$.unexpandCircles(); }
$$.getCircles(i, id)
.classed(CLASS.EXPANDED, true)
.attr('r', r);
};
c3_chart_internal_fn.unexpandCircles = function (i) {
var $$ = this,
r = $$.pointR.bind($$);
$$.getCircles(i)
.filter(function () { return $$.d3.select(this).classed(CLASS.EXPANDED); })
.classed(CLASS.EXPANDED, false)
.attr('r', r);
};
c3_chart_internal_fn.pointR = function (d) {
var $$ = this, config = $$.config;
return $$.isStepType(d) ? 0 : (isFunction(config.point_r) ? config.point_r(d) : config.point_r);
};
c3_chart_internal_fn.pointExpandedR = function (d) {
var $$ = this, config = $$.config;
return config.point_focus_expand_enabled ? (config.point_focus_expand_r ? config.point_focus_expand_r : $$.pointR(d) * 1.75) : $$.pointR(d);
};
c3_chart_internal_fn.pointSelectR = function (d) {
var $$ = this, config = $$.config;
return config.point_select_r ? config.point_select_r : $$.pointR(d) * 4;
};
c3_chart_internal_fn.isWithinCircle = function (that, r) {
var d3 = this.d3,
mouse = d3.mouse(that), d3_this = d3.select(that),
cx = +d3_this.attr("cx"), cy = +d3_this.attr("cy");
return Math.sqrt(Math.pow(cx - mouse[0], 2) + Math.pow(cy - mouse[1], 2)) < r;
};
c3_chart_internal_fn.isWithinStep = function (that, y) {
return Math.abs(y - this.d3.mouse(that)[1]) < 30;
};
c3_chart_internal_fn.initBar = function () {
var $$ = this;
$$.main.select('.' + CLASS.chart).append("g")
.attr("class", CLASS.chartBars);
};
c3_chart_internal_fn.updateTargetsForBar = function (targets) {
var $$ = this, config = $$.config,
mainBarUpdate, mainBarEnter,
classChartBar = $$.classChartBar.bind($$),
classBars = $$.classBars.bind($$),
classFocus = $$.classFocus.bind($$);
mainBarUpdate = $$.main.select('.' + CLASS.chartBars).selectAll('.' + CLASS.chartBar)
.data(targets)
.attr('class', function (d) { return classChartBar(d) + classFocus(d); });
mainBarEnter = mainBarUpdate.enter().append('g')
.attr('class', classChartBar)
.style('opacity', 0)
.style("pointer-events", "none");
mainBarEnter.append('g')
.attr("class", classBars)
.style("cursor", function (d) { return config.data_selection_isselectable(d) ? "pointer" : null; });
};
c3_chart_internal_fn.updateBar = function (durationForExit) {
var $$ = this,
barData = $$.barData.bind($$),
classBar = $$.classBar.bind($$),
initialOpacity = $$.initialOpacity.bind($$),
color = function (d) { return $$.color(d.id); };
$$.mainBar = $$.main.selectAll('.' + CLASS.bars).selectAll('.' + CLASS.bar)
.data(barData);
$$.mainBar.enter().append('path')
.attr("class", classBar)
.style("stroke", color)
.style("fill", color);
$$.mainBar
.style("opacity", initialOpacity);
$$.mainBar.exit().transition().duration(durationForExit)
.style('opacity', 0)
.remove();
};
c3_chart_internal_fn.redrawBar = function (drawBar, withTransition) {
return [
(withTransition ? this.mainBar.transition(Math.random().toString()) : this.mainBar)
.attr('d', drawBar)
.style("fill", this.color)
.style("opacity", 1)
];
};
c3_chart_internal_fn.getBarW = function (axis, barTargetsNum) {
var $$ = this, config = $$.config,
w = typeof config.bar_width === 'number' ? config.bar_width : barTargetsNum ? (axis.tickInterval() * config.bar_width_ratio) / barTargetsNum : 0;
return config.bar_width_max && w > config.bar_width_max ? config.bar_width_max : w;
};
c3_chart_internal_fn.getBars = function (i, id) {
var $$ = this;
return (id ? $$.main.selectAll('.' + CLASS.bars + $$.getTargetSelectorSuffix(id)) : $$.main).selectAll('.' + CLASS.bar + (isValue(i) ? '-' + i : ''));
};
c3_chart_internal_fn.expandBars = function (i, id, reset) {
var $$ = this;
if (reset) { $$.unexpandBars(); }
$$.getBars(i, id).classed(CLASS.EXPANDED, true);
};
c3_chart_internal_fn.unexpandBars = function (i) {
var $$ = this;
$$.getBars(i).classed(CLASS.EXPANDED, false);
};
c3_chart_internal_fn.generateDrawBar = function (barIndices, isSub) {
var $$ = this, config = $$.config,
getPoints = $$.generateGetBarPoints(barIndices, isSub);
return function (d, i) {
var points = getPoints(d, i);
var indexX = config.axis_rotated ? 1 : 0;
var indexY = config.axis_rotated ? 0 : 1;
var path = 'M ' + points[0][indexX] + ',' + points[0][indexY] + ' ' +
'L' + points[1][indexX] + ',' + points[1][indexY] + ' ' +
'L' + points[2][indexX] + ',' + points[2][indexY] + ' ' +
'L' + points[3][indexX] + ',' + points[3][indexY] + ' ' +
'z';
return path;
};
};
c3_chart_internal_fn.generateGetBarPoints = function (barIndices, isSub) {
var $$ = this,
axis = isSub ? $$.subXAxis : $$.xAxis,
barTargetsNum = barIndices.__max__ + 1,
barW = $$.getBarW(axis, barTargetsNum),
barX = $$.getShapeX(barW, barTargetsNum, barIndices, !!isSub),
barY = $$.getShapeY(!!isSub),
barOffset = $$.getShapeOffset($$.isBarType, barIndices, !!isSub),
yScale = isSub ? $$.getSubYScale : $$.getYScale;
return function (d, i) {
var y0 = yScale.call($$, d.id)(0),
offset = barOffset(d, i) || y0,
posX = barX(d), posY = barY(d);
if ($$.config.axis_rotated) {
if ((0 < d.value && posY < y0) || (d.value < 0 && y0 < posY)) { posY = y0; }
}
return [
[posX, offset],
[posX, posY - (y0 - offset)],
[posX + barW, posY - (y0 - offset)],
[posX + barW, offset]
];
};
};
c3_chart_internal_fn.isWithinBar = function (that) {
var mouse = this.d3.mouse(that), box = that.getBoundingClientRect(),
seg0 = that.pathSegList.getItem(0), seg1 = that.pathSegList.getItem(1),
x = Math.min(seg0.x, seg1.x), y = Math.min(seg0.y, seg1.y),
w = box.width, h = box.height, offset = 2,
sx = x - offset, ex = x + w + offset, sy = y + h + offset, ey = y - offset;
return sx < mouse[0] && mouse[0] < ex && ey < mouse[1] && mouse[1] < sy;
};
c3_chart_internal_fn.initText = function () {
var $$ = this;
$$.main.select('.' + CLASS.chart).append("g")
.attr("class", CLASS.chartTexts);
$$.mainText = $$.d3.selectAll([]);
};
c3_chart_internal_fn.updateTargetsForText = function (targets) {
var $$ = this, mainTextUpdate, mainTextEnter,
classChartText = $$.classChartText.bind($$),
classTexts = $$.classTexts.bind($$),
classFocus = $$.classFocus.bind($$);
mainTextUpdate = $$.main.select('.' + CLASS.chartTexts).selectAll('.' + CLASS.chartText)
.data(targets)
.attr('class', function (d) { return classChartText(d) + classFocus(d); });
mainTextEnter = mainTextUpdate.enter().append('g')
.attr('class', classChartText)
.style('opacity', 0)
.style("pointer-events", "none");
mainTextEnter.append('g')
.attr('class', classTexts);
};
c3_chart_internal_fn.updateText = function (durationForExit) {
var $$ = this, config = $$.config,
barOrLineData = $$.barOrLineData.bind($$),
classText = $$.classText.bind($$);
$$.mainText = $$.main.selectAll('.' + CLASS.texts).selectAll('.' + CLASS.text)
.data(barOrLineData);
$$.mainText.enter().append('text')
.attr("class", classText)
.attr('text-anchor', function (d) { return config.axis_rotated ? (d.value < 0 ? 'end' : 'start') : 'middle'; })
.style("stroke", 'none')
.style("fill", function (d) { return $$.color(d); })
.style("fill-opacity", 0);
$$.mainText
.text(function (d, i, j) { return $$.dataLabelFormat(d.id)(d.value, d.id, i, j); });
$$.mainText.exit()
.transition().duration(durationForExit)
.style('fill-opacity', 0)
.remove();
};
c3_chart_internal_fn.redrawText = function (xForText, yForText, forFlow, withTransition) {
return [
(withTransition ? this.mainText.transition() : this.mainText)
.attr('x', xForText)
.attr('y', yForText)
.style("fill", this.color)
.style("fill-opacity", forFlow ? 0 : this.opacityForText.bind(this))
];
};
c3_chart_internal_fn.getTextRect = function (text, cls, element) {
var dummy = this.d3.select('body').append('div').classed('c3', true),
svg = dummy.append("svg").style('visibility', 'hidden').style('position', 'fixed').style('top', 0).style('left', 0),
font = this.d3.select(element).style('font'),
rect;
svg.selectAll('.dummy')
.data([text])
.enter().append('text')
.classed(cls ? cls : "", true)
.style('font', font)
.text(text)
.each(function () { rect = this.getBoundingClientRect(); });
dummy.remove();
return rect;
};
c3_chart_internal_fn.generateXYForText = function (areaIndices, barIndices, lineIndices, forX) {
var $$ = this,
getAreaPoints = $$.generateGetAreaPoints(areaIndices, false),
getBarPoints = $$.generateGetBarPoints(barIndices, false),
getLinePoints = $$.generateGetLinePoints(lineIndices, false),
getter = forX ? $$.getXForText : $$.getYForText;
return function (d, i) {
var getPoints = $$.isAreaType(d) ? getAreaPoints : $$.isBarType(d) ? getBarPoints : getLinePoints;
return getter.call($$, getPoints(d, i), d, this);
};
};
c3_chart_internal_fn.getXForText = function (points, d, textElement) {
var $$ = this,
box = textElement.getBoundingClientRect(), xPos, padding;
if ($$.config.axis_rotated) {
padding = $$.isBarType(d) ? 4 : 6;
xPos = points[2][1] + padding * (d.value < 0 ? -1 : 1);
} else {
xPos = $$.hasType('bar') ? (points[2][0] + points[0][0]) / 2 : points[0][0];
}
if (d.value === null) {
if (xPos > $$.width) {
xPos = $$.width - box.width;
} else if (xPos < 0) {
xPos = 4;
}
}
return xPos;
};
c3_chart_internal_fn.getYForText = function (points, d, textElement) {
var $$ = this,
box = textElement.getBoundingClientRect(),
yPos;
if ($$.config.axis_rotated) {
yPos = (points[0][0] + points[2][0] + box.height * 0.6) / 2;
} else {
yPos = points[2][1];
if (d.value < 0  || (d.value === 0 && !$$.hasPositiveValue)) {
yPos += box.height;
if ($$.isBarType(d) && $$.isSafari()) {
yPos -= 3;
}
else if (!$$.isBarType(d) && $$.isChrome()) {
yPos += 3;
}
} else {
yPos += $$.isBarType(d) ? -3 : -6;
}
}
if (d.value === null && !$$.config.axis_rotated) {
if (yPos < box.height) {
yPos = box.height;
} else if (yPos > this.height) {
yPos = this.height - 4;
}
}
return yPos;
};
c3_chart_internal_fn.setTargetType = function (targetIds, type) {
var $$ = this, config = $$.config;
$$.mapToTargetIds(targetIds).forEach(function (id) {
$$.withoutFadeIn[id] = (type === config.data_types[id]);
config.data_types[id] = type;
});
if (!targetIds) {
config.data_type = type;
}
};
c3_chart_internal_fn.hasType = function (type, targets) {
var $$ = this, types = $$.config.data_types, has = false;
targets = targets || $$.data.targets;
if (targets && targets.length) {
targets.forEach(function (target) {
var t = types[target.id];
if ((t && t.indexOf(type) >= 0) || (!t && type === 'line')) {
has = true;
}
});
} else if (Object.keys(types).length) {
Object.keys(types).forEach(function (id) {
if (types[id] === type) { has = true; }
});
} else {
has = $$.config.data_type === type;
}
return has;
};
c3_chart_internal_fn.hasArcType = function (targets) {
return this.hasType('pie', targets) || this.hasType('donut', targets) || this.hasType('gauge', targets);
};
c3_chart_internal_fn.isLineType = function (d) {
var config = this.config, id = isString(d) ? d : d.id;
return !config.data_types[id] || ['line', 'spline', 'area', 'area-spline', 'step', 'area-step'].indexOf(config.data_types[id]) >= 0;
};
c3_chart_internal_fn.isStepType = function (d) {
var id = isString(d) ? d : d.id;
return ['step', 'area-step'].indexOf(this.config.data_types[id]) >= 0;
};
c3_chart_internal_fn.isSplineType = function (d) {
var id = isString(d) ? d : d.id;
return ['spline', 'area-spline'].indexOf(this.config.data_types[id]) >= 0;
};
c3_chart_internal_fn.isAreaType = function (d) {
var id = isString(d) ? d : d.id;
return ['area', 'area-spline', 'area-step'].indexOf(this.config.data_types[id]) >= 0;
};
c3_chart_internal_fn.isBarType = function (d) {
var id = isString(d) ? d : d.id;
return this.config.data_types[id] === 'bar';
};
c3_chart_internal_fn.isScatterType = function (d) {
var id = isString(d) ? d : d.id;
return this.config.data_types[id] === 'scatter';
};
c3_chart_internal_fn.isPieType = function (d) {
var id = isString(d) ? d : d.id;
return this.config.data_types[id] === 'pie';
};
c3_chart_internal_fn.isGaugeType = function (d) {
var id = isString(d) ? d : d.id;
return this.config.data_types[id] === 'gauge';
};
c3_chart_internal_fn.isDonutType = function (d) {
var id = isString(d) ? d : d.id;
return this.config.data_types[id] === 'donut';
};
c3_chart_internal_fn.isArcType = function (d) {
return this.isPieType(d) || this.isDonutType(d) || this.isGaugeType(d);
};
c3_chart_internal_fn.lineData = function (d) {
return this.isLineType(d) ? [d] : [];
};
c3_chart_internal_fn.arcData = function (d) {
return this.isArcType(d.data) ? [d] : [];
};
c3_chart_internal_fn.barData = function (d) {
return this.isBarType(d) ? d.values : [];
};
c3_chart_internal_fn.lineOrScatterData = function (d) {
return this.isLineType(d) || this.isScatterType(d) ? d.values : [];
};
c3_chart_internal_fn.barOrLineData = function (d) {
return this.isBarType(d) || this.isLineType(d) ? d.values : [];
};
c3_chart_internal_fn.isInterpolationType = function (type) {
return ['linear', 'linear-closed', 'basis', 'basis-open', 'basis-closed', 'bundle', 'cardinal', 'cardinal-open', 'cardinal-closed', 'monotone'].indexOf(type) >= 0;
};
c3_chart_internal_fn.initGrid = function () {
var $$ = this, config = $$.config, d3 = $$.d3;
$$.grid = $$.main.append('g')
.attr("clip-path", $$.clipPathForGrid)
.attr('class', CLASS.grid);
if (config.grid_x_show) {
$$.grid.append("g").attr("class", CLASS.xgrids);
}
if (config.grid_y_show) {
$$.grid.append('g').attr('class', CLASS.ygrids);
}
if (config.grid_focus_show) {
$$.grid.append('g')
.attr("class", CLASS.xgridFocus)
.append('line')
.attr('class', CLASS.xgridFocus);
}
$$.xgrid = d3.selectAll([]);
if (!config.grid_lines_front) { $$.initGridLines(); }
};
c3_chart_internal_fn.initGridLines = function () {
var $$ = this, d3 = $$.d3;
$$.gridLines = $$.main.append('g')
.attr("clip-path", $$.clipPathForGrid)
.attr('class', CLASS.grid + ' ' + CLASS.gridLines);
$$.gridLines.append('g').attr("class", CLASS.xgridLines);
$$.gridLines.append('g').attr('class', CLASS.ygridLines);
$$.xgridLines = d3.selectAll([]);
};
c3_chart_internal_fn.updateXGrid = function (withoutUpdate) {
var $$ = this, config = $$.config, d3 = $$.d3,
xgridData = $$.generateGridData(config.grid_x_type, $$.x),
tickOffset = $$.isCategorized() ? $$.xAxis.tickOffset() : 0;
$$.xgridAttr = config.axis_rotated ? {
'x1': 0,
'x2': $$.width,
'y1': function (d) { return $$.x(d) - tickOffset; },
'y2': function (d) { return $$.x(d) - tickOffset; }
} : {
'x1': function (d) { return $$.x(d) + tickOffset; },
'x2': function (d) { return $$.x(d) + tickOffset; },
'y1': 0,
'y2': $$.height
};
$$.xgrid = $$.main.select('.' + CLASS.xgrids).selectAll('.' + CLASS.xgrid)
.data(xgridData);
$$.xgrid.enter().append('line').attr("class", CLASS.xgrid);
if (!withoutUpdate) {
$$.xgrid.attr($$.xgridAttr)
.style("opacity", function () { return +d3.select(this).attr(config.axis_rotated ? 'y1' : 'x1') === (config.axis_rotated ? $$.height : 0) ? 0 : 1; });
}
$$.xgrid.exit().remove();
};
c3_chart_internal_fn.updateYGrid = function () {
var $$ = this, config = $$.config,
gridValues = $$.yAxis.tickValues() || $$.y.ticks(config.grid_y_ticks);
$$.ygrid = $$.main.select('.' + CLASS.ygrids).selectAll('.' + CLASS.ygrid)
.data(gridValues);
$$.ygrid.enter().append('line')
.attr('class', CLASS.ygrid);
$$.ygrid.attr("x1", config.axis_rotated ? $$.y : 0)
.attr("x2", config.axis_rotated ? $$.y : $$.width)
.attr("y1", config.axis_rotated ? 0 : $$.y)
.attr("y2", config.axis_rotated ? $$.height : $$.y);
$$.ygrid.exit().remove();
$$.smoothLines($$.ygrid, 'grid');
};
c3_chart_internal_fn.gridTextAnchor = function (d) {
return d.position ? d.position : "end";
};
c3_chart_internal_fn.gridTextDx = function (d) {
return d.position === 'start' ? 4 : d.position === 'middle' ? 0 : -4;
};
c3_chart_internal_fn.xGridTextX = function (d) {
return d.position === 'start' ? -this.height : d.position === 'middle' ? -this.height / 2 : 0;
};
c3_chart_internal_fn.yGridTextX = function (d) {
return d.position === 'start' ? 0 : d.position === 'middle' ? this.width / 2 : this.width;
};
c3_chart_internal_fn.updateGrid = function (duration) {
var $$ = this, main = $$.main, config = $$.config,
xgridLine, ygridLine, yv;
$$.grid.style('visibility', $$.hasArcType() ? 'hidden' : 'visible');
main.select('line.' + CLASS.xgridFocus).style("visibility", "hidden");
if (config.grid_x_show) {
$$.updateXGrid();
}
$$.xgridLines = main.select('.' + CLASS.xgridLines).selectAll('.' + CLASS.xgridLine)
.data(config.grid_x_lines);
xgridLine = $$.xgridLines.enter().append('g')
.attr("class", function (d) { return CLASS.xgridLine + (d['class'] ? ' ' + d['class'] : ''); });
xgridLine.append('line')
.style("opacity", 0);
xgridLine.append('text')
.attr("text-anchor", $$.gridTextAnchor)
.attr("transform", config.axis_rotated ? "" : "rotate(-90)")
.attr('dx', $$.gridTextDx)
.attr('dy', -5)
.style("opacity", 0);
$$.xgridLines.exit().transition().duration(duration)
.style("opacity", 0)
.remove();
if (config.grid_y_show) {
$$.updateYGrid();
}
$$.ygridLines = main.select('.' + CLASS.ygridLines).selectAll('.' + CLASS.ygridLine)
.data(config.grid_y_lines);
ygridLine = $$.ygridLines.enter().append('g')
.attr("class", function (d) { return CLASS.ygridLine + (d['class'] ? ' ' + d['class'] : ''); });
ygridLine.append('line')
.style("opacity", 0);
ygridLine.append('text')
.attr("text-anchor", $$.gridTextAnchor)
.attr("transform", config.axis_rotated ? "rotate(-90)" : "")
.attr('dx', $$.gridTextDx)
.attr('dy', -5)
.style("opacity", 0);
yv = $$.yv.bind($$);
$$.ygridLines.select('line')
.transition().duration(duration)
.attr("x1", config.axis_rotated ? yv : 0)
.attr("x2", config.axis_rotated ? yv : $$.width)
.attr("y1", config.axis_rotated ? 0 : yv)
.attr("y2", config.axis_rotated ? $$.height : yv)
.style("opacity", 1);
$$.ygridLines.select('text')
.transition().duration(duration)
.attr("x", config.axis_rotated ? $$.xGridTextX.bind($$) : $$.yGridTextX.bind($$))
.attr("y", yv)
.text(function (d) { return d.text; })
.style("opacity", 1);
$$.ygridLines.exit().transition().duration(duration)
.style("opacity", 0)
.remove();
};
c3_chart_internal_fn.redrawGrid = function (withTransition) {
var $$ = this, config = $$.config, xv = $$.xv.bind($$),
lines = $$.xgridLines.select('line'),
texts = $$.xgridLines.select('text');
return [
(withTransition ? lines.transition() : lines)
.attr("x1", config.axis_rotated ? 0 : xv)
.attr("x2", config.axis_rotated ? $$.width : xv)
.attr("y1", config.axis_rotated ? xv : 0)
.attr("y2", config.axis_rotated ? xv : $$.height)
.style("opacity", 1),
(withTransition ? texts.transition() : texts)
.attr("x", config.axis_rotated ? $$.yGridTextX.bind($$) : $$.xGridTextX.bind($$))
.attr("y", xv)
.text(function (d) { return d.text; })
.style("opacity", 1)
];
};
c3_chart_internal_fn.showXGridFocus = function (selectedData) {
var $$ = this, config = $$.config,
dataToShow = selectedData.filter(function (d) { return d && isValue(d.value); }),
focusEl = $$.main.selectAll('line.' + CLASS.xgridFocus),
xx = $$.xx.bind($$);
if (! config.tooltip_show) { return; }
if ($$.hasType('scatter') || $$.hasArcType()) { return; }
focusEl
.style("visibility", "visible")
.data([dataToShow[0]])
.attr(config.axis_rotated ? 'y1' : 'x1', xx)
.attr(config.axis_rotated ? 'y2' : 'x2', xx);
$$.smoothLines(focusEl, 'grid');
};
c3_chart_internal_fn.hideXGridFocus = function () {
this.main.select('line.' + CLASS.xgridFocus).style("visibility", "hidden");
};
c3_chart_internal_fn.updateXgridFocus = function () {
var $$ = this, config = $$.config;
$$.main.select('line.' + CLASS.xgridFocus)
.attr("x1", config.axis_rotated ? 0 : -10)
.attr("x2", config.axis_rotated ? $$.width : -10)
.attr("y1", config.axis_rotated ? -10 : 0)
.attr("y2", config.axis_rotated ? -10 : $$.height);
};
c3_chart_internal_fn.generateGridData = function (type, scale) {
var $$ = this,
gridData = [], xDomain, firstYear, lastYear, i,
tickNum = $$.main.select("." + CLASS.axisX).selectAll('.tick').size();
if (type === 'year') {
xDomain = $$.getXDomain();
firstYear = xDomain[0].getFullYear();
lastYear = xDomain[1].getFullYear();
for (i = firstYear; i <= lastYear; i++) {
gridData.push(new Date(i + '-01-01 00:00:00'));
}
} else {
gridData = scale.ticks(10);
if (gridData.length > tickNum) {
gridData = gridData.filter(function (d) { return ("" + d).indexOf('.') < 0; });
}
}
return gridData;
};
c3_chart_internal_fn.getGridFilterToRemove = function (params) {
return params ? function (line) {
var found = false;
[].concat(params).forEach(function (param) {
if ((('value' in param && line.value === param.value) || ('class' in param && line['class'] === param['class']))) {
found = true;
}
});
return found;
} : function () { return true; };
};
c3_chart_internal_fn.removeGridLines = function (params, forX) {
var $$ = this, config = $$.config,
toRemove = $$.getGridFilterToRemove(params),
toShow = function (line) { return !toRemove(line); },
classLines = forX ? CLASS.xgridLines : CLASS.ygridLines,
classLine = forX ? CLASS.xgridLine : CLASS.ygridLine;
$$.main.select('.' + classLines).selectAll('.' + classLine).filter(toRemove)
.transition().duration(config.transition_duration)
.style('opacity', 0).remove();
if (forX) {
config.grid_x_lines = config.grid_x_lines.filter(toShow);
} else {
config.grid_y_lines = config.grid_y_lines.filter(toShow);
}
};
c3_chart_internal_fn.initTooltip = function () {
var $$ = this, config = $$.config, i;
$$.tooltip = $$.selectChart
.style("position", "relative")
.append("div")
.attr('class', CLASS.tooltipContainer)
.style("position", "absolute")
.style("pointer-events", "none")
.style("display", "none");
if (config.tooltip_init_show) {
if ($$.isTimeSeries() && isString(config.tooltip_init_x)) {
config.tooltip_init_x = $$.parseDate(config.tooltip_init_x);
for (i = 0; i < $$.data.targets[0].values.length; i++) {
if (($$.data.targets[0].values[i].x - config.tooltip_init_x) === 0) { break; }
}
config.tooltip_init_x = i;
}
$$.tooltip.html(config.tooltip_contents.call($$, $$.data.targets.map(function (d) {
return $$.addName(d.values[config.tooltip_init_x]);
}), $$.axis.getXAxisTickFormat(), $$.getYFormat($$.hasArcType()), $$.color));
$$.tooltip.style("top", config.tooltip_init_position.top)
.style("left", config.tooltip_init_position.left)
.style("display", "block");
}
};
c3_chart_internal_fn.getTooltipContent = function (d, defaultTitleFormat, defaultValueFormat, color) {
var $$ = this, config = $$.config,
titleFormat = config.tooltip_format_title || defaultTitleFormat,
nameFormat = config.tooltip_format_name || function (name) { return name; },
valueFormat = config.tooltip_format_value || defaultValueFormat,
text, i, title, value, name, bgcolor,
orderAsc = $$.isOrderAsc();
if (config.data_groups.length === 0) {
d.sort(function(a,b){
return orderAsc ? a.value - b.value : b.value - a.value;
});
} else {
var ids = $$.orderTargets($$.data.targets).map(function (i) {
return i.id;
});
d.sort(function(a, b) {
if (a.value > 0 && b.value > 0) {
return orderAsc ? ids.indexOf(a.id) - ids.indexOf(b.id) : ids.indexOf(b.id) - ids.indexOf(a.id);
} else {
return orderAsc ? a.value - b.value : b.value - a.value;
}
});
}
for (i = 0; i < d.length; i++) {
if (! (d[i] && (d[i].value || d[i].value === 0))) { continue; }
if (! text) {
title = titleFormat ? titleFormat(d[i].x) : d[i].x;
text = "<table class='" + $$.CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th colspan='2'>" + title + "</th></tr>" : "");
}
value = valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index);
if (value !== undefined) {
if (d[i].name === null) { continue; }
name = nameFormat(d[i].name, d[i].ratio, d[i].id, d[i].index);
bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);
text += "<tr class='" + $$.CLASS.tooltipName + "-" + $$.getTargetSelectorSuffix(d[i].id) + "'>";
text += "<td class='name'><span style='background-color:" + bgcolor + "'></span>" + name + "</td>";
text += "<td class='value'>" + value + "</td>";
text += "</tr>";
}
}
return text + "</table>";
};
c3_chart_internal_fn.tooltipPosition = function (dataToShow, tWidth, tHeight, element) {
var $$ = this, config = $$.config, d3 = $$.d3;
var svgLeft, tooltipLeft, tooltipRight, tooltipTop, chartRight;
var forArc = $$.hasArcType(),
mouse = d3.mouse(element);
if (forArc) {
tooltipLeft = (($$.width - ($$.isLegendRight ? $$.getLegendWidth() : 0)) / 2) + mouse[0];
tooltipTop = ($$.height / 2) + mouse[1] + 20;
} else {
svgLeft = $$.getSvgLeft(true);
if (config.axis_rotated) {
tooltipLeft = svgLeft + mouse[0] + 100;
tooltipRight = tooltipLeft + tWidth;
chartRight = $$.currentWidth - $$.getCurrentPaddingRight();
tooltipTop = $$.x(dataToShow[0].x) + 20;
} else {
tooltipLeft = svgLeft + $$.getCurrentPaddingLeft(true) + $$.x(dataToShow[0].x) + 20;
tooltipRight = tooltipLeft + tWidth;
chartRight = svgLeft + $$.currentWidth - $$.getCurrentPaddingRight();
tooltipTop = mouse[1] + 15;
}
if (tooltipRight > chartRight) {
tooltipLeft -= tooltipRight - chartRight + 20;
}
if (tooltipTop + tHeight > $$.currentHeight) {
tooltipTop -= tHeight + 30;
}
}
if (tooltipTop < 0) {
tooltipTop = 0;
}
return {top: tooltipTop, left: tooltipLeft};
};
c3_chart_internal_fn.showTooltip = function (selectedData, element) {
var $$ = this, config = $$.config;
var tWidth, tHeight, position;
var forArc = $$.hasArcType(),
dataToShow = selectedData.filter(function (d) { return d && isValue(d.value); }),
positionFunction = config.tooltip_position || c3_chart_internal_fn.tooltipPosition;
if (dataToShow.length === 0 || !config.tooltip_show) {
return;
}
$$.tooltip.html(config.tooltip_contents.call($$, selectedData, $$.axis.getXAxisTickFormat(), $$.getYFormat(forArc), $$.color)).style("display", "block");
tWidth = $$.tooltip.property('offsetWidth');
tHeight = $$.tooltip.property('offsetHeight');
position = positionFunction.call(this, dataToShow, tWidth, tHeight, element);
$$.tooltip
.style("top", position.top + "px")
.style("left", position.left + 'px');
};
c3_chart_internal_fn.hideTooltip = function () {
this.tooltip.style("display", "none");
};
c3_chart_internal_fn.initLegend = function () {
var $$ = this;
$$.legendItemTextBox = {};
$$.legendHasRendered = false;
$$.legend = $$.svg.append("g").attr("transform", $$.getTranslate('legend'));
if (!$$.config.legend_show) {
$$.legend.style('visibility', 'hidden');
$$.hiddenLegendIds = $$.mapToIds($$.data.targets);
return;
}
$$.updateLegendWithDefaults();
};
c3_chart_internal_fn.updateLegendWithDefaults = function () {
var $$ = this;
$$.updateLegend($$.mapToIds($$.data.targets), {withTransform: false, withTransitionForTransform: false, withTransition: false});
};
c3_chart_internal_fn.updateSizeForLegend = function (legendHeight, legendWidth) {
var $$ = this, config = $$.config, insetLegendPosition = {
top: $$.isLegendTop ? $$.getCurrentPaddingTop() + config.legend_inset_y + 5.5 : $$.currentHeight - legendHeight - $$.getCurrentPaddingBottom() - config.legend_inset_y,
left: $$.isLegendLeft ? $$.getCurrentPaddingLeft() + config.legend_inset_x + 0.5 : $$.currentWidth - legendWidth - $$.getCurrentPaddingRight() - config.legend_inset_x + 0.5
};
$$.margin3 = {
top: $$.isLegendRight ? 0 : $$.isLegendInset ? insetLegendPosition.top : $$.currentHeight - legendHeight,
right: NaN,
bottom: 0,
left: $$.isLegendRight ? $$.currentWidth - legendWidth : $$.isLegendInset ? insetLegendPosition.left : 0
};
};
c3_chart_internal_fn.transformLegend = function (withTransition) {
var $$ = this;
(withTransition ? $$.legend.transition() : $$.legend).attr("transform", $$.getTranslate('legend'));
};
c3_chart_internal_fn.updateLegendStep = function (step) {
this.legendStep = step;
};
c3_chart_internal_fn.updateLegendItemWidth = function (w) {
this.legendItemWidth = w;
};
c3_chart_internal_fn.updateLegendItemHeight = function (h) {
this.legendItemHeight = h;
};
c3_chart_internal_fn.getLegendWidth = function () {
var $$ = this;
return $$.config.legend_show ? $$.isLegendRight || $$.isLegendInset ? $$.legendItemWidth * ($$.legendStep + 1) : $$.currentWidth : 0;
};
c3_chart_internal_fn.getLegendHeight = function () {
var $$ = this, h = 0;
if ($$.config.legend_show) {
if ($$.isLegendRight) {
h = $$.currentHeight;
} else {
h = Math.max(20, $$.legendItemHeight) * ($$.legendStep + 1);
}
}
return h;
};
c3_chart_internal_fn.opacityForLegend = function (legendItem) {
return legendItem.classed(CLASS.legendItemHidden) ? null : 1;
};
c3_chart_internal_fn.opacityForUnfocusedLegend = function (legendItem) {
return legendItem.classed(CLASS.legendItemHidden) ? null : 0.3;
};
c3_chart_internal_fn.toggleFocusLegend = function (targetIds, focus) {
var $$ = this;
targetIds = $$.mapToTargetIds(targetIds);
$$.legend.selectAll('.' + CLASS.legendItem)
.filter(function (id) { return targetIds.indexOf(id) >= 0; })
.classed(CLASS.legendItemFocused, focus)
.transition().duration(100)
.style('opacity', function () {
var opacity = focus ? $$.opacityForLegend : $$.opacityForUnfocusedLegend;
return opacity.call($$, $$.d3.select(this));
});
};
c3_chart_internal_fn.revertLegend = function () {
var $$ = this, d3 = $$.d3;
$$.legend.selectAll('.' + CLASS.legendItem)
.classed(CLASS.legendItemFocused, false)
.transition().duration(100)
.style('opacity', function () { return $$.opacityForLegend(d3.select(this)); });
};
c3_chart_internal_fn.showLegend = function (targetIds) {
var $$ = this, config = $$.config;
if (!config.legend_show) {
config.legend_show = true;
$$.legend.style('visibility', 'visible');
if (!$$.legendHasRendered) {
$$.updateLegendWithDefaults();
}
}
$$.removeHiddenLegendIds(targetIds);
$$.legend.selectAll($$.selectorLegends(targetIds))
.style('visibility', 'visible')
.transition()
.style('opacity', function () { return $$.opacityForLegend($$.d3.select(this)); });
};
c3_chart_internal_fn.hideLegend = function (targetIds) {
var $$ = this, config = $$.config;
if (config.legend_show && isEmpty(targetIds)) {
config.legend_show = false;
$$.legend.style('visibility', 'hidden');
}
$$.addHiddenLegendIds(targetIds);
$$.legend.selectAll($$.selectorLegends(targetIds))
.style('opacity', 0)
.style('visibility', 'hidden');
};
c3_chart_internal_fn.clearLegendItemTextBoxCache = function () {
this.legendItemTextBox = {};
};
c3_chart_internal_fn.updateLegend = function (targetIds, options, transitions) {
var $$ = this, config = $$.config;
var xForLegend, xForLegendText, xForLegendRect, yForLegend, yForLegendText, yForLegendRect, x1ForLegendTile, x2ForLegendTile, yForLegendTile;
var paddingTop = 4, paddingRight = 10, maxWidth = 0, maxHeight = 0, posMin = 10, tileWidth = config.legend_item_tile_width + 5;
var l, totalLength = 0, offsets = {}, widths = {}, heights = {}, margins = [0], steps = {}, step = 0;
var withTransition, withTransitionForTransform;
var texts, rects, tiles, background;
targetIds = targetIds.filter(function(id) {
return !isDefined(config.data_names[id]) || config.data_names[id] !== null;
});
options = options || {};
withTransition = getOption(options, "withTransition", true);
withTransitionForTransform = getOption(options, "withTransitionForTransform", true);
function getTextBox(textElement, id) {
if (!$$.legendItemTextBox[id]) {
$$.legendItemTextBox[id] = $$.getTextRect(textElement.textContent, CLASS.legendItem, textElement);
}
return $$.legendItemTextBox[id];
}
function updatePositions(textElement, id, index) {
var reset = index === 0, isLast = index === targetIds.length - 1,
box = getTextBox(textElement, id),
itemWidth = box.width + tileWidth + (isLast && !($$.isLegendRight || $$.isLegendInset) ? 0 : paddingRight) + config.legend_padding,
itemHeight = box.height + paddingTop,
itemLength = $$.isLegendRight || $$.isLegendInset ? itemHeight : itemWidth,
areaLength = $$.isLegendRight || $$.isLegendInset ? $$.getLegendHeight() : $$.getLegendWidth(),
margin, maxLength;
function updateValues(id, withoutStep) {
if (!withoutStep) {
margin = (areaLength - totalLength - itemLength) / 2;
if (margin < posMin) {
margin = (areaLength - itemLength) / 2;
totalLength = 0;
step++;
}
}
steps[id] = step;
margins[step] = $$.isLegendInset ? 10 : margin;
offsets[id] = totalLength;
totalLength += itemLength;
}
if (reset) {
totalLength = 0;
step = 0;
maxWidth = 0;
maxHeight = 0;
}
if (config.legend_show && !$$.isLegendToShow(id)) {
widths[id] = heights[id] = steps[id] = offsets[id] = 0;
return;
}
widths[id] = itemWidth;
heights[id] = itemHeight;
if (!maxWidth || itemWidth >= maxWidth) { maxWidth = itemWidth; }
if (!maxHeight || itemHeight >= maxHeight) { maxHeight = itemHeight; }
maxLength = $$.isLegendRight || $$.isLegendInset ? maxHeight : maxWidth;
if (config.legend_equally) {
Object.keys(widths).forEach(function (id) { widths[id] = maxWidth; });
Object.keys(heights).forEach(function (id) { heights[id] = maxHeight; });
margin = (areaLength - maxLength * targetIds.length) / 2;
if (margin < posMin) {
totalLength = 0;
step = 0;
targetIds.forEach(function (id) { updateValues(id); });
}
else {
updateValues(id, true);
}
} else {
updateValues(id);
}
}
if ($$.isLegendInset) {
step = config.legend_inset_step ? config.legend_inset_step : targetIds.length;
$$.updateLegendStep(step);
}
if ($$.isLegendRight) {
xForLegend = function (id) { return maxWidth * steps[id]; };
yForLegend = function (id) { return margins[steps[id]] + offsets[id]; };
} else if ($$.isLegendInset) {
xForLegend = function (id) { return maxWidth * steps[id] + 10; };
yForLegend = function (id) { return margins[steps[id]] + offsets[id]; };
} else {
xForLegend = function (id) { return margins[steps[id]] + offsets[id]; };
yForLegend = function (id) { return maxHeight * steps[id]; };
}
xForLegendText = function (id, i) { return xForLegend(id, i) + 4 + config.legend_item_tile_width; };
yForLegendText = function (id, i) { return yForLegend(id, i) + 9; };
xForLegendRect = function (id, i) { return xForLegend(id, i); };
yForLegendRect = function (id, i) { return yForLegend(id, i) - 5; };
x1ForLegendTile = function (id, i) { return xForLegend(id, i) - 2; };
x2ForLegendTile = function (id, i) { return xForLegend(id, i) - 2 + config.legend_item_tile_width; };
yForLegendTile = function (id, i) { return yForLegend(id, i) + 4; };
l = $$.legend.selectAll('.' + CLASS.legendItem)
.data(targetIds)
.enter().append('g')
.attr('class', function (id) { return $$.generateClass(CLASS.legendItem, id); })
.style('visibility', function (id) { return $$.isLegendToShow(id) ? 'visible' : 'hidden'; })
.style('cursor', 'pointer')
.on('click', function (id) {
if (config.legend_item_onclick) {
config.legend_item_onclick.call($$, id);
} else {
if ($$.d3.event.altKey) {
$$.api.hide();
$$.api.show(id);
} else {
$$.api.toggle(id);
$$.isTargetToShow(id) ? $$.api.focus(id) : $$.api.revert();
}
}
})
.on('mouseover', function (id) {
if (config.legend_item_onmouseover) {
config.legend_item_onmouseover.call($$, id);
}
else {
$$.d3.select(this).classed(CLASS.legendItemFocused, true);
if (!$$.transiting && $$.isTargetToShow(id)) {
$$.api.focus(id);
}
}
})
.on('mouseout', function (id) {
if (config.legend_item_onmouseout) {
config.legend_item_onmouseout.call($$, id);
}
else {
$$.d3.select(this).classed(CLASS.legendItemFocused, false);
$$.api.revert();
}
});
l.append('text')
.text(function (id) { return isDefined(config.data_names[id]) ? config.data_names[id] : id; })
.each(function (id, i) { updatePositions(this, id, i); })
.style("pointer-events", "none")
.attr('x', $$.isLegendRight || $$.isLegendInset ? xForLegendText : -200)
.attr('y', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendText);
l.append('rect')
.attr("class", CLASS.legendItemEvent)
.style('fill-opacity', 0)
.attr('x', $$.isLegendRight || $$.isLegendInset ? xForLegendRect : -200)
.attr('y', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendRect);
l.append('line')
.attr('class', CLASS.legendItemTile)
.style('stroke', $$.color)
.style("pointer-events", "none")
.attr('x1', $$.isLegendRight || $$.isLegendInset ? x1ForLegendTile : -200)
.attr('y1', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendTile)
.attr('x2', $$.isLegendRight || $$.isLegendInset ? x2ForLegendTile : -200)
.attr('y2', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendTile)
.attr('stroke-width', config.legend_item_tile_height);
background = $$.legend.select('.' + CLASS.legendBackground + ' rect');
if ($$.isLegendInset && maxWidth > 0 && background.size() === 0) {
background = $$.legend.insert('g', '.' + CLASS.legendItem)
.attr("class", CLASS.legendBackground)
.append('rect');
}
texts = $$.legend.selectAll('text')
.data(targetIds)
.text(function (id) { return isDefined(config.data_names[id]) ? config.data_names[id] : id; })
.each(function (id, i) { updatePositions(this, id, i); });
(withTransition ? texts.transition() : texts)
.attr('x', xForLegendText)
.attr('y', yForLegendText);
rects = $$.legend.selectAll('rect.' + CLASS.legendItemEvent)
.data(targetIds);
(withTransition ? rects.transition() : rects)
.attr('width', function (id) { return widths[id]; })
.attr('height', function (id) { return heights[id]; })
.attr('x', xForLegendRect)
.attr('y', yForLegendRect);
tiles = $$.legend.selectAll('line.' + CLASS.legendItemTile)
.data(targetIds);
(withTransition ? tiles.transition() : tiles)
.style('stroke', $$.color)
.attr('x1', x1ForLegendTile)
.attr('y1', yForLegendTile)
.attr('x2', x2ForLegendTile)
.attr('y2', yForLegendTile);
if (background) {
(withTransition ? background.transition() : background)
.attr('height', $$.getLegendHeight() - 12)
.attr('width', maxWidth * (step + 1) + 10);
}
$$.legend.selectAll('.' + CLASS.legendItem)
.classed(CLASS.legendItemHidden, function (id) { return !$$.isTargetToShow(id); });
$$.updateLegendItemWidth(maxWidth);
$$.updateLegendItemHeight(maxHeight);
$$.updateLegendStep(step);
$$.updateSizes();
$$.updateScales();
$$.updateSvgSize();
$$.transformAll(withTransitionForTransform, transitions);
$$.legendHasRendered = true;
};
c3_chart_internal_fn.initTitle = function () {
var $$ = this;
$$.title = $$.svg.append("text")
.text($$.config.title_text)
.attr("class", $$.CLASS.title);
};
c3_chart_internal_fn.redrawTitle = function () {
var $$ = this;
$$.title
.attr("x", $$.xForTitle.bind($$))
.attr("y", $$.yForTitle.bind($$));
};
c3_chart_internal_fn.xForTitle = function () {
var $$ = this, config = $$.config, position = config.title_position || 'left', x;
if (position.indexOf('right') >= 0) {
x = $$.currentWidth - $$.getTextRect($$.title.node().textContent, $$.CLASS.title, $$.title.node()).width - config.title_padding.right;
} else if (position.indexOf('center') >= 0) {
x = ($$.currentWidth - $$.getTextRect($$.title.node().textContent, $$.CLASS.title, $$.title.node()).width) / 2;
} else {
x = config.title_padding.left;
}
return x;
};
c3_chart_internal_fn.yForTitle = function () {
var $$ = this;
return $$.config.title_padding.top + $$.getTextRect($$.title.node().textContent, $$.CLASS.title, $$.title.node()).height;
};
c3_chart_internal_fn.getTitlePadding = function() {
var $$ = this;
return $$.yForTitle() + $$.config.title_padding.bottom;
};
function Axis(owner) {
API.call(this, owner);
}
inherit(API, Axis);
Axis.prototype.init = function init() {
var $$ = this.owner, config = $$.config, main = $$.main;
$$.axes.x = main.append("g")
.attr("class", CLASS.axis + ' ' + CLASS.axisX)
.attr("clip-path", $$.clipPathForXAxis)
.attr("transform", $$.getTranslate('x'))
.style("visibility", config.axis_x_show ? 'visible' : 'hidden');
$$.axes.x.append("text")
.attr("class", CLASS.axisXLabel)
.attr("transform", config.axis_rotated ? "rotate(-90)" : "")
.style("text-anchor", this.textAnchorForXAxisLabel.bind(this));
$$.axes.y = main.append("g")
.attr("class", CLASS.axis + ' ' + CLASS.axisY)
.attr("clip-path", config.axis_y_inner ? "" : $$.clipPathForYAxis)
.attr("transform", $$.getTranslate('y'))
.style("visibility", config.axis_y_show ? 'visible' : 'hidden');
$$.axes.y.append("text")
.attr("class", CLASS.axisYLabel)
.attr("transform", config.axis_rotated ? "" : "rotate(-90)")
.style("text-anchor", this.textAnchorForYAxisLabel.bind(this));
$$.axes.y2 = main.append("g")
.attr("class", CLASS.axis + ' ' + CLASS.axisY2)
.attr("transform", $$.getTranslate('y2'))
.style("visibility", config.axis_y2_show ? 'visible' : 'hidden');
$$.axes.y2.append("text")
.attr("class", CLASS.axisY2Label)
.attr("transform", config.axis_rotated ? "" : "rotate(-90)")
.style("text-anchor", this.textAnchorForY2AxisLabel.bind(this));
};
Axis.prototype.getXAxis = function getXAxis(scale, orient, tickFormat, tickValues, withOuterTick, withoutTransition, withoutRotateTickText) {
var $$ = this.owner, config = $$.config,
axisParams = {
isCategory: $$.isCategorized(),
withOuterTick: withOuterTick,
tickMultiline: config.axis_x_tick_multiline,
tickWidth: config.axis_x_tick_width,
tickTextRotate: withoutRotateTickText ? 0 : config.axis_x_tick_rotate,
withoutTransition: withoutTransition,
},
axis = c3_axis($$.d3, axisParams).scale(scale).orient(orient);
if ($$.isTimeSeries() && tickValues && typeof tickValues !== "function") {
tickValues = tickValues.map(function (v) { return $$.parseDate(v); });
}
axis.tickFormat(tickFormat).tickValues(tickValues);
if ($$.isCategorized()) {
axis.tickCentered(config.axis_x_tick_centered);
if (isEmpty(config.axis_x_tick_culling)) {
config.axis_x_tick_culling = false;
}
}
return axis;
};
Axis.prototype.updateXAxisTickValues = function updateXAxisTickValues(targets, axis) {
var $$ = this.owner, config = $$.config, tickValues;
if (config.axis_x_tick_fit || config.axis_x_tick_count) {
tickValues = this.generateTickValues($$.mapTargetsToUniqueXs(targets), config.axis_x_tick_count, $$.isTimeSeries());
}
if (axis) {
axis.tickValues(tickValues);
} else {
$$.xAxis.tickValues(tickValues);
$$.subXAxis.tickValues(tickValues);
}
return tickValues;
};
Axis.prototype.getYAxis = function getYAxis(scale, orient, tickFormat, tickValues, withOuterTick, withoutTransition) {
var axisParams = {
withOuterTick: withOuterTick,
withoutTransition: withoutTransition,
},
$$ = this.owner,
d3 = $$.d3,
config = $$.config,
axis = c3_axis(d3, axisParams).scale(scale).orient(orient).tickFormat(tickFormat);
if ($$.isTimeSeriesY()) {
axis.ticks(d3.time[config.axis_y_tick_time_value], config.axis_y_tick_time_interval);
} else {
axis.tickValues(tickValues);
}
return axis;
};
Axis.prototype.getId = function getId(id) {
var config = this.owner.config;
return id in config.data_axes ? config.data_axes[id] : 'y';
};
Axis.prototype.getXAxisTickFormat = function getXAxisTickFormat() {
var $$ = this.owner, config = $$.config,
format = $$.isTimeSeries() ? $$.defaultAxisTimeFormat : $$.isCategorized() ? $$.categoryName : function (v) { return v < 0 ? v.toFixed(0) : v; };
if (config.axis_x_tick_format) {
if (isFunction(config.axis_x_tick_format)) {
format = config.axis_x_tick_format;
} else if ($$.isTimeSeries()) {
format = function (date) {
return date ? $$.axisTimeFormat(config.axis_x_tick_format)(date) : "";
};
}
}
return isFunction(format) ? function (v) { return format.call($$, v); } : format;
};
Axis.prototype.getTickValues = function getTickValues(tickValues, axis) {
return tickValues ? tickValues : axis ? axis.tickValues() : undefined;
};
Axis.prototype.getXAxisTickValues = function getXAxisTickValues() {
return this.getTickValues(this.owner.config.axis_x_tick_values, this.owner.xAxis);
};
Axis.prototype.getYAxisTickValues = function getYAxisTickValues() {
return this.getTickValues(this.owner.config.axis_y_tick_values, this.owner.yAxis);
};
Axis.prototype.getY2AxisTickValues = function getY2AxisTickValues() {
return this.getTickValues(this.owner.config.axis_y2_tick_values, this.owner.y2Axis);
};
Axis.prototype.getLabelOptionByAxisId = function getLabelOptionByAxisId(axisId) {
var $$ = this.owner, config = $$.config, option;
if (axisId === 'y') {
option = config.axis_y_label;
} else if (axisId === 'y2') {
option = config.axis_y2_label;
} else if (axisId === 'x') {
option = config.axis_x_label;
}
return option;
};
Axis.prototype.getLabelText = function getLabelText(axisId) {
var option = this.getLabelOptionByAxisId(axisId);
return isString(option) ? option : option ? option.text : null;
};
Axis.prototype.setLabelText = function setLabelText(axisId, text) {
var $$ = this.owner, config = $$.config,
option = this.getLabelOptionByAxisId(axisId);
if (isString(option)) {
if (axisId === 'y') {
config.axis_y_label = text;
} else if (axisId === 'y2') {
config.axis_y2_label = text;
} else if (axisId === 'x') {
config.axis_x_label = text;
}
} else if (option) {
option.text = text;
}
};
Axis.prototype.getLabelPosition = function getLabelPosition(axisId, defaultPosition) {
var option = this.getLabelOptionByAxisId(axisId),
position = (option && typeof option === 'object' && option.position) ? option.position : defaultPosition;
return {
isInner: position.indexOf('inner') >= 0,
isOuter: position.indexOf('outer') >= 0,
isLeft: position.indexOf('left') >= 0,
isCenter: position.indexOf('center') >= 0,
isRight: position.indexOf('right') >= 0,
isTop: position.indexOf('top') >= 0,
isMiddle: position.indexOf('middle') >= 0,
isBottom: position.indexOf('bottom') >= 0
};
};
Axis.prototype.getXAxisLabelPosition = function getXAxisLabelPosition() {
return this.getLabelPosition('x', this.owner.config.axis_rotated ? 'inner-top' : 'inner-right');
};
Axis.prototype.getYAxisLabelPosition = function getYAxisLabelPosition() {
return this.getLabelPosition('y', this.owner.config.axis_rotated ? 'inner-right' : 'inner-top');
};
Axis.prototype.getY2AxisLabelPosition = function getY2AxisLabelPosition() {
return this.getLabelPosition('y2', this.owner.config.axis_rotated ? 'inner-right' : 'inner-top');
};
Axis.prototype.getLabelPositionById = function getLabelPositionById(id) {
return id === 'y2' ? this.getY2AxisLabelPosition() : id === 'y' ? this.getYAxisLabelPosition() : this.getXAxisLabelPosition();
};
Axis.prototype.textForXAxisLabel = function textForXAxisLabel() {
return this.getLabelText('x');
};
Axis.prototype.textForYAxisLabel = function textForYAxisLabel() {
return this.getLabelText('y');
};
Axis.prototype.textForY2AxisLabel = function textForY2AxisLabel() {
return this.getLabelText('y2');
};
Axis.prototype.xForAxisLabel = function xForAxisLabel(forHorizontal, position) {
var $$ = this.owner;
if (forHorizontal) {
return position.isLeft ? 0 : position.isCenter ? $$.width / 2 : $$.width;
} else {
return position.isBottom ? -$$.height : position.isMiddle ? -$$.height / 2 : 0;
}
};
Axis.prototype.dxForAxisLabel = function dxForAxisLabel(forHorizontal, position) {
if (forHorizontal) {
return position.isLeft ? "0.5em" : position.isRight ? "-0.5em" : "0";
} else {
return position.isTop ? "-0.5em" : position.isBottom ? "0.5em" : "0";
}
};
Axis.prototype.textAnchorForAxisLabel = function textAnchorForAxisLabel(forHorizontal, position) {
if (forHorizontal) {
return position.isLeft ? 'start' : position.isCenter ? 'middle' : 'end';
} else {
return position.isBottom ? 'start' : position.isMiddle ? 'middle' : 'end';
}
};
Axis.prototype.xForXAxisLabel = function xForXAxisLabel() {
return this.xForAxisLabel(!this.owner.config.axis_rotated, this.getXAxisLabelPosition());
};
Axis.prototype.xForYAxisLabel = function xForYAxisLabel() {
return this.xForAxisLabel(this.owner.config.axis_rotated, this.getYAxisLabelPosition());
};
Axis.prototype.xForY2AxisLabel = function xForY2AxisLabel() {
return this.xForAxisLabel(this.owner.config.axis_rotated, this.getY2AxisLabelPosition());
};
Axis.prototype.dxForXAxisLabel = function dxForXAxisLabel() {
return this.dxForAxisLabel(!this.owner.config.axis_rotated, this.getXAxisLabelPosition());
};
Axis.prototype.dxForYAxisLabel = function dxForYAxisLabel() {
return this.dxForAxisLabel(this.owner.config.axis_rotated, this.getYAxisLabelPosition());
};
Axis.prototype.dxForY2AxisLabel = function dxForY2AxisLabel() {
return this.dxForAxisLabel(this.owner.config.axis_rotated, this.getY2AxisLabelPosition());
};
Axis.prototype.dyForXAxisLabel = function dyForXAxisLabel() {
var $$ = this.owner, config = $$.config,
position = this.getXAxisLabelPosition();
if (config.axis_rotated) {
return position.isInner ? "1.2em" : -25 - this.getMaxTickWidth('x');
} else {
return position.isInner ? "-0.5em" : config.axis_x_height ? config.axis_x_height - 10 : "3em";
}
};
Axis.prototype.dyForYAxisLabel = function dyForYAxisLabel() {
var $$ = this.owner,
position = this.getYAxisLabelPosition();
if ($$.config.axis_rotated) {
return position.isInner ? "-0.5em" : "3em";
} else {
return position.isInner ? "1.2em" : -10 - ($$.config.axis_y_inner ? 0 : (this.getMaxTickWidth('y') + 10));
}
};
Axis.prototype.dyForY2AxisLabel = function dyForY2AxisLabel() {
var $$ = this.owner,
position = this.getY2AxisLabelPosition();
if ($$.config.axis_rotated) {
return position.isInner ? "1.2em" : "-2.2em";
} else {
return position.isInner ? "-0.5em" : 15 + ($$.config.axis_y2_inner ? 0 : (this.getMaxTickWidth('y2') + 15));
}
};
Axis.prototype.textAnchorForXAxisLabel = function textAnchorForXAxisLabel() {
var $$ = this.owner;
return this.textAnchorForAxisLabel(!$$.config.axis_rotated, this.getXAxisLabelPosition());
};
Axis.prototype.textAnchorForYAxisLabel = function textAnchorForYAxisLabel() {
var $$ = this.owner;
return this.textAnchorForAxisLabel($$.config.axis_rotated, this.getYAxisLabelPosition());
};
Axis.prototype.textAnchorForY2AxisLabel = function textAnchorForY2AxisLabel() {
var $$ = this.owner;
return this.textAnchorForAxisLabel($$.config.axis_rotated, this.getY2AxisLabelPosition());
};
Axis.prototype.getMaxTickWidth = function getMaxTickWidth(id, withoutRecompute) {
var $$ = this.owner, config = $$.config,
maxWidth = 0, targetsToShow, scale, axis, dummy, svg;
if (withoutRecompute && $$.currentMaxTickWidths[id]) {
return $$.currentMaxTickWidths[id];
}
if ($$.svg) {
targetsToShow = $$.filterTargetsToShow($$.data.targets);
if (id === 'y') {
scale = $$.y.copy().domain($$.getYDomain(targetsToShow, 'y'));
axis = this.getYAxis(scale, $$.yOrient, config.axis_y_tick_format, $$.yAxisTickValues, false, true);
} else if (id === 'y2') {
scale = $$.y2.copy().domain($$.getYDomain(targetsToShow, 'y2'));
axis = this.getYAxis(scale, $$.y2Orient, config.axis_y2_tick_format, $$.y2AxisTickValues, false, true);
} else {
scale = $$.x.copy().domain($$.getXDomain(targetsToShow));
axis = this.getXAxis(scale, $$.xOrient, $$.xAxisTickFormat, $$.xAxisTickValues, false, true, true);
this.updateXAxisTickValues(targetsToShow, axis);
}
dummy = $$.d3.select('body').append('div').classed('c3', true);
svg = dummy.append("svg").style('visibility', 'hidden').style('position', 'fixed').style('top', 0).style('left', 0),
svg.append('g').call(axis).each(function () {
$$.d3.select(this).selectAll('text').each(function () {
var box = this.getBoundingClientRect();
if (maxWidth < box.width) { maxWidth = box.width; }
});
dummy.remove();
});
}
$$.currentMaxTickWidths[id] = maxWidth <= 0 ? $$.currentMaxTickWidths[id] : maxWidth;
return $$.currentMaxTickWidths[id];
};
Axis.prototype.updateLabels = function updateLabels(withTransition) {
var $$ = this.owner;
var axisXLabel = $$.main.select('.' + CLASS.axisX + ' .' + CLASS.axisXLabel),
axisYLabel = $$.main.select('.' + CLASS.axisY + ' .' + CLASS.axisYLabel),
axisY2Label = $$.main.select('.' + CLASS.axisY2 + ' .' + CLASS.axisY2Label);
(withTransition ? axisXLabel.transition() : axisXLabel)
.attr("x", this.xForXAxisLabel.bind(this))
.attr("dx", this.dxForXAxisLabel.bind(this))
.attr("dy", this.dyForXAxisLabel.bind(this))
.text(this.textForXAxisLabel.bind(this));
(withTransition ? axisYLabel.transition() : axisYLabel)
.attr("x", this.xForYAxisLabel.bind(this))
.attr("dx", this.dxForYAxisLabel.bind(this))
.attr("dy", this.dyForYAxisLabel.bind(this))
.text(this.textForYAxisLabel.bind(this));
(withTransition ? axisY2Label.transition() : axisY2Label)
.attr("x", this.xForY2AxisLabel.bind(this))
.attr("dx", this.dxForY2AxisLabel.bind(this))
.attr("dy", this.dyForY2AxisLabel.bind(this))
.text(this.textForY2AxisLabel.bind(this));
};
Axis.prototype.getPadding = function getPadding(padding, key, defaultValue, domainLength) {
var p = typeof padding === 'number' ? padding : padding[key];
if (!isValue(p)) {
return defaultValue;
}
if (padding.unit === 'ratio') {
return padding[key] * domainLength;
}
return this.convertPixelsToAxisPadding(p, domainLength);
};
Axis.prototype.convertPixelsToAxisPadding = function convertPixelsToAxisPadding(pixels, domainLength) {
var $$ = this.owner,
length = $$.config.axis_rotated ? $$.width : $$.height;
return domainLength * (pixels / length);
};
Axis.prototype.generateTickValues = function generateTickValues(values, tickCount, forTimeSeries) {
var tickValues = values, targetCount, start, end, count, interval, i, tickValue;
if (tickCount) {
targetCount = isFunction(tickCount) ? tickCount() : tickCount;
if (targetCount === 1) {
tickValues = [values[0]];
} else if (targetCount === 2) {
tickValues = [values[0], values[values.length - 1]];
} else if (targetCount > 2) {
count = targetCount - 2;
start = values[0];
end = values[values.length - 1];
interval = (end - start) / (count + 1);
tickValues = [start];
for (i = 0; i < count; i++) {
tickValue = +start + interval * (i + 1);
tickValues.push(forTimeSeries ? new Date(tickValue) : tickValue);
}
tickValues.push(end);
}
}
if (!forTimeSeries) { tickValues = tickValues.sort(function (a, b) { return a - b; }); }
return tickValues;
};
Axis.prototype.generateTransitions = function generateTransitions(duration) {
var $$ = this.owner, axes = $$.axes;
return {
axisX: duration ? axes.x.transition().duration(duration) : axes.x,
axisY: duration ? axes.y.transition().duration(duration) : axes.y,
axisY2: duration ? axes.y2.transition().duration(duration) : axes.y2,
axisSubX: duration ? axes.subx.transition().duration(duration) : axes.subx
};
};
Axis.prototype.redraw = function redraw(transitions, isHidden) {
var $$ = this.owner;
$$.axes.x.style("opacity", isHidden ? 0 : 1);
$$.axes.y.style("opacity", isHidden ? 0 : 1);
$$.axes.y2.style("opacity", isHidden ? 0 : 1);
$$.axes.subx.style("opacity", isHidden ? 0 : 1);
transitions.axisX.call($$.xAxis);
transitions.axisY.call($$.yAxis);
transitions.axisY2.call($$.y2Axis);
transitions.axisSubX.call($$.subXAxis);
};
c3_chart_internal_fn.getClipPath = function (id) {
var isIE9 = window.navigator.appVersion.toLowerCase().indexOf("msie 9.") >= 0;
return "url(" + (isIE9 ? "" : document.URL.split('#')[0]) + "#" + id + ")";
};
c3_chart_internal_fn.appendClip = function (parent, id) {
return parent.append("clipPath").attr("id", id).append("rect");
};
c3_chart_internal_fn.getAxisClipX = function (forHorizontal) {
var left = Math.max(30, this.margin.left);
return forHorizontal ? -(1 + left) : -(left - 1);
};
c3_chart_internal_fn.getAxisClipY = function (forHorizontal) {
return forHorizontal ? -20 : -this.margin.top;
};
c3_chart_internal_fn.getXAxisClipX = function () {
var $$ = this;
return $$.getAxisClipX(!$$.config.axis_rotated);
};
c3_chart_internal_fn.getXAxisClipY = function () {
var $$ = this;
return $$.getAxisClipY(!$$.config.axis_rotated);
};
c3_chart_internal_fn.getYAxisClipX = function () {
var $$ = this;
return $$.config.axis_y_inner ? -1 : $$.getAxisClipX($$.config.axis_rotated);
};
c3_chart_internal_fn.getYAxisClipY = function () {
var $$ = this;
return $$.getAxisClipY($$.config.axis_rotated);
};
c3_chart_internal_fn.getAxisClipWidth = function (forHorizontal) {
var $$ = this,
left = Math.max(30, $$.margin.left),
right = Math.max(30, $$.margin.right);
return forHorizontal ? $$.width + 2 + left + right : $$.margin.left + 20;
};
c3_chart_internal_fn.getAxisClipHeight = function (forHorizontal) {
return (forHorizontal ? this.margin.bottom : (this.margin.top + this.height)) + 20;
};
c3_chart_internal_fn.getXAxisClipWidth = function () {
var $$ = this;
return $$.getAxisClipWidth(!$$.config.axis_rotated);
};
c3_chart_internal_fn.getXAxisClipHeight = function () {
var $$ = this;
return $$.getAxisClipHeight(!$$.config.axis_rotated);
};
c3_chart_internal_fn.getYAxisClipWidth = function () {
var $$ = this;
return $$.getAxisClipWidth($$.config.axis_rotated) + ($$.config.axis_y_inner ? 20 : 0);
};
c3_chart_internal_fn.getYAxisClipHeight = function () {
var $$ = this;
return $$.getAxisClipHeight($$.config.axis_rotated);
};
c3_chart_internal_fn.initPie = function () {
var $$ = this, d3 = $$.d3, config = $$.config;
$$.pie = d3.layout.pie().value(function (d) {
return d.values.reduce(function (a, b) { return a + b.value; }, 0);
});
if (!config.data_order) {
$$.pie.sort(null);
}
};
c3_chart_internal_fn.updateRadius = function () {
var $$ = this, config = $$.config,
w = config.gauge_width || config.donut_width;
$$.radiusExpanded = Math.min($$.arcWidth, $$.arcHeight) / 2;
$$.radius = $$.radiusExpanded * 0.95;
$$.innerRadiusRatio = w ? ($$.radius - w) / $$.radius : 0.6;
$$.innerRadius = $$.hasType('donut') || $$.hasType('gauge') ? $$.radius * $$.innerRadiusRatio : 0;
};
c3_chart_internal_fn.updateArc = function () {
var $$ = this;
$$.svgArc = $$.getSvgArc();
$$.svgArcExpanded = $$.getSvgArcExpanded();
$$.svgArcExpandedSub = $$.getSvgArcExpanded(0.98);
};
c3_chart_internal_fn.updateAngle = function (d) {
var $$ = this, config = $$.config,
found = false, index = 0,
gMin, gMax, gTic, gValue;
if (!config) {
return null;
}
$$.pie($$.filterTargetsToShow($$.data.targets)).forEach(function (t) {
if (! found && t.data.id === d.data.id) {
found = true;
d = t;
d.index = index;
}
index++;
});
if (isNaN(d.startAngle)) {
d.startAngle = 0;
}
if (isNaN(d.endAngle)) {
d.endAngle = d.startAngle;
}
if ($$.isGaugeType(d.data)) {
gMin = config.gauge_min;
gMax = config.gauge_max;
gTic = (Math.PI) / (gMax - gMin);
gValue = d.value < gMin ? 0 : d.value < gMax ? d.value - gMin : (gMax - gMin);
d.startAngle = -1 * (Math.PI / 2);
d.endAngle = d.startAngle + gTic * gValue;
}
return found ? d : null;
};
c3_chart_internal_fn.getSvgArc = function () {
var $$ = this,
arc = $$.d3.svg.arc().outerRadius($$.radius).innerRadius($$.innerRadius),
newArc = function (d, withoutUpdate) {
var updated;
if (withoutUpdate) { return arc(d); }
updated = $$.updateAngle(d);
return updated ? arc(updated) : "M 0 0";
};
newArc.centroid = arc.centroid;
return newArc;
};
c3_chart_internal_fn.getSvgArcExpanded = function (rate) {
var $$ = this,
arc = $$.d3.svg.arc().outerRadius($$.radiusExpanded * (rate ? rate : 1)).innerRadius($$.innerRadius);
return function (d) {
var updated = $$.updateAngle(d);
return updated ? arc(updated) : "M 0 0";
};
};
c3_chart_internal_fn.getArc = function (d, withoutUpdate, force) {
return force || this.isArcType(d.data) ? this.svgArc(d, withoutUpdate) : "M 0 0";
};
c3_chart_internal_fn.transformForArcLabel = function (d) {
var $$ = this,
updated = $$.updateAngle(d), c, x, y, h, ratio, translate = "";
if (updated && !$$.hasType('gauge')) {
c = this.svgArc.centroid(updated);
x = isNaN(c[0]) ? 0 : c[0];
y = isNaN(c[1]) ? 0 : c[1];
h = Math.sqrt(x * x + y * y);
ratio = $$.radius && h ? (36 / $$.radius > 0.375 ? 1.175 - 36 / $$.radius : 0.8) * $$.radius / h : 0;
translate = "translate(" + (x * ratio) +  ',' + (y * ratio) +  ")";
}
return translate;
};
c3_chart_internal_fn.getArcRatio = function (d) {
var $$ = this,
whole = $$.hasType('gauge') ? Math.PI : (Math.PI * 2);
return d ? (d.endAngle - d.startAngle) / whole : null;
};
c3_chart_internal_fn.convertToArcData = function (d) {
return this.addName({
id: d.data.id,
value: d.value,
ratio: this.getArcRatio(d),
index: d.index
});
};
c3_chart_internal_fn.textForArcLabel = function (d) {
var $$ = this,
updated, value, ratio, id, format;
if (! $$.shouldShowArcLabel()) { return ""; }
updated = $$.updateAngle(d);
value = updated ? updated.value : null;
ratio = $$.getArcRatio(updated);
id = d.data.id;
if (! $$.hasType('gauge') && ! $$.meetsArcLabelThreshold(ratio)) { return ""; }
format = $$.getArcLabelFormat();
return format ? format(value, ratio, id) : $$.defaultArcValueFormat(value, ratio);
};
c3_chart_internal_fn.expandArc = function (targetIds) {
var $$ = this, interval;
if ($$.transiting) {
interval = window.setInterval(function () {
if (!$$.transiting) {
window.clearInterval(interval);
if ($$.legend.selectAll('.c3-legend-item-focused').size() > 0) {
$$.expandArc(targetIds);
}
}
}, 10);
return;
}
targetIds = $$.mapToTargetIds(targetIds);
$$.svg.selectAll($$.selectorTargets(targetIds, '.' + CLASS.chartArc)).each(function (d) {
if (! $$.shouldExpand(d.data.id)) { return; }
$$.d3.select(this).selectAll('path')
.transition().duration($$.expandDuration(d.data.id))
.attr("d", $$.svgArcExpanded)
.transition().duration($$.expandDuration(d.data.id) * 2)
.attr("d", $$.svgArcExpandedSub)
.each(function (d) {
if ($$.isDonutType(d.data)) {
}
});
});
};
c3_chart_internal_fn.unexpandArc = function (targetIds) {
var $$ = this;
if ($$.transiting) { return; }
targetIds = $$.mapToTargetIds(targetIds);
$$.svg.selectAll($$.selectorTargets(targetIds, '.' + CLASS.chartArc)).selectAll('path')
.transition().duration(function(d) {
return $$.expandDuration(d.data.id);
})
.attr("d", $$.svgArc);
$$.svg.selectAll('.' + CLASS.arc)
.style("opacity", 1);
};
c3_chart_internal_fn.expandDuration = function (id) {
var $$ = this, config = $$.config;
if ($$.isDonutType(id)) {
return config.donut_expand_duration;
} else if ($$.isGaugeType(id)) {
return config.gauge_expand_duration;
} else if ($$.isPieType(id)) {
return config.pie_expand_duration;
} else {
return 50;
}
};
c3_chart_internal_fn.shouldExpand = function (id) {
var $$ = this, config = $$.config;
return ($$.isDonutType(id) && config.donut_expand) ||
($$.isGaugeType(id) && config.gauge_expand) ||
($$.isPieType(id) && config.pie_expand);
};
c3_chart_internal_fn.shouldShowArcLabel = function () {
var $$ = this, config = $$.config, shouldShow = true;
if ($$.hasType('donut')) {
shouldShow = config.donut_label_show;
} else if ($$.hasType('pie')) {
shouldShow = config.pie_label_show;
}
return shouldShow;
};
c3_chart_internal_fn.meetsArcLabelThreshold = function (ratio) {
var $$ = this, config = $$.config,
threshold = $$.hasType('donut') ? config.donut_label_threshold : config.pie_label_threshold;
return ratio >= threshold;
};
c3_chart_internal_fn.getArcLabelFormat = function () {
var $$ = this, config = $$.config,
format = config.pie_label_format;
if ($$.hasType('gauge')) {
format = config.gauge_label_format;
} else if ($$.hasType('donut')) {
format = config.donut_label_format;
}
return format;
};
c3_chart_internal_fn.getArcTitle = function () {
var $$ = this;
return $$.hasType('donut') ? $$.config.donut_title : "";
};
c3_chart_internal_fn.updateTargetsForArc = function (targets) {
var $$ = this, main = $$.main,
mainPieUpdate, mainPieEnter,
classChartArc = $$.classChartArc.bind($$),
classArcs = $$.classArcs.bind($$),
classFocus = $$.classFocus.bind($$);
mainPieUpdate = main.select('.' + CLASS.chartArcs).selectAll('.' + CLASS.chartArc)
.data($$.pie(targets))
.attr("class", function (d) { return classChartArc(d) + classFocus(d.data); });
mainPieEnter = mainPieUpdate.enter().append("g")
.attr("class", classChartArc);
mainPieEnter.append('g')
.attr('class', classArcs);
mainPieEnter.append("text")
.attr("dy", $$.hasType('gauge') ? "-.1em" : ".35em")
.style("opacity", 0)
.style("text-anchor", "middle")
.style("pointer-events", "none");
};
c3_chart_internal_fn.initArc = function () {
var $$ = this;
$$.arcs = $$.main.select('.' + CLASS.chart).append("g")
.attr("class", CLASS.chartArcs)
.attr("transform", $$.getTranslate('arc'));
$$.arcs.append('text')
.attr('class', CLASS.chartArcsTitle)
.style("text-anchor", "middle")
.text($$.getArcTitle());
};
c3_chart_internal_fn.redrawArc = function (duration, durationForExit, withTransform) {
var $$ = this, d3 = $$.d3, config = $$.config, main = $$.main,
mainArc;
mainArc = main.selectAll('.' + CLASS.arcs).selectAll('.' + CLASS.arc)
.data($$.arcData.bind($$));
mainArc.enter().append('path')
.attr("class", $$.classArc.bind($$))
.style("fill", function (d) { return $$.color(d.data); })
.style("cursor", function (d) { return config.interaction_enabled && config.data_selection_isselectable(d) ? "pointer" : null; })
.style("opacity", 0)
.each(function (d) {
if ($$.isGaugeType(d.data)) {
d.startAngle = d.endAngle = -1 * (Math.PI / 2);
}
this._current = d;
});
mainArc
.attr("transform", function (d) { return !$$.isGaugeType(d.data) && withTransform ? "scale(0)" : ""; })
.style("opacity", function (d) { return d === this._current ? 0 : 1; })
.on('mouseover', config.interaction_enabled ? function (d) {
var updated, arcData;
if ($$.transiting) {
return;
}
updated = $$.updateAngle(d);
if (updated) {
arcData = $$.convertToArcData(updated);
$$.expandArc(updated.data.id);
$$.api.focus(updated.data.id);
$$.toggleFocusLegend(updated.data.id, true);
$$.config.data_onmouseover(arcData, this);
}
} : null)
.on('mousemove', config.interaction_enabled ? function (d) {
var updated = $$.updateAngle(d), arcData, selectedData;
if (updated) {
arcData = $$.convertToArcData(updated),
selectedData = [arcData];
$$.showTooltip(selectedData, this);
}
} : null)
.on('mouseout', config.interaction_enabled ? function (d) {
var updated, arcData;
if ($$.transiting) {
return;
}
updated = $$.updateAngle(d);
if (updated) {
arcData = $$.convertToArcData(updated);
$$.unexpandArc(updated.data.id);
$$.api.revert();
$$.revertLegend();
$$.hideTooltip();
$$.config.data_onmouseout(arcData, this);
}
} : null)
.on('click', config.interaction_enabled ? function (d, i) {
var updated = $$.updateAngle(d), arcData;
if (updated) {
arcData = $$.convertToArcData(updated);
if ($$.toggleShape) {
$$.toggleShape(this, arcData, i);
}
$$.config.data_onclick.call($$.api, arcData, this);
}
} : null)
.each(function () { $$.transiting = true; })
.transition().duration(duration)
.attrTween("d", function (d) {
var updated = $$.updateAngle(d), interpolate;
if (! updated) {
return function () { return "M 0 0"; };
}
if (isNaN(this._current.startAngle)) {
this._current.startAngle = 0;
}
if (isNaN(this._current.endAngle)) {
this._current.endAngle = this._current.startAngle;
}
interpolate = d3.interpolate(this._current, updated);
this._current = interpolate(0);
return function (t) {
var interpolated = interpolate(t);
interpolated.data = d.data;
return $$.getArc(interpolated, true);
};
})
.attr("transform", withTransform ? "scale(1)" : "")
.style("fill", function (d) {
return $$.levelColor ? $$.levelColor(d.data.values[0].value) : $$.color(d.data.id);
})
.style("opacity", 1)
.call($$.endall, function () {
$$.transiting = false;
});
mainArc.exit().transition().duration(durationForExit)
.style('opacity', 0)
.remove();
main.selectAll('.' + CLASS.chartArc).select('text')
.style("opacity", 0)
.attr('class', function (d) { return $$.isGaugeType(d.data) ? CLASS.gaugeValue : ''; })
.text($$.textForArcLabel.bind($$))
.attr("transform", $$.transformForArcLabel.bind($$))
.style('font-size', function (d) { return $$.isGaugeType(d.data) ? Math.round($$.radius / 5) + 'px' : ''; })
.transition().duration(duration)
.style("opacity", function (d) { return $$.isTargetToShow(d.data.id) && $$.isArcType(d.data) ? 1 : 0; });
main.select('.' + CLASS.chartArcsTitle)
.style("opacity", $$.hasType('donut') || $$.hasType('gauge') ? 1 : 0);
if ($$.hasType('gauge')) {
$$.arcs.select('.' + CLASS.chartArcsBackground)
.attr("d", function () {
var d = {
data: [{value: config.gauge_max}],
startAngle: -1 * (Math.PI / 2),
endAngle: Math.PI / 2
};
return $$.getArc(d, true, true);
});
$$.arcs.select('.' + CLASS.chartArcsGaugeUnit)
.attr("dy", ".75em")
.text(config.gauge_label_show ? config.gauge_units : '');
$$.arcs.select('.' + CLASS.chartArcsGaugeMin)
.attr("dx", -1 * ($$.innerRadius + (($$.radius - $$.innerRadius) / 2)) + "px")
.attr("dy", "1.2em")
.text(config.gauge_label_show ? config.gauge_min : '');
$$.arcs.select('.' + CLASS.chartArcsGaugeMax)
.attr("dx", $$.innerRadius + (($$.radius - $$.innerRadius) / 2) + "px")
.attr("dy", "1.2em")
.text(config.gauge_label_show ? config.gauge_max : '');
}
};
c3_chart_internal_fn.initGauge = function () {
var arcs = this.arcs;
if (this.hasType('gauge')) {
arcs.append('path')
.attr("class", CLASS.chartArcsBackground);
arcs.append("text")
.attr("class", CLASS.chartArcsGaugeUnit)
.style("text-anchor", "middle")
.style("pointer-events", "none");
arcs.append("text")
.attr("class", CLASS.chartArcsGaugeMin)
.style("text-anchor", "middle")
.style("pointer-events", "none");
arcs.append("text")
.attr("class", CLASS.chartArcsGaugeMax)
.style("text-anchor", "middle")
.style("pointer-events", "none");
}
};
c3_chart_internal_fn.getGaugeLabelHeight = function () {
return this.config.gauge_label_show ? 20 : 0;
};
c3_chart_internal_fn.initRegion = function () {
var $$ = this;
$$.region = $$.main.append('g')
.attr("clip-path", $$.clipPath)
.attr("class", CLASS.regions);
};
c3_chart_internal_fn.updateRegion = function (duration) {
var $$ = this, config = $$.config;
$$.region.style('visibility', $$.hasArcType() ? 'hidden' : 'visible');
$$.mainRegion = $$.main.select('.' + CLASS.regions).selectAll('.' + CLASS.region)
.data(config.regions);
$$.mainRegion.enter().append('g')
.attr('class', $$.classRegion.bind($$))
.append('rect')
.style("fill-opacity", 0);
$$.mainRegion.exit().transition().duration(duration)
.style("opacity", 0)
.remove();
};
c3_chart_internal_fn.redrawRegion = function (withTransition) {
var $$ = this,
regions = $$.mainRegion.selectAll('rect'),
x = $$.regionX.bind($$),
y = $$.regionY.bind($$),
w = $$.regionWidth.bind($$),
h = $$.regionHeight.bind($$);
return [
(withTransition ? regions.transition() : regions)
.attr("x", x)
.attr("y", y)
.attr("width", w)
.attr("height", h)
.style("fill-opacity", function (d) { return isValue(d.opacity) ? d.opacity : 0.1; })
];
};
c3_chart_internal_fn.regionX = function (d) {
var $$ = this, config = $$.config,
xPos, yScale = d.axis === 'y' ? $$.y : $$.y2;
if (d.axis === 'y' || d.axis === 'y2') {
xPos = config.axis_rotated ? ('start' in d ? yScale(d.start) : 0) : 0;
} else {
xPos = config.axis_rotated ? 0 : ('start' in d ? $$.x($$.isTimeSeries() ? $$.parseDate(d.start) : d.start) : 0);
}
return xPos;
};
c3_chart_internal_fn.regionY = function (d) {
var $$ = this, config = $$.config,
yPos, yScale = d.axis === 'y' ? $$.y : $$.y2;
if (d.axis === 'y' || d.axis === 'y2') {
yPos = config.axis_rotated ? 0 : ('end' in d ? yScale(d.end) : 0);
} else {
yPos = config.axis_rotated ? ('start' in d ? $$.x($$.isTimeSeries() ? $$.parseDate(d.start) : d.start) : 0) : 0;
}
return yPos;
};
c3_chart_internal_fn.regionWidth = function (d) {
var $$ = this, config = $$.config,
start = $$.regionX(d), end, yScale = d.axis === 'y' ? $$.y : $$.y2;
if (d.axis === 'y' || d.axis === 'y2') {
end = config.axis_rotated ? ('end' in d ? yScale(d.end) : $$.width) : $$.width;
} else {
end = config.axis_rotated ? $$.width : ('end' in d ? $$.x($$.isTimeSeries() ? $$.parseDate(d.end) : d.end) : $$.width);
}
return end < start ? 0 : end - start;
};
c3_chart_internal_fn.regionHeight = function (d) {
var $$ = this, config = $$.config,
start = this.regionY(d), end, yScale = d.axis === 'y' ? $$.y : $$.y2;
if (d.axis === 'y' || d.axis === 'y2') {
end = config.axis_rotated ? $$.height : ('start' in d ? yScale(d.start) : $$.height);
} else {
end = config.axis_rotated ? ('end' in d ? $$.x($$.isTimeSeries() ? $$.parseDate(d.end) : d.end) : $$.height) : $$.height;
}
return end < start ? 0 : end - start;
};
c3_chart_internal_fn.isRegionOnX = function (d) {
return !d.axis || d.axis === 'x';
};
c3_chart_internal_fn.drag = function (mouse) {
var $$ = this, config = $$.config, main = $$.main, d3 = $$.d3;
var sx, sy, mx, my, minX, maxX, minY, maxY;
if ($$.hasArcType()) { return; }
if (! config.data_selection_enabled) { return; }
if (config.zoom_enabled && ! $$.zoom.altDomain) { return; }
if (!config.data_selection_multiple) { return; }
sx = $$.dragStart[0];
sy = $$.dragStart[1];
mx = mouse[0];
my = mouse[1];
minX = Math.min(sx, mx);
maxX = Math.max(sx, mx);
minY = (config.data_selection_grouped) ? $$.margin.top : Math.min(sy, my);
maxY = (config.data_selection_grouped) ? $$.height : Math.max(sy, my);
main.select('.' + CLASS.dragarea)
.attr('x', minX)
.attr('y', minY)
.attr('width', maxX - minX)
.attr('height', maxY - minY);
main.selectAll('.' + CLASS.shapes).selectAll('.' + CLASS.shape)
.filter(function (d) { return config.data_selection_isselectable(d); })
.each(function (d, i) {
var shape = d3.select(this),
isSelected = shape.classed(CLASS.SELECTED),
isIncluded = shape.classed(CLASS.INCLUDED),
_x, _y, _w, _h, toggle, isWithin = false, box;
if (shape.classed(CLASS.circle)) {
_x = shape.attr("cx") * 1;
_y = shape.attr("cy") * 1;
toggle = $$.togglePoint;
isWithin = minX < _x && _x < maxX && minY < _y && _y < maxY;
}
else if (shape.classed(CLASS.bar)) {
box = getPathBox(this);
_x = box.x;
_y = box.y;
_w = box.width;
_h = box.height;
toggle = $$.togglePath;
isWithin = !(maxX < _x || _x + _w < minX) && !(maxY < _y || _y + _h < minY);
} else {
return;
}
if (isWithin ^ isIncluded) {
shape.classed(CLASS.INCLUDED, !isIncluded);
shape.classed(CLASS.SELECTED, !isSelected);
toggle.call($$, !isSelected, shape, d, i);
}
});
};
c3_chart_internal_fn.dragstart = function (mouse) {
var $$ = this, config = $$.config;
if ($$.hasArcType()) { return; }
if (! config.data_selection_enabled) { return; }
$$.dragStart = mouse;
$$.main.select('.' + CLASS.chart).append('rect')
.attr('class', CLASS.dragarea)
.style('opacity', 0.1);
$$.dragging = true;
};
c3_chart_internal_fn.dragend = function () {
var $$ = this, config = $$.config;
if ($$.hasArcType()) { return; }
if (! config.data_selection_enabled) { return; }
$$.main.select('.' + CLASS.dragarea)
.transition().duration(100)
.style('opacity', 0)
.remove();
$$.main.selectAll('.' + CLASS.shape)
.classed(CLASS.INCLUDED, false);
$$.dragging = false;
};
c3_chart_internal_fn.selectPoint = function (target, d, i) {
var $$ = this, config = $$.config,
cx = (config.axis_rotated ? $$.circleY : $$.circleX).bind($$),
cy = (config.axis_rotated ? $$.circleX : $$.circleY).bind($$),
r = $$.pointSelectR.bind($$);
config.data_onselected.call($$.api, d, target.node());
$$.main.select('.' + CLASS.selectedCircles + $$.getTargetSelectorSuffix(d.id)).selectAll('.' + CLASS.selectedCircle + '-' + i)
.data([d])
.enter().append('circle')
.attr("class", function () { return $$.generateClass(CLASS.selectedCircle, i); })
.attr("cx", cx)
.attr("cy", cy)
.attr("stroke", function () { return $$.color(d); })
.attr("r", function (d) { return $$.pointSelectR(d) * 1.4; })
.transition().duration(100)
.attr("r", r);
};
c3_chart_internal_fn.unselectPoint = function (target, d, i) {
var $$ = this;
$$.config.data_onunselected.call($$.api, d, target.node());
$$.main.select('.' + CLASS.selectedCircles + $$.getTargetSelectorSuffix(d.id)).selectAll('.' + CLASS.selectedCircle + '-' + i)
.transition().duration(100).attr('r', 0)
.remove();
};
c3_chart_internal_fn.togglePoint = function (selected, target, d, i) {
selected ? this.selectPoint(target, d, i) : this.unselectPoint(target, d, i);
};
c3_chart_internal_fn.selectPath = function (target, d) {
var $$ = this;
$$.config.data_onselected.call($$, d, target.node());
target.transition().duration(100)
.style("fill", function () { return $$.d3.rgb($$.color(d)).brighter(0.75); });
};
c3_chart_internal_fn.unselectPath = function (target, d) {
var $$ = this;
$$.config.data_onunselected.call($$, d, target.node());
target.transition().duration(100)
.style("fill", function () { return $$.color(d); });
};
c3_chart_internal_fn.togglePath = function (selected, target, d, i) {
selected ? this.selectPath(target, d, i) : this.unselectPath(target, d, i);
};
c3_chart_internal_fn.getToggle = function (that, d) {
var $$ = this, toggle;
if (that.nodeName === 'circle') {
if ($$.isStepType(d)) {
toggle = function () {};
} else {
toggle = $$.togglePoint;
}
}
else if (that.nodeName === 'path') {
toggle = $$.togglePath;
}
return toggle;
};
c3_chart_internal_fn.toggleShape = function (that, d, i) {
var $$ = this, d3 = $$.d3, config = $$.config,
shape = d3.select(that), isSelected = shape.classed(CLASS.SELECTED),
toggle = $$.getToggle(that, d).bind($$);
if (config.data_selection_enabled && config.data_selection_isselectable(d)) {
if (!config.data_selection_multiple) {
$$.main.selectAll('.' + CLASS.shapes + (config.data_selection_grouped ? $$.getTargetSelectorSuffix(d.id) : "")).selectAll('.' + CLASS.shape).each(function (d, i) {
var shape = d3.select(this);
if (shape.classed(CLASS.SELECTED)) { toggle(false, shape.classed(CLASS.SELECTED, false), d, i); }
});
}
shape.classed(CLASS.SELECTED, !isSelected);
toggle(!isSelected, shape, d, i);
}
};
c3_chart_internal_fn.initBrush = function () {
var $$ = this, d3 = $$.d3;
$$.brush = d3.svg.brush().on("brush", function () { $$.redrawForBrush(); });
$$.brush.update = function () {
if ($$.context) { $$.context.select('.' + CLASS.brush).call(this); }
return this;
};
$$.brush.scale = function (scale) {
return $$.config.axis_rotated ? this.y(scale) : this.x(scale);
};
};
c3_chart_internal_fn.initSubchart = function () {
var $$ = this, config = $$.config,
context = $$.context = $$.svg.append("g").attr("transform", $$.getTranslate('context')),
visibility = config.subchart_show ? 'visible' : 'hidden';
context.style('visibility', visibility);
context.append('g')
.attr("clip-path", $$.clipPathForSubchart)
.attr('class', CLASS.chart);
context.select('.' + CLASS.chart).append("g")
.attr("class", CLASS.chartBars);
context.select('.' + CLASS.chart).append("g")
.attr("class", CLASS.chartLines);
context.append("g")
.attr("clip-path", $$.clipPath)
.attr("class", CLASS.brush)
.call($$.brush);
$$.axes.subx = context.append("g")
.attr("class", CLASS.axisX)
.attr("transform", $$.getTranslate('subx'))
.attr("clip-path", config.axis_rotated ? "" : $$.clipPathForXAxis)
.style("visibility", config.subchart_axis_x_show ? visibility : 'hidden');
};
c3_chart_internal_fn.updateTargetsForSubchart = function (targets) {
var $$ = this, context = $$.context, config = $$.config,
contextLineEnter, contextLineUpdate, contextBarEnter, contextBarUpdate,
classChartBar = $$.classChartBar.bind($$),
classBars = $$.classBars.bind($$),
classChartLine = $$.classChartLine.bind($$),
classLines = $$.classLines.bind($$),
classAreas = $$.classAreas.bind($$);
if (config.subchart_show) {
contextBarUpdate = context.select('.' + CLASS.chartBars).selectAll('.' + CLASS.chartBar)
.data(targets)
.attr('class', classChartBar);
contextBarEnter = contextBarUpdate.enter().append('g')
.style('opacity', 0)
.attr('class', classChartBar);
contextBarEnter.append('g')
.attr("class", classBars);
contextLineUpdate = context.select('.' + CLASS.chartLines).selectAll('.' + CLASS.chartLine)
.data(targets)
.attr('class', classChartLine);
contextLineEnter = contextLineUpdate.enter().append('g')
.style('opacity', 0)
.attr('class', classChartLine);
contextLineEnter.append("g")
.attr("class", classLines);
contextLineEnter.append("g")
.attr("class", classAreas);
context.selectAll('.' + CLASS.brush + ' rect')
.attr(config.axis_rotated ? "width" : "height", config.axis_rotated ? $$.width2 : $$.height2);
}
};
c3_chart_internal_fn.updateBarForSubchart = function (durationForExit) {
var $$ = this;
$$.contextBar = $$.context.selectAll('.' + CLASS.bars).selectAll('.' + CLASS.bar)
.data($$.barData.bind($$));
$$.contextBar.enter().append('path')
.attr("class", $$.classBar.bind($$))
.style("stroke", 'none')
.style("fill", $$.color);
$$.contextBar
.style("opacity", $$.initialOpacity.bind($$));
$$.contextBar.exit().transition().duration(durationForExit)
.style('opacity', 0)
.remove();
};
c3_chart_internal_fn.redrawBarForSubchart = function (drawBarOnSub, withTransition, duration) {
(withTransition ? this.contextBar.transition(Math.random().toString()).duration(duration) : this.contextBar)
.attr('d', drawBarOnSub)
.style('opacity', 1);
};
c3_chart_internal_fn.updateLineForSubchart = function (durationForExit) {
var $$ = this;
$$.contextLine = $$.context.selectAll('.' + CLASS.lines).selectAll('.' + CLASS.line)
.data($$.lineData.bind($$));
$$.contextLine.enter().append('path')
.attr('class', $$.classLine.bind($$))
.style('stroke', $$.color);
$$.contextLine
.style("opacity", $$.initialOpacity.bind($$));
$$.contextLine.exit().transition().duration(durationForExit)
.style('opacity', 0)
.remove();
};
c3_chart_internal_fn.redrawLineForSubchart = function (drawLineOnSub, withTransition, duration) {
(withTransition ? this.contextLine.transition(Math.random().toString()).duration(duration) : this.contextLine)
.attr("d", drawLineOnSub)
.style('opacity', 1);
};
c3_chart_internal_fn.updateAreaForSubchart = function (durationForExit) {
var $$ = this, d3 = $$.d3;
$$.contextArea = $$.context.selectAll('.' + CLASS.areas).selectAll('.' + CLASS.area)
.data($$.lineData.bind($$));
$$.contextArea.enter().append('path')
.attr("class", $$.classArea.bind($$))
.style("fill", $$.color)
.style("opacity", function () { $$.orgAreaOpacity = +d3.select(this).style('opacity'); return 0; });
$$.contextArea
.style("opacity", 0);
$$.contextArea.exit().transition().duration(durationForExit)
.style('opacity', 0)
.remove();
};
c3_chart_internal_fn.redrawAreaForSubchart = function (drawAreaOnSub, withTransition, duration) {
(withTransition ? this.contextArea.transition(Math.random().toString()).duration(duration) : this.contextArea)
.attr("d", drawAreaOnSub)
.style("fill", this.color)
.style("opacity", this.orgAreaOpacity);
};
c3_chart_internal_fn.redrawSubchart = function (withSubchart, transitions, duration, durationForExit, areaIndices, barIndices, lineIndices) {
var $$ = this, d3 = $$.d3, config = $$.config,
drawAreaOnSub, drawBarOnSub, drawLineOnSub;
$$.context.style('visibility', config.subchart_show ? 'visible' : 'hidden');
if (config.subchart_show) {
if (d3.event && d3.event.type === 'zoom') {
$$.brush.extent($$.x.orgDomain()).update();
}
if (withSubchart) {
if (!$$.brush.empty()) {
$$.brush.extent($$.x.orgDomain()).update();
}
drawAreaOnSub = $$.generateDrawArea(areaIndices, true);
drawBarOnSub = $$.generateDrawBar(barIndices, true);
drawLineOnSub = $$.generateDrawLine(lineIndices, true);
$$.updateBarForSubchart(duration);
$$.updateLineForSubchart(duration);
$$.updateAreaForSubchart(duration);
$$.redrawBarForSubchart(drawBarOnSub, duration, duration);
$$.redrawLineForSubchart(drawLineOnSub, duration, duration);
$$.redrawAreaForSubchart(drawAreaOnSub, duration, duration);
}
}
};
c3_chart_internal_fn.redrawForBrush = function () {
var $$ = this, x = $$.x;
$$.redraw({
withTransition: false,
withY: $$.config.zoom_rescale,
withSubchart: false,
withUpdateXDomain: true,
withDimension: false
});
$$.config.subchart_onbrush.call($$.api, x.orgDomain());
};
c3_chart_internal_fn.transformContext = function (withTransition, transitions) {
var $$ = this, subXAxis;
if (transitions && transitions.axisSubX) {
subXAxis = transitions.axisSubX;
} else {
subXAxis = $$.context.select('.' + CLASS.axisX);
if (withTransition) { subXAxis = subXAxis.transition(); }
}
$$.context.attr("transform", $$.getTranslate('context'));
subXAxis.attr("transform", $$.getTranslate('subx'));
};
c3_chart_internal_fn.getDefaultExtent = function () {
var $$ = this, config = $$.config,
extent = isFunction(config.axis_x_extent) ? config.axis_x_extent($$.getXDomain($$.data.targets)) : config.axis_x_extent;
if ($$.isTimeSeries()) {
extent = [$$.parseDate(extent[0]), $$.parseDate(extent[1])];
}
return extent;
};
c3_chart_internal_fn.initZoom = function () {
var $$ = this, d3 = $$.d3, config = $$.config, startEvent;
$$.zoom = d3.behavior.zoom()
.on("zoomstart", function () {
startEvent = d3.event.sourceEvent;
$$.zoom.altDomain = d3.event.sourceEvent.altKey ? $$.x.orgDomain() : null;
config.zoom_onzoomstart.call($$.api, d3.event.sourceEvent);
})
.on("zoom", function () {
$$.redrawForZoom.call($$);
})
.on('zoomend', function () {
var event = d3.event.sourceEvent;
if (event && startEvent.clientX === event.clientX && startEvent.clientY === event.clientY) {
return;
}
$$.redrawEventRect();
$$.updateZoom();
config.zoom_onzoomend.call($$.api, $$.x.orgDomain());
});
$$.zoom.scale = function (scale) {
return config.axis_rotated ? this.y(scale) : this.x(scale);
};
$$.zoom.orgScaleExtent = function () {
var extent = config.zoom_extent ? config.zoom_extent : [1, 10];
return [extent[0], Math.max($$.getMaxDataCount() / extent[1], extent[1])];
};
$$.zoom.updateScaleExtent = function () {
var ratio = diffDomain($$.x.orgDomain()) / diffDomain($$.getZoomDomain()),
extent = this.orgScaleExtent();
this.scaleExtent([extent[0] * ratio, extent[1] * ratio]);
return this;
};
};
c3_chart_internal_fn.getZoomDomain = function () {
var $$ = this, config = $$.config, d3 = $$.d3,
min = d3.min([$$.orgXDomain[0], config.zoom_x_min]),
max = d3.max([$$.orgXDomain[1], config.zoom_x_max]);
return [min, max];
};
c3_chart_internal_fn.updateZoom = function () {
var $$ = this, z = $$.config.zoom_enabled ? $$.zoom : function () {};
$$.main.select('.' + CLASS.zoomRect).call(z).on("dblclick.zoom", null);
$$.main.selectAll('.' + CLASS.eventRect).call(z).on("dblclick.zoom", null);
};
c3_chart_internal_fn.redrawForZoom = function () {
var $$ = this, d3 = $$.d3, config = $$.config, zoom = $$.zoom, x = $$.x;
if (!config.zoom_enabled) {
return;
}
if ($$.filterTargetsToShow($$.data.targets).length === 0) {
return;
}
if (d3.event.sourceEvent.type === 'mousemove' && zoom.altDomain) {
x.domain(zoom.altDomain);
zoom.scale(x).updateScaleExtent();
return;
}
if ($$.isCategorized() && x.orgDomain()[0] === $$.orgXDomain[0]) {
x.domain([$$.orgXDomain[0] - 1e-10, x.orgDomain()[1]]);
}
$$.redraw({
withTransition: false,
withY: config.zoom_rescale,
withSubchart: false,
withEventRect: false,
withDimension: false
});
if (d3.event.sourceEvent.type === 'mousemove') {
$$.cancelClick = true;
}
config.zoom_onzoom.call($$.api, x.orgDomain());
};
c3_chart_internal_fn.generateColor = function () {
var $$ = this, config = $$.config, d3 = $$.d3,
colors = config.data_colors,
pattern = notEmpty(config.color_pattern) ? config.color_pattern : d3.scale.category10().range(),
callback = config.data_color,
ids = [];
return function (d) {
var id = d.id || (d.data && d.data.id) || d, color;
if (colors[id] instanceof Function) {
color = colors[id](d);
}
else if (colors[id]) {
color = colors[id];
}
else {
if (ids.indexOf(id) < 0) { ids.push(id); }
color = pattern[ids.indexOf(id) % pattern.length];
colors[id] = color;
}
return callback instanceof Function ? callback(color, d) : color;
};
};
c3_chart_internal_fn.generateLevelColor = function () {
var $$ = this, config = $$.config,
colors = config.color_pattern,
threshold = config.color_threshold,
asValue = threshold.unit === 'value',
values = threshold.values && threshold.values.length ? threshold.values : [],
max = threshold.max || 100;
return notEmpty(config.color_threshold) ? function (value) {
var i, v, color = colors[colors.length - 1];
for (i = 0; i < values.length; i++) {
v = asValue ? value : (value * 100 / max);
if (v < values[i]) {
color = colors[i];
break;
}
}
return color;
} : null;
};
c3_chart_internal_fn.getYFormat = function (forArc) {
var $$ = this,
formatForY = forArc && !$$.hasType('gauge') ? $$.defaultArcValueFormat : $$.yFormat,
formatForY2 = forArc && !$$.hasType('gauge') ? $$.defaultArcValueFormat : $$.y2Format;
return function (v, ratio, id) {
var format = $$.axis.getId(id) === 'y2' ? formatForY2 : formatForY;
return format.call($$, v, ratio);
};
};
c3_chart_internal_fn.yFormat = function (v) {
var $$ = this, config = $$.config,
format = config.axis_y_tick_format ? config.axis_y_tick_format : $$.defaultValueFormat;
return format(v);
};
c3_chart_internal_fn.y2Format = function (v) {
var $$ = this, config = $$.config,
format = config.axis_y2_tick_format ? config.axis_y2_tick_format : $$.defaultValueFormat;
return format(v);
};
c3_chart_internal_fn.defaultValueFormat = function (v) {
return isValue(v) ? +v : "";
};
c3_chart_internal_fn.defaultArcValueFormat = function (v, ratio) {
return (ratio * 100).toFixed(1) + '%';
};
c3_chart_internal_fn.dataLabelFormat = function (targetId) {
var $$ = this, data_labels = $$.config.data_labels,
format, defaultFormat = function (v) { return isValue(v) ? +v : ""; };
if (typeof data_labels.format === 'function') {
format = data_labels.format;
} else if (typeof data_labels.format === 'object') {
if (data_labels.format[targetId]) {
format = data_labels.format[targetId] === true ? defaultFormat : data_labels.format[targetId];
} else {
format = function () { return ''; };
}
} else {
format = defaultFormat;
}
return format;
};
c3_chart_internal_fn.hasCaches = function (ids) {
for (var i = 0; i < ids.length; i++) {
if (! (ids[i] in this.cache)) { return false; }
}
return true;
};
c3_chart_internal_fn.addCache = function (id, target) {
this.cache[id] = this.cloneTarget(target);
};
c3_chart_internal_fn.getCaches = function (ids) {
var targets = [], i;
for (i = 0; i < ids.length; i++) {
if (ids[i] in this.cache) { targets.push(this.cloneTarget(this.cache[ids[i]])); }
}
return targets;
};
var CLASS = c3_chart_internal_fn.CLASS = {
target: 'c3-target',
chart: 'c3-chart',
chartLine: 'c3-chart-line',
chartLines: 'c3-chart-lines',
chartBar: 'c3-chart-bar',
chartBars: 'c3-chart-bars',
chartText: 'c3-chart-text',
chartTexts: 'c3-chart-texts',
chartArc: 'c3-chart-arc',
chartArcs: 'c3-chart-arcs',
chartArcsTitle: 'c3-chart-arcs-title',
chartArcsBackground: 'c3-chart-arcs-background',
chartArcsGaugeUnit: 'c3-chart-arcs-gauge-unit',
chartArcsGaugeMax: 'c3-chart-arcs-gauge-max',
chartArcsGaugeMin: 'c3-chart-arcs-gauge-min',
selectedCircle: 'c3-selected-circle',
selectedCircles: 'c3-selected-circles',
eventRect: 'c3-event-rect',
eventRects: 'c3-event-rects',
eventRectsSingle: 'c3-event-rects-single',
eventRectsMultiple: 'c3-event-rects-multiple',
zoomRect: 'c3-zoom-rect',
brush: 'c3-brush',
focused: 'c3-focused',
defocused: 'c3-defocused',
region: 'c3-region',
regions: 'c3-regions',
title: 'c3-title',
tooltipContainer: 'c3-tooltip-container',
tooltip: 'c3-tooltip',
tooltipName: 'c3-tooltip-name',
shape: 'c3-shape',
shapes: 'c3-shapes',
line: 'c3-line',
lines: 'c3-lines',
bar: 'c3-bar',
bars: 'c3-bars',
circle: 'c3-circle',
circles: 'c3-circles',
arc: 'c3-arc',
arcs: 'c3-arcs',
area: 'c3-area',
areas: 'c3-areas',
empty: 'c3-empty',
text: 'c3-text',
texts: 'c3-texts',
gaugeValue: 'c3-gauge-value',
grid: 'c3-grid',
gridLines: 'c3-grid-lines',
xgrid: 'c3-xgrid',
xgrids: 'c3-xgrids',
xgridLine: 'c3-xgrid-line',
xgridLines: 'c3-xgrid-lines',
xgridFocus: 'c3-xgrid-focus',
ygrid: 'c3-ygrid',
ygrids: 'c3-ygrids',
ygridLine: 'c3-ygrid-line',
ygridLines: 'c3-ygrid-lines',
axis: 'c3-axis',
axisX: 'c3-axis-x',
axisXLabel: 'c3-axis-x-label',
axisY: 'c3-axis-y',
axisYLabel: 'c3-axis-y-label',
axisY2: 'c3-axis-y2',
axisY2Label: 'c3-axis-y2-label',
legendBackground: 'c3-legend-background',
legendItem: 'c3-legend-item',
legendItemEvent: 'c3-legend-item-event',
legendItemTile: 'c3-legend-item-tile',
legendItemHidden: 'c3-legend-item-hidden',
legendItemFocused: 'c3-legend-item-focused',
dragarea: 'c3-dragarea',
EXPANDED: '_expanded_',
SELECTED: '_selected_',
INCLUDED: '_included_'
};
c3_chart_internal_fn.generateClass = function (prefix, targetId) {
return " " + prefix + " " + prefix + this.getTargetSelectorSuffix(targetId);
};
c3_chart_internal_fn.classText = function (d) {
return this.generateClass(CLASS.text, d.index);
};
c3_chart_internal_fn.classTexts = function (d) {
return this.generateClass(CLASS.texts, d.id);
};
c3_chart_internal_fn.classShape = function (d) {
return this.generateClass(CLASS.shape, d.index);
};
c3_chart_internal_fn.classShapes = function (d) {
return this.generateClass(CLASS.shapes, d.id);
};
c3_chart_internal_fn.classLine = function (d) {
return this.classShape(d) + this.generateClass(CLASS.line, d.id);
};
c3_chart_internal_fn.classLines = function (d) {
return this.classShapes(d) + this.generateClass(CLASS.lines, d.id);
};
c3_chart_internal_fn.classCircle = function (d) {
return this.classShape(d) + this.generateClass(CLASS.circle, d.index);
};
c3_chart_internal_fn.classCircles = function (d) {
return this.classShapes(d) + this.generateClass(CLASS.circles, d.id);
};
c3_chart_internal_fn.classBar = function (d) {
return this.classShape(d) + this.generateClass(CLASS.bar, d.index);
};
c3_chart_internal_fn.classBars = function (d) {
return this.classShapes(d) + this.generateClass(CLASS.bars, d.id);
};
c3_chart_internal_fn.classArc = function (d) {
return this.classShape(d.data) + this.generateClass(CLASS.arc, d.data.id);
};
c3_chart_internal_fn.classArcs = function (d) {
return this.classShapes(d.data) + this.generateClass(CLASS.arcs, d.data.id);
};
c3_chart_internal_fn.classArea = function (d) {
return this.classShape(d) + this.generateClass(CLASS.area, d.id);
};
c3_chart_internal_fn.classAreas = function (d) {
return this.classShapes(d) + this.generateClass(CLASS.areas, d.id);
};
c3_chart_internal_fn.classRegion = function (d, i) {
return this.generateClass(CLASS.region, i) + ' ' + ('class' in d ? d['class'] : '');
};
c3_chart_internal_fn.classEvent = function (d) {
return this.generateClass(CLASS.eventRect, d.index);
};
c3_chart_internal_fn.classTarget = function (id) {
var $$ = this;
var additionalClassSuffix = $$.config.data_classes[id], additionalClass = '';
if (additionalClassSuffix) {
additionalClass = ' ' + CLASS.target + '-' + additionalClassSuffix;
}
return $$.generateClass(CLASS.target, id) + additionalClass;
};
c3_chart_internal_fn.classFocus = function (d) {
return this.classFocused(d) + this.classDefocused(d);
};
c3_chart_internal_fn.classFocused = function (d) {
return ' ' + (this.focusedTargetIds.indexOf(d.id) >= 0 ? CLASS.focused : '');
};
c3_chart_internal_fn.classDefocused = function (d) {
return ' ' + (this.defocusedTargetIds.indexOf(d.id) >= 0 ? CLASS.defocused : '');
};
c3_chart_internal_fn.classChartText = function (d) {
return CLASS.chartText + this.classTarget(d.id);
};
c3_chart_internal_fn.classChartLine = function (d) {
return CLASS.chartLine + this.classTarget(d.id);
};
c3_chart_internal_fn.classChartBar = function (d) {
return CLASS.chartBar + this.classTarget(d.id);
};
c3_chart_internal_fn.classChartArc = function (d) {
return CLASS.chartArc + this.classTarget(d.data.id);
};
c3_chart_internal_fn.getTargetSelectorSuffix = function (targetId) {
return targetId || targetId === 0 ? ('-' + targetId).replace(/[\s?!@#$%^&*()_=+,.<>'":;\[\]\/|~`{}\\]/g, '-') : '';
};
c3_chart_internal_fn.selectorTarget = function (id, prefix) {
return (prefix || '') + '.' + CLASS.target + this.getTargetSelectorSuffix(id);
};
c3_chart_internal_fn.selectorTargets = function (ids, prefix) {
var $$ = this;
ids = ids || [];
return ids.length ? ids.map(function (id) { return $$.selectorTarget(id, prefix); }) : null;
};
c3_chart_internal_fn.selectorLegend = function (id) {
return '.' + CLASS.legendItem + this.getTargetSelectorSuffix(id);
};
c3_chart_internal_fn.selectorLegends = function (ids) {
var $$ = this;
return ids && ids.length ? ids.map(function (id) { return $$.selectorLegend(id); }) : null;
};
var isValue = c3_chart_internal_fn.isValue = function (v) {
return v || v === 0;
},
isFunction = c3_chart_internal_fn.isFunction = function (o) {
return typeof o === 'function';
},
isString = c3_chart_internal_fn.isString = function (o) {
return typeof o === 'string';
},
isUndefined = c3_chart_internal_fn.isUndefined = function (v) {
return typeof v === 'undefined';
},
isDefined = c3_chart_internal_fn.isDefined = function (v) {
return typeof v !== 'undefined';
},
ceil10 = c3_chart_internal_fn.ceil10 = function (v) {
return Math.ceil(v / 10) * 10;
},
asHalfPixel = c3_chart_internal_fn.asHalfPixel = function (n) {
return Math.ceil(n) + 0.5;
},
diffDomain = c3_chart_internal_fn.diffDomain = function (d) {
return d[1] - d[0];
},
isEmpty = c3_chart_internal_fn.isEmpty = function (o) {
return typeof o === 'undefined' || o === null || (isString(o) && o.length === 0) || (typeof o === 'object' && Object.keys(o).length === 0);
},
notEmpty = c3_chart_internal_fn.notEmpty = function (o) {
return !c3_chart_internal_fn.isEmpty(o);
},
getOption = c3_chart_internal_fn.getOption = function (options, key, defaultValue) {
return isDefined(options[key]) ? options[key] : defaultValue;
},
hasValue = c3_chart_internal_fn.hasValue = function (dict, value) {
var found = false;
Object.keys(dict).forEach(function (key) {
if (dict[key] === value) { found = true; }
});
return found;
},
getPathBox = c3_chart_internal_fn.getPathBox = function (path) {
var box = path.getBoundingClientRect(),
items = [path.pathSegList.getItem(0), path.pathSegList.getItem(1)],
minX = items[0].x, minY = Math.min(items[0].y, items[1].y);
return {x: minX, y: minY, width: box.width, height: box.height};
};
c3_chart_fn.focus = function (targetIds) {
var $$ = this.internal, candidates;
targetIds = $$.mapToTargetIds(targetIds);
candidates = $$.svg.selectAll($$.selectorTargets(targetIds.filter($$.isTargetToShow, $$))),
this.revert();
this.defocus();
candidates.classed(CLASS.focused, true).classed(CLASS.defocused, false);
if ($$.hasArcType()) {
$$.expandArc(targetIds);
}
$$.toggleFocusLegend(targetIds, true);
$$.focusedTargetIds = targetIds;
$$.defocusedTargetIds = $$.defocusedTargetIds.filter(function (id) {
return targetIds.indexOf(id) < 0;
});
};
c3_chart_fn.defocus = function (targetIds) {
var $$ = this.internal, candidates;
targetIds = $$.mapToTargetIds(targetIds);
candidates = $$.svg.selectAll($$.selectorTargets(targetIds.filter($$.isTargetToShow, $$))),
candidates.classed(CLASS.focused, false).classed(CLASS.defocused, true);
if ($$.hasArcType()) {
$$.unexpandArc(targetIds);
}
$$.toggleFocusLegend(targetIds, false);
$$.focusedTargetIds = $$.focusedTargetIds.filter(function (id) {
return targetIds.indexOf(id) < 0;
});
$$.defocusedTargetIds = targetIds;
};
c3_chart_fn.revert = function (targetIds) {
var $$ = this.internal, candidates;
targetIds = $$.mapToTargetIds(targetIds);
candidates = $$.svg.selectAll($$.selectorTargets(targetIds));
candidates.classed(CLASS.focused, false).classed(CLASS.defocused, false);
if ($$.hasArcType()) {
$$.unexpandArc(targetIds);
}
if ($$.config.legend_show) {
$$.showLegend(targetIds.filter($$.isLegendToShow.bind($$)));
$$.legend.selectAll($$.selectorLegends(targetIds))
.filter(function () {
return $$.d3.select(this).classed(CLASS.legendItemFocused);
})
.classed(CLASS.legendItemFocused, false);
}
$$.focusedTargetIds = [];
$$.defocusedTargetIds = [];
};
c3_chart_fn.show = function (targetIds, options) {
var $$ = this.internal, targets;
targetIds = $$.mapToTargetIds(targetIds);
options = options || {};
$$.removeHiddenTargetIds(targetIds);
targets = $$.svg.selectAll($$.selectorTargets(targetIds));
targets.transition()
.style('opacity', 1, 'important')
.call($$.endall, function () {
targets.style('opacity', null).style('opacity', 1);
});
if (options.withLegend) {
$$.showLegend(targetIds);
}
$$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true, withLegend: true});
};
c3_chart_fn.hide = function (targetIds, options) {
var $$ = this.internal, targets;
targetIds = $$.mapToTargetIds(targetIds);
options = options || {};
$$.addHiddenTargetIds(targetIds);
targets = $$.svg.selectAll($$.selectorTargets(targetIds));
targets.transition()
.style('opacity', 0, 'important')
.call($$.endall, function () {
targets.style('opacity', null).style('opacity', 0);
});
if (options.withLegend) {
$$.hideLegend(targetIds);
}
$$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true, withLegend: true});
};
c3_chart_fn.toggle = function (targetIds, options) {
var that = this, $$ = this.internal;
$$.mapToTargetIds(targetIds).forEach(function (targetId) {
$$.isTargetToShow(targetId) ? that.hide(targetId, options) : that.show(targetId, options);
});
};
c3_chart_fn.zoom = function (domain) {
var $$ = this.internal;
if (domain) {
if ($$.isTimeSeries()) {
domain = domain.map(function (x) { return $$.parseDate(x); });
}
$$.brush.extent(domain);
$$.redraw({withUpdateXDomain: true, withY: $$.config.zoom_rescale});
$$.config.zoom_onzoom.call(this, $$.x.orgDomain());
}
return $$.brush.extent();
};
c3_chart_fn.zoom.enable = function (enabled) {
var $$ = this.internal;
$$.config.zoom_enabled = enabled;
$$.updateAndRedraw();
};
c3_chart_fn.unzoom = function () {
var $$ = this.internal;
$$.brush.clear().update();
$$.redraw({withUpdateXDomain: true});
};
c3_chart_fn.zoom.max = function (max) {
var $$ = this.internal, config = $$.config, d3 = $$.d3;
if (max === 0 || max) {
config.zoom_x_max = d3.max([$$.orgXDomain[1], max]);
}
else {
return config.zoom_x_max;
}
};
c3_chart_fn.zoom.min = function (min) {
var $$ = this.internal, config = $$.config, d3 = $$.d3;
if (min === 0 || min) {
config.zoom_x_min = d3.min([$$.orgXDomain[0], min]);
}
else {
return config.zoom_x_min;
}
};
c3_chart_fn.zoom.range = function (range) {
if (arguments.length) {
if (isDefined(range.max)) { this.domain.max(range.max); }
if (isDefined(range.min)) { this.domain.min(range.min); }
} else {
return {
max: this.domain.max(),
min: this.domain.min()
};
}
};
c3_chart_fn.load = function (args) {
var $$ = this.internal, config = $$.config;
if (args.xs) {
$$.addXs(args.xs);
}
if ('classes' in args) {
Object.keys(args.classes).forEach(function (id) {
config.data_classes[id] = args.classes[id];
});
}
if ('categories' in args && $$.isCategorized()) {
config.axis_x_categories = args.categories;
}
if ('axes' in args) {
Object.keys(args.axes).forEach(function (id) {
config.data_axes[id] = args.axes[id];
});
}
if ('colors' in args) {
Object.keys(args.colors).forEach(function (id) {
config.data_colors[id] = args.colors[id];
});
}
if ('cacheIds' in args && $$.hasCaches(args.cacheIds)) {
$$.load($$.getCaches(args.cacheIds), args.done);
return;
}
if ('unload' in args) {
$$.unload($$.mapToTargetIds((typeof args.unload === 'boolean' && args.unload) ? null : args.unload), function () {
$$.loadFromArgs(args);
});
} else {
$$.loadFromArgs(args);
}
};
c3_chart_fn.unload = function (args) {
var $$ = this.internal;
args = args || {};
if (args instanceof Array) {
args = {ids: args};
} else if (typeof args === 'string') {
args = {ids: [args]};
}
$$.unload($$.mapToTargetIds(args.ids), function () {
$$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true, withLegend: true});
if (args.done) { args.done(); }
});
};
c3_chart_fn.flow = function (args) {
var $$ = this.internal,
targets, data, notfoundIds = [], orgDataCount = $$.getMaxDataCount(),
dataCount, domain, baseTarget, baseValue, length = 0, tail = 0, diff, to;
if (args.json) {
data = $$.convertJsonToData(args.json, args.keys);
}
else if (args.rows) {
data = $$.convertRowsToData(args.rows);
}
else if (args.columns) {
data = $$.convertColumnsToData(args.columns);
}
else {
return;
}
targets = $$.convertDataToTargets(data, true);
$$.data.targets.forEach(function (t) {
var found = false, i, j;
for (i = 0; i < targets.length; i++) {
if (t.id === targets[i].id) {
found = true;
if (t.values[t.values.length - 1]) {
tail = t.values[t.values.length - 1].index + 1;
}
length = targets[i].values.length;
for (j = 0; j < length; j++) {
targets[i].values[j].index = tail + j;
if (!$$.isTimeSeries()) {
targets[i].values[j].x = tail + j;
}
}
t.values = t.values.concat(targets[i].values);
targets.splice(i, 1);
break;
}
}
if (!found) { notfoundIds.push(t.id); }
});
$$.data.targets.forEach(function (t) {
var i, j;
for (i = 0; i < notfoundIds.length; i++) {
if (t.id === notfoundIds[i]) {
tail = t.values[t.values.length - 1].index + 1;
for (j = 0; j < length; j++) {
t.values.push({
id: t.id,
index: tail + j,
x: $$.isTimeSeries() ? $$.getOtherTargetX(tail + j) : tail + j,
value: null
});
}
}
}
});
if ($$.data.targets.length) {
targets.forEach(function (t) {
var i, missing = [];
for (i = $$.data.targets[0].values[0].index; i < tail; i++) {
missing.push({
id: t.id,
index: i,
x: $$.isTimeSeries() ? $$.getOtherTargetX(i) : i,
value: null
});
}
t.values.forEach(function (v) {
v.index += tail;
if (!$$.isTimeSeries()) {
v.x += tail;
}
});
t.values = missing.concat(t.values);
});
}
$$.data.targets = $$.data.targets.concat(targets);
dataCount = $$.getMaxDataCount();
baseTarget = $$.data.targets[0];
baseValue = baseTarget.values[0];
if (isDefined(args.to)) {
length = 0;
to = $$.isTimeSeries() ? $$.parseDate(args.to) : args.to;
baseTarget.values.forEach(function (v) {
if (v.x < to) { length++; }
});
} else if (isDefined(args.length)) {
length = args.length;
}
if (!orgDataCount) {
if ($$.isTimeSeries()) {
if (baseTarget.values.length > 1) {
diff = baseTarget.values[baseTarget.values.length - 1].x - baseValue.x;
} else {
diff = baseValue.x - $$.getXDomain($$.data.targets)[0];
}
} else {
diff = 1;
}
domain = [baseValue.x - diff, baseValue.x];
$$.updateXDomain(null, true, true, false, domain);
} else if (orgDataCount === 1) {
if ($$.isTimeSeries()) {
diff = (baseTarget.values[baseTarget.values.length - 1].x - baseValue.x) / 2;
domain = [new Date(+baseValue.x - diff), new Date(+baseValue.x + diff)];
$$.updateXDomain(null, true, true, false, domain);
}
}
$$.updateTargets($$.data.targets);
$$.redraw({
flow: {
index: baseValue.index,
length: length,
duration: isValue(args.duration) ? args.duration : $$.config.transition_duration,
done: args.done,
orgDataCount: orgDataCount,
},
withLegend: true,
withTransition: orgDataCount > 1,
withTrimXDomain: false,
withUpdateXAxis: true,
});
};
c3_chart_internal_fn.generateFlow = function (args) {
var $$ = this, config = $$.config, d3 = $$.d3;
return function () {
var targets = args.targets,
flow = args.flow,
drawBar = args.drawBar,
drawLine = args.drawLine,
drawArea = args.drawArea,
cx = args.cx,
cy = args.cy,
xv = args.xv,
xForText = args.xForText,
yForText = args.yForText,
duration = args.duration;
var translateX, scaleX = 1, transform,
flowIndex = flow.index,
flowLength = flow.length,
flowStart = $$.getValueOnIndex($$.data.targets[0].values, flowIndex),
flowEnd = $$.getValueOnIndex($$.data.targets[0].values, flowIndex + flowLength),
orgDomain = $$.x.domain(), domain,
durationForFlow = flow.duration || duration,
done = flow.done || function () {},
wait = $$.generateWait();
var xgrid = $$.xgrid || d3.selectAll([]),
xgridLines = $$.xgridLines || d3.selectAll([]),
mainRegion = $$.mainRegion || d3.selectAll([]),
mainText = $$.mainText || d3.selectAll([]),
mainBar = $$.mainBar || d3.selectAll([]),
mainLine = $$.mainLine || d3.selectAll([]),
mainArea = $$.mainArea || d3.selectAll([]),
mainCircle = $$.mainCircle || d3.selectAll([]);
$$.flowing = true;
$$.data.targets.forEach(function (d) {
d.values.splice(0, flowLength);
});
domain = $$.updateXDomain(targets, true, true);
if ($$.updateXGrid) { $$.updateXGrid(true); }
if (!flow.orgDataCount) {
if ($$.data.targets[0].values.length !== 1) {
translateX = $$.x(orgDomain[0]) - $$.x(domain[0]);
} else {
if ($$.isTimeSeries()) {
flowStart = $$.getValueOnIndex($$.data.targets[0].values, 0);
flowEnd = $$.getValueOnIndex($$.data.targets[0].values, $$.data.targets[0].values.length - 1);
translateX = $$.x(flowStart.x) - $$.x(flowEnd.x);
} else {
translateX = diffDomain(domain) / 2;
}
}
} else if (flow.orgDataCount === 1 || flowStart.x === flowEnd.x) {
translateX = $$.x(orgDomain[0]) - $$.x(domain[0]);
} else {
if ($$.isTimeSeries()) {
translateX = ($$.x(orgDomain[0]) - $$.x(domain[0]));
} else {
translateX = ($$.x(flowStart.x) - $$.x(flowEnd.x));
}
}
scaleX = (diffDomain(orgDomain) / diffDomain(domain));
transform = 'translate(' + translateX + ',0) scale(' + scaleX + ',1)';
$$.hideXGridFocus();
d3.transition().ease('linear').duration(durationForFlow).each(function () {
wait.add($$.axes.x.transition().call($$.xAxis));
wait.add(mainBar.transition().attr('transform', transform));
wait.add(mainLine.transition().attr('transform', transform));
wait.add(mainArea.transition().attr('transform', transform));
wait.add(mainCircle.transition().attr('transform', transform));
wait.add(mainText.transition().attr('transform', transform));
wait.add(mainRegion.filter($$.isRegionOnX).transition().attr('transform', transform));
wait.add(xgrid.transition().attr('transform', transform));
wait.add(xgridLines.transition().attr('transform', transform));
})
.call(wait, function () {
var i, shapes = [], texts = [], eventRects = [];
if (flowLength) {
for (i = 0; i < flowLength; i++) {
shapes.push('.' + CLASS.shape + '-' + (flowIndex + i));
texts.push('.' + CLASS.text + '-' + (flowIndex + i));
eventRects.push('.' + CLASS.eventRect + '-' + (flowIndex + i));
}
$$.svg.selectAll('.' + CLASS.shapes).selectAll(shapes).remove();
$$.svg.selectAll('.' + CLASS.texts).selectAll(texts).remove();
$$.svg.selectAll('.' + CLASS.eventRects).selectAll(eventRects).remove();
$$.svg.select('.' + CLASS.xgrid).remove();
}
xgrid
.attr('transform', null)
.attr($$.xgridAttr);
xgridLines
.attr('transform', null);
xgridLines.select('line')
.attr("x1", config.axis_rotated ? 0 : xv)
.attr("x2", config.axis_rotated ? $$.width : xv);
xgridLines.select('text')
.attr("x", config.axis_rotated ? $$.width : 0)
.attr("y", xv);
mainBar
.attr('transform', null)
.attr("d", drawBar);
mainLine
.attr('transform', null)
.attr("d", drawLine);
mainArea
.attr('transform', null)
.attr("d", drawArea);
mainCircle
.attr('transform', null)
.attr("cx", cx)
.attr("cy", cy);
mainText
.attr('transform', null)
.attr('x', xForText)
.attr('y', yForText)
.style('fill-opacity', $$.opacityForText.bind($$));
mainRegion
.attr('transform', null);
mainRegion.select('rect').filter($$.isRegionOnX)
.attr("x", $$.regionX.bind($$))
.attr("width", $$.regionWidth.bind($$));
if (config.interaction_enabled) {
$$.redrawEventRect();
}
done();
$$.flowing = false;
});
};
};
c3_chart_fn.selected = function (targetId) {
var $$ = this.internal, d3 = $$.d3;
return d3.merge(
$$.main.selectAll('.' + CLASS.shapes + $$.getTargetSelectorSuffix(targetId)).selectAll('.' + CLASS.shape)
.filter(function () { return d3.select(this).classed(CLASS.SELECTED); })
.map(function (d) { return d.map(function (d) { var data = d.__data__; return data.data ? data.data : data; }); })
);
};
c3_chart_fn.select = function (ids, indices, resetOther) {
var $$ = this.internal, d3 = $$.d3, config = $$.config;
if (! config.data_selection_enabled) { return; }
$$.main.selectAll('.' + CLASS.shapes).selectAll('.' + CLASS.shape).each(function (d, i) {
var shape = d3.select(this), id = d.data ? d.data.id : d.id,
toggle = $$.getToggle(this, d).bind($$),
isTargetId = config.data_selection_grouped || !ids || ids.indexOf(id) >= 0,
isTargetIndex = !indices || indices.indexOf(i) >= 0,
isSelected = shape.classed(CLASS.SELECTED);
if (shape.classed(CLASS.line) || shape.classed(CLASS.area)) {
return;
}
if (isTargetId && isTargetIndex) {
if (config.data_selection_isselectable(d) && !isSelected) {
toggle(true, shape.classed(CLASS.SELECTED, true), d, i);
}
} else if (isDefined(resetOther) && resetOther) {
if (isSelected) {
toggle(false, shape.classed(CLASS.SELECTED, false), d, i);
}
}
});
};
c3_chart_fn.unselect = function (ids, indices) {
var $$ = this.internal, d3 = $$.d3, config = $$.config;
if (! config.data_selection_enabled) { return; }
$$.main.selectAll('.' + CLASS.shapes).selectAll('.' + CLASS.shape).each(function (d, i) {
var shape = d3.select(this), id = d.data ? d.data.id : d.id,
toggle = $$.getToggle(this, d).bind($$),
isTargetId = config.data_selection_grouped || !ids || ids.indexOf(id) >= 0,
isTargetIndex = !indices || indices.indexOf(i) >= 0,
isSelected = shape.classed(CLASS.SELECTED);
if (shape.classed(CLASS.line) || shape.classed(CLASS.area)) {
return;
}
if (isTargetId && isTargetIndex) {
if (config.data_selection_isselectable(d)) {
if (isSelected) {
toggle(false, shape.classed(CLASS.SELECTED, false), d, i);
}
}
}
});
};
c3_chart_fn.transform = function (type, targetIds) {
var $$ = this.internal,
options = ['pie', 'donut'].indexOf(type) >= 0 ? {withTransform: true} : null;
$$.transformTo(targetIds, type, options);
};
c3_chart_internal_fn.transformTo = function (targetIds, type, optionsForRedraw) {
var $$ = this,
withTransitionForAxis = !$$.hasArcType(),
options = optionsForRedraw || {withTransitionForAxis: withTransitionForAxis};
options.withTransitionForTransform = false;
$$.transiting = false;
$$.setTargetType(targetIds, type);
$$.updateTargets($$.data.targets);
$$.updateAndRedraw(options);
};
c3_chart_fn.groups = function (groups) {
var $$ = this.internal, config = $$.config;
if (isUndefined(groups)) { return config.data_groups; }
config.data_groups = groups;
$$.redraw();
return config.data_groups;
};
c3_chart_fn.xgrids = function (grids) {
var $$ = this.internal, config = $$.config;
if (! grids) { return config.grid_x_lines; }
config.grid_x_lines = grids;
$$.redrawWithoutRescale();
return config.grid_x_lines;
};
c3_chart_fn.xgrids.add = function (grids) {
var $$ = this.internal;
return this.xgrids($$.config.grid_x_lines.concat(grids ? grids : []));
};
c3_chart_fn.xgrids.remove = function (params) {
var $$ = this.internal;
$$.removeGridLines(params, true);
};
c3_chart_fn.ygrids = function (grids) {
var $$ = this.internal, config = $$.config;
if (! grids) { return config.grid_y_lines; }
config.grid_y_lines = grids;
$$.redrawWithoutRescale();
return config.grid_y_lines;
};
c3_chart_fn.ygrids.add = function (grids) {
var $$ = this.internal;
return this.ygrids($$.config.grid_y_lines.concat(grids ? grids : []));
};
c3_chart_fn.ygrids.remove = function (params) {
var $$ = this.internal;
$$.removeGridLines(params, false);
};
c3_chart_fn.regions = function (regions) {
var $$ = this.internal, config = $$.config;
if (!regions) { return config.regions; }
config.regions = regions;
$$.redrawWithoutRescale();
return config.regions;
};
c3_chart_fn.regions.add = function (regions) {
var $$ = this.internal, config = $$.config;
if (!regions) { return config.regions; }
config.regions = config.regions.concat(regions);
$$.redrawWithoutRescale();
return config.regions;
};
c3_chart_fn.regions.remove = function (options) {
var $$ = this.internal, config = $$.config,
duration, classes, regions;
options = options || {};
duration = $$.getOption(options, "duration", config.transition_duration);
classes = $$.getOption(options, "classes", [CLASS.region]);
regions = $$.main.select('.' + CLASS.regions).selectAll(classes.map(function (c) { return '.' + c; }));
(duration ? regions.transition().duration(duration) : regions)
.style('opacity', 0)
.remove();
config.regions = config.regions.filter(function (region) {
var found = false;
if (!region['class']) {
return true;
}
region['class'].split(' ').forEach(function (c) {
if (classes.indexOf(c) >= 0) { found = true; }
});
return !found;
});
return config.regions;
};
c3_chart_fn.data = function (targetIds) {
var targets = this.internal.data.targets;
return typeof targetIds === 'undefined' ? targets : targets.filter(function (t) {
return [].concat(targetIds).indexOf(t.id) >= 0;
});
};
c3_chart_fn.data.shown = function (targetIds) {
return this.internal.filterTargetsToShow(this.data(targetIds));
};
c3_chart_fn.data.values = function (targetId) {
var targets, values = null;
if (targetId) {
targets = this.data(targetId);
values = targets[0] ? targets[0].values.map(function (d) { return d.value; }) : null;
}
return values;
};
c3_chart_fn.data.names = function (names) {
this.internal.clearLegendItemTextBoxCache();
return this.internal.updateDataAttributes('names', names);
};
c3_chart_fn.data.colors = function (colors) {
return this.internal.updateDataAttributes('colors', colors);
};
c3_chart_fn.data.axes = function (axes) {
return this.internal.updateDataAttributes('axes', axes);
};
c3_chart_fn.category = function (i, category) {
var $$ = this.internal, config = $$.config;
if (arguments.length > 1) {
config.axis_x_categories[i] = category;
$$.redraw();
}
return config.axis_x_categories[i];
};
c3_chart_fn.categories = function (categories) {
var $$ = this.internal, config = $$.config;
if (!arguments.length) { return config.axis_x_categories; }
config.axis_x_categories = categories;
$$.redraw();
return config.axis_x_categories;
};
c3_chart_fn.color = function (id) {
var $$ = this.internal;
return $$.color(id);
};
c3_chart_fn.x = function (x) {
var $$ = this.internal;
if (arguments.length) {
$$.updateTargetX($$.data.targets, x);
$$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true});
}
return $$.data.xs;
};
c3_chart_fn.xs = function (xs) {
var $$ = this.internal;
if (arguments.length) {
$$.updateTargetXs($$.data.targets, xs);
$$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true});
}
return $$.data.xs;
};
c3_chart_fn.axis = function () {};
c3_chart_fn.axis.labels = function (labels) {
var $$ = this.internal;
if (arguments.length) {
Object.keys(labels).forEach(function (axisId) {
$$.axis.setLabelText(axisId, labels[axisId]);
});
$$.axis.updateLabels();
}
};
c3_chart_fn.axis.max = function (max) {
var $$ = this.internal, config = $$.config;
if (arguments.length) {
if (typeof max === 'object') {
if (isValue(max.x)) { config.axis_x_max = max.x; }
if (isValue(max.y)) { config.axis_y_max = max.y; }
if (isValue(max.y2)) { config.axis_y2_max = max.y2; }
} else {
config.axis_y_max = config.axis_y2_max = max;
}
$$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true});
} else {
return {
x: config.axis_x_max,
y: config.axis_y_max,
y2: config.axis_y2_max
};
}
};
c3_chart_fn.axis.min = function (min) {
var $$ = this.internal, config = $$.config;
if (arguments.length) {
if (typeof min === 'object') {
if (isValue(min.x)) { config.axis_x_min = min.x; }
if (isValue(min.y)) { config.axis_y_min = min.y; }
if (isValue(min.y2)) { config.axis_y2_min = min.y2; }
} else {
config.axis_y_min = config.axis_y2_min = min;
}
$$.redraw({withUpdateOrgXDomain: true, withUpdateXDomain: true});
} else {
return {
x: config.axis_x_min,
y: config.axis_y_min,
y2: config.axis_y2_min
};
}
};
c3_chart_fn.axis.range = function (range) {
if (arguments.length) {
if (isDefined(range.max)) { this.axis.max(range.max); }
if (isDefined(range.min)) { this.axis.min(range.min); }
} else {
return {
max: this.axis.max(),
min: this.axis.min()
};
}
};
c3_chart_fn.legend = function () {};
c3_chart_fn.legend.show = function (targetIds) {
var $$ = this.internal;
$$.showLegend($$.mapToTargetIds(targetIds));
$$.updateAndRedraw({withLegend: true});
};
c3_chart_fn.legend.hide = function (targetIds) {
var $$ = this.internal;
$$.hideLegend($$.mapToTargetIds(targetIds));
$$.updateAndRedraw({withLegend: true});
};
c3_chart_fn.resize = function (size) {
var $$ = this.internal, config = $$.config;
config.size_width = size ? size.width : null;
config.size_height = size ? size.height : null;
this.flush();
};
c3_chart_fn.flush = function () {
var $$ = this.internal;
$$.updateAndRedraw({withLegend: true, withTransition: false, withTransitionForTransform: false});
};
c3_chart_fn.destroy = function () {
var $$ = this.internal;
window.clearInterval($$.intervalForObserveInserted);
if ($$.resizeTimeout !== undefined) {
window.clearTimeout($$.resizeTimeout);
}
if (window.detachEvent) {
window.detachEvent('onresize', $$.resizeFunction);
} else if (window.removeEventListener) {
window.removeEventListener('resize', $$.resizeFunction);
} else {
var wrapper = window.onresize;
if (wrapper && wrapper.add && wrapper.remove) {
wrapper.remove($$.resizeFunction);
}
}
$$.selectChart.classed('c3', false).html("");
Object.keys($$).forEach(function (key) {
$$[key] = null;
});
return null;
};
c3_chart_fn.tooltip = function () {};
c3_chart_fn.tooltip.show = function (args) {
var $$ = this.internal, index, mouse;
if (args.mouse) {
mouse = args.mouse;
}
if (args.data) {
if ($$.isMultipleX()) {
mouse = [$$.x(args.data.x), $$.getYScale(args.data.id)(args.data.value)];
index = null;
} else {
index = isValue(args.data.index) ? args.data.index : $$.getIndexByX(args.data.x);
}
}
else if (typeof args.x !== 'undefined') {
index = $$.getIndexByX(args.x);
}
else if (typeof args.index !== 'undefined') {
index = args.index;
}
$$.dispatchEvent('mouseover', index, mouse);
$$.dispatchEvent('mousemove', index, mouse);
$$.config.tooltip_onshow.call($$, args.data);
};
c3_chart_fn.tooltip.hide = function () {
this.internal.dispatchEvent('mouseout', 0);
this.internal.config.tooltip_onhide.call(this);
};
var tickTextCharSize;
function c3_axis(d3, params) {
var scale = d3.scale.linear(), orient = "bottom", innerTickSize = 6, outerTickSize, tickPadding = 3, tickValues = null, tickFormat, tickArguments;
var tickOffset = 0, tickCulling = true, tickCentered;
params = params || {};
outerTickSize = params.withOuterTick ? 6 : 0;
function axisX(selection, x) {
selection.attr("transform", function (d) {
return "translate(" + Math.ceil(x(d) + tickOffset) + ", 0)";
});
}
function axisY(selection, y) {
selection.attr("transform", function (d) {
return "translate(0," + Math.ceil(y(d)) + ")";
});
}
function scaleExtent(domain) {
var start = domain[0], stop = domain[domain.length - 1];
return start < stop ? [ start, stop ] : [ stop, start ];
}
function generateTicks(scale) {
var i, domain, ticks = [];
if (scale.ticks) {
return scale.ticks.apply(scale, tickArguments);
}
domain = scale.domain();
for (i = Math.ceil(domain[0]); i < domain[1]; i++) {
ticks.push(i);
}
if (ticks.length > 0 && ticks[0] > 0) {
ticks.unshift(ticks[0] - (ticks[1] - ticks[0]));
}
return ticks;
}
function copyScale() {
var newScale = scale.copy(), domain;
if (params.isCategory) {
domain = scale.domain();
newScale.domain([domain[0], domain[1] - 1]);
}
return newScale;
}
function textFormatted(v) {
var formatted = tickFormat ? tickFormat(v) : v;
return typeof formatted !== 'undefined' ? formatted : '';
}
function getSizeFor1Char(tick) {
if (tickTextCharSize) {
return tickTextCharSize;
}
var size = {
h: 11.5,
w: 5.5
};
tick.select('text').text(textFormatted).each(function (d) {
var box = this.getBoundingClientRect(),
text = textFormatted(d),
h = box.height,
w = text ? (box.width / text.length) : undefined;
if (h && w) {
size.h = h;
size.w = w;
}
}).text('');
tickTextCharSize = size;
return size;
}
function transitionise(selection) {
return params.withoutTransition ? selection : d3.transition(selection);
}
function axis(g) {
g.each(function () {
var g = axis.g = d3.select(this);
var scale0 = this.__chart__ || scale, scale1 = this.__chart__ = copyScale();
var ticks = tickValues ? tickValues : generateTicks(scale1),
tick = g.selectAll(".tick").data(ticks, scale1),
tickEnter = tick.enter().insert("g", ".domain").attr("class", "tick").style("opacity", 1e-6),
tickExit = tick.exit().remove(),
tickUpdate = transitionise(tick).style("opacity", 1),
tickTransform, tickX, tickY;
var range = scale.rangeExtent ? scale.rangeExtent() : scaleExtent(scale.range()),
path = g.selectAll(".domain").data([ 0 ]),
pathUpdate = (path.enter().append("path").attr("class", "domain"), transitionise(path));
tickEnter.append("line");
tickEnter.append("text");
var lineEnter = tickEnter.select("line"),
lineUpdate = tickUpdate.select("line"),
textEnter = tickEnter.select("text"),
textUpdate = tickUpdate.select("text");
if (params.isCategory) {
tickOffset = Math.ceil((scale1(1) - scale1(0)) / 2);
tickX = tickCentered ? 0 : tickOffset;
tickY = tickCentered ? tickOffset : 0;
} else {
tickOffset = tickX = 0;
}
var text, tspan, sizeFor1Char = getSizeFor1Char(g.select('.tick')), counts = [];
var tickLength = Math.max(innerTickSize, 0) + tickPadding,
isVertical = orient === 'left' || orient === 'right';
function splitTickText(d, maxWidth) {
var tickText = textFormatted(d),
subtext, spaceIndex, textWidth, splitted = [];
if (Object.prototype.toString.call(tickText) === "[object Array]") {
return tickText;
}
if (!maxWidth || maxWidth <= 0) {
maxWidth = isVertical ? 95 : params.isCategory ? (Math.ceil(scale1(ticks[1]) - scale1(ticks[0])) - 12) : 110;
}
function split(splitted, text) {
spaceIndex = undefined;
for (var i = 1; i < text.length; i++) {
if (text.charAt(i) === ' ') {
spaceIndex = i;
}
subtext = text.substr(0, i + 1);
textWidth = sizeFor1Char.w * subtext.length;
if (maxWidth < textWidth) {
return split(
splitted.concat(text.substr(0, spaceIndex ? spaceIndex : i)),
text.slice(spaceIndex ? spaceIndex + 1 : i)
);
}
}
return splitted.concat(text);
}
return split(splitted, tickText + "");
}
function tspanDy(d, i) {
var dy = sizeFor1Char.h;
if (i === 0) {
if (orient === 'left' || orient === 'right') {
dy = -((counts[d.index] - 1) * (sizeFor1Char.h / 2) - 3);
} else {
dy = ".71em";
}
}
return dy;
}
function tickSize(d) {
var tickPosition = scale(d) + (tickCentered ? 0 : tickOffset);
return range[0] < tickPosition && tickPosition < range[1] ? innerTickSize : 0;
}
text = tick.select("text");
tspan = text.selectAll('tspan')
.data(function (d, i) {
var splitted = params.tickMultiline ? splitTickText(d, params.tickWidth) : [].concat(textFormatted(d));
counts[i] = splitted.length;
return splitted.map(function (s) {
return { index: i, splitted: s };
});
});
tspan.enter().append('tspan');
tspan.exit().remove();
tspan.text(function (d) { return d.splitted; });
var rotate = params.tickTextRotate;
function textAnchorForText(rotate) {
if (!rotate) {
return 'middle';
}
return rotate > 0 ? "start" : "end";
}
function textTransform(rotate) {
if (!rotate) {
return '';
}
return "rotate(" + rotate + ")";
}
function dxForText(rotate) {
if (!rotate) {
return 0;
}
return 8 * Math.sin(Math.PI * (rotate / 180));
}
function yForText(rotate) {
if (!rotate) {
return tickLength;
}
return 11.5 - 2.5 * (rotate / 15) * (rotate > 0 ? 1 : -1);
}
switch (orient) {
case "bottom":
{
tickTransform = axisX;
lineEnter.attr("y2", innerTickSize);
textEnter.attr("y", tickLength);
lineUpdate.attr("x1", tickX).attr("x2", tickX).attr("y2", tickSize);
textUpdate.attr("x", 0).attr("y", yForText(rotate))
.style("text-anchor", textAnchorForText(rotate))
.attr("transform", textTransform(rotate));
tspan.attr('x', 0).attr("dy", tspanDy).attr('dx', dxForText(rotate));
pathUpdate.attr("d", "M" + range[0] + "," + outerTickSize + "V0H" + range[1] + "V" + outerTickSize);
break;
}
case "top":
{
tickTransform = axisX;
lineEnter.attr("y2", -innerTickSize);
textEnter.attr("y", -tickLength);
lineUpdate.attr("x2", 0).attr("y2", -innerTickSize);
textUpdate.attr("x", 0).attr("y", -tickLength);
text.style("text-anchor", "middle");
tspan.attr('x', 0).attr("dy", "0em");
pathUpdate.attr("d", "M" + range[0] + "," + -outerTickSize + "V0H" + range[1] + "V" + -outerTickSize);
break;
}
case "left":
{
tickTransform = axisY;
lineEnter.attr("x2", -innerTickSize);
textEnter.attr("x", -tickLength);
lineUpdate.attr("x2", -innerTickSize).attr("y1", tickY).attr("y2", tickY);
textUpdate.attr("x", -tickLength).attr("y", tickOffset);
text.style("text-anchor", "end");
tspan.attr('x', -tickLength).attr("dy", tspanDy);
pathUpdate.attr("d", "M" + -outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + -outerTickSize);
break;
}
case "right":
{
tickTransform = axisY;
lineEnter.attr("x2", innerTickSize);
textEnter.attr("x", tickLength);
lineUpdate.attr("x2", innerTickSize).attr("y2", 0);
textUpdate.attr("x", tickLength).attr("y", 0);
text.style("text-anchor", "start");
tspan.attr('x', tickLength).attr("dy", tspanDy);
pathUpdate.attr("d", "M" + outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + outerTickSize);
break;
}
}
if (scale1.rangeBand) {
var x = scale1, dx = x.rangeBand() / 2;
scale0 = scale1 = function (d) {
return x(d) + dx;
};
} else if (scale0.rangeBand) {
scale0 = scale1;
} else {
tickExit.call(tickTransform, scale1);
}
tickEnter.call(tickTransform, scale0);
tickUpdate.call(tickTransform, scale1);
});
}
axis.scale = function (x) {
if (!arguments.length) { return scale; }
scale = x;
return axis;
};
axis.orient = function (x) {
if (!arguments.length) { return orient; }
orient = x in {top: 1, right: 1, bottom: 1, left: 1} ? x + "" : "bottom";
return axis;
};
axis.tickFormat = function (format) {
if (!arguments.length) { return tickFormat; }
tickFormat = format;
return axis;
};
axis.tickCentered = function (isCentered) {
if (!arguments.length) { return tickCentered; }
tickCentered = isCentered;
return axis;
};
axis.tickOffset = function () {
return tickOffset;
};
axis.tickInterval = function () {
var interval, length;
if (params.isCategory) {
interval = tickOffset * 2;
}
else {
length = axis.g.select('path.domain').node().getTotalLength() - outerTickSize * 2;
interval = length / axis.g.selectAll('line').size();
}
return interval === Infinity ? 0 : interval;
};
axis.ticks = function () {
if (!arguments.length) { return tickArguments; }
tickArguments = arguments;
return axis;
};
axis.tickCulling = function (culling) {
if (!arguments.length) { return tickCulling; }
tickCulling = culling;
return axis;
};
axis.tickValues = function (x) {
if (typeof x === 'function') {
tickValues = function () {
return x(scale.domain());
};
}
else {
if (!arguments.length) { return tickValues; }
tickValues = x;
}
return axis;
};
return axis;
}
c3_chart_internal_fn.isSafari = function () {
var ua = window.navigator.userAgent;
return ua.indexOf('Safari') >= 0 && ua.indexOf('Chrome') < 0;
};
c3_chart_internal_fn.isChrome = function () {
var ua = window.navigator.userAgent;
return ua.indexOf('Chrome') >= 0;
};
if (!Function.prototype.bind) {
Function.prototype.bind = function(oThis) {
if (typeof this !== 'function') {
throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
}
var aArgs   = Array.prototype.slice.call(arguments, 1),
fToBind = this,
fNOP    = function() {},
fBound  = function() {
return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
};
fNOP.prototype = this.prototype;
fBound.prototype = new fNOP();
return fBound;
};
}
if (typeof define === 'function' && define.amd) {
define("c3", ["d3"], function () { return c3; });
} else if ('undefined' !== typeof exports && 'undefined' !== typeof module) {
module.exports = c3;
} else {
window.c3 = c3;
}
})(window);
/*! RESOURCE: PmClientDateAndDurationHandler */
var PmClientDateAndDurationHandler = Class.create();
PmClientDateAndDurationHandler.prototype = {
initialize: function(_gForm) {
this._gForm = _gForm;
this.invokeForScheduleDateFormat = false;
},
showErrorMessage: function(column, message) {
jslog("Into PmClientDateAndDurationHandler.showErrorMessage -> " + column);
if(!column) {
this._gForm.addErrorMessage("Enter a valid date");
} else {
try {
if (!message)
this._gForm.showFieldMsg(column, 'Enter a valid date', 'error');
else
this._gForm.showFieldMsg(column, message, 'error');
} catch(e) {
jslog("PmClientDateAndDurationHandler.showErrorMessage: " + colum + " is not available on the form");
}
}
},
isValidClientDate: function(column) {
jslog("Into PmClientDateAndDurationHandler.isValidClientDate -> " + column);
var dateValue = this._gForm.getValue(column);
if(dateValue == null || dateValue == '') {
this.showErrorMessage(column);
return false;
}
return true;
},
isValidServerDate: function (column, dateValue, callback) {
jslog("Into PmClientDateAndDurationHandler.isValidServerDate -> " + column + " - " + dateValue);
this.callback = callback;
var ga = new GlideAjax('AjaxProjectTaskUtil');
ga.addParam('sysparm_name', 'validateDisplayDate');
ga.addParam('sysparm_column', column);
ga.addParam('sysparm_date', dateValue);
ga.getXMLAnswer(this.validateResponse);
return false;
},
validateResponse: function(serverResponse) {
jslog("Into validateResponse.validateResponse -> " + serverResponse);
if(serverResponse && serverResponse.responseXML) {
var result = serverResponse.responseXML.getElementByTagName("result");
var status = result.getAttribute("status");
var column = result.getAttribute("column");
if(status == 'error') {
this.showErrorMessage(column);
} else {
jslog("Into validateResponse.validateResponse -> Calling Callback PmClientDateAndDurationHandler");
this.callback();
}
}
},
setStateonActualDateChange: function(){
var ga = new GlideAjax('AjaxProjectTaskUtil');
ga.addParam('sysparm_name','getStateForActualDates');
ga.addParam('sysparm_sys_id',this._gForm.getUniqueValue());
ga.addParam('sysparm_work_start_date', this._gForm.hasField('work_start') ? this._gForm.getValue('work_start') : g_scratchpad.actualStartDate );
ga.addParam('sysparm_work_end_date', this._gForm.hasField('work_end') ? this._gForm.getValue('work_end') : g_scratchpad.actualEndDate );
ga.addParam('sysparm_state', this._gForm.hasField('state') ? this._gForm.getValue('state') : g_scratchpad.state );
ga.getXML(this.callbackForStateUpdate.bind(this));
},
setStateonPercentChange: function(){
var ga = new GlideAjax('AjaxProjectTaskUtil');
ga.addParam('sysparm_name','getStateForPercentComplete');
ga.addParam('sysparm_sys_id',this._gForm.getUniqueValue());
ga.addParam('sysparm_percent', this._gForm.hasField('percent_complete') ? this._gForm.getValue('percent_complete') : g_scratchpad.percentComplete );
ga.addParam('sysparm_state', this._gForm.hasField('state') ? this._gForm.getValue('state') : g_scratchpad.state );
ga.getXML(this.callbackForStateUpdate.bind(this));
},
callbackForStateUpdate: function (response) {
var result = response.responseXML.getElementsByTagName("result");
result = result[0];
if (this._gForm.hasField('state')){
if (this._gForm.getValue('state') != result.getAttribute("state"))
this._gForm.setValue('state', result.getAttribute("state"));
}
else {
if (g_scratchpad.state != result.getAttribute("state")) {
g_scratchpad.state = result.getAttribute("state");
this.setActualDateonStateChange();
}
}
this._gForm.setReadOnly('percent_complete',(result.getAttribute("isStateInactive") == 'true') ? true : false);
},
setActualDateonStateChange: function() {
var ga = new GlideAjax('AjaxProjectTaskUtil');
ga.addParam('sysparm_name','getActualDates');
ga.addParam('sysparm_sys_id',this._gForm.getUniqueValue());
ga.addParam('sysparm_start_date', this._gForm.hasField('start_date') ? this._gForm.getValue('start_date') : g_scratchpad.plannedStartDate );
ga.addParam('sysparm_end_date', this._gForm.hasField('end_date') ? this._gForm.getValue('end_date') : g_scratchpad.plannedEndDate );
ga.addParam('sysparm_work_start_date',  this._gForm.hasField('work_start') ? this._gForm.getValue('work_start') : g_scratchpad.actualStartDate );
ga.addParam('sysparm_work_end_date',  this._gForm.hasField('work_end') ? this._gForm.getValue('work_end') : g_scratchpad.actualEndDate );
ga.addParam('sysparm_duration',  this._gForm.hasField('duration') ? this._gForm.getValue('duration') : g_scratchpad.plannedDuration );
ga.addParam('sysparm_work_duration', '');
ga.addParam('sysparm_outside_Schedule', this._gForm.hasField('allow_dates_outside_schedule') ? this._gForm.getValue('allow_dates_outside_schedule') : g_scratchpad.allowDatesOutsideSchedule );
ga.addParam('sysparm_state', this._gForm.hasField('state') ? this._gForm.getValue('state') : g_scratchpad.state );
ga.addParam('sysparm_percent', this._gForm.hasField('percent_complete') ? this._gForm.getValue('percent_complete') : g_scratchpad.percentComplete );
ga.getXML(this.callbackForStateChange.bind(this));
},
callbackForStateChange: function (response) {
var result = response.responseXML.getElementsByTagName("result");
result = result[0];
if (result.getAttribute("status") == 'success'){
this.setActualStartDate(result.getAttribute("work_start"));
this.setActualEndDate(result.getAttribute("work_end"));
this.setActualDuration(result.getAttribute("work_duration"));
this.setPercentComplete(result.getAttribute("percent_complete"));
this._gForm.setReadOnly('percent_complete',(result.getAttribute("isStateInactive") == 'true') ? true : false);
}
else
this.showErrorMessage('state', result.getAttribute('message'));
},
setDurationOnActualEndDateChange: function(){
var startDate =  this._gForm.hasField('work_start') ? this._gForm.getValue('work_start') : g_scratchpad.actualStartDate;
var endDate = this._gForm.hasField('work_end') ? this._gForm.getValue('work_end') : g_scratchpad.actualEndDate;
if ((startDate == null || startDate == '')  && (endDate == null || endDate == ''))
this.setActualDuration('');
else if ((startDate == null || startDate == '')  || (endDate == null || endDate == ''))
return;
else {
var ga = new GlideAjax('AjaxProjectTaskUtil');
ga.addParam('sysparm_name','getDuration');
ga.addParam('sysparm_start_date',startDate);
ga.addParam('sysparm_end_date',endDate);
ga.addParam('sysparm_is_off_schedule',this._gForm.hasField('allow_dates_outside_schedule') ? this._gForm.getValue('allow_dates_outside_schedule') : g_scratchpad.allowDatesOutsideSchedule);
ga.addParam('sysparm_sys_id',this._gForm.getUniqueValue());
ga.getXML(this.callbackForActualEndDateChange.bind(this));
}
},
callbackForActualEndDateChange: function (response) {
jslog("Into handleResponse -> " + response);
if(response && response.responseXML) {
var result = response.responseXML.getElementsByTagName("result");
if(result) {
result = result[0];
var status = result.getAttribute("status");
var answer = result.getAttribute("answer");
var message = result.getAttribute('message');
if(status == 'error') {
jslog("Into handleResponse -> Response is INVALID");
this.showErrorMessage('work_end', message);
} else {
jslog("Into handleResponse -> Response is valid");
this.setActualDuration(answer);
}
}
}
},
setEndDateOnStartDateChange: function () {
if (g_form.getValue('work_start') == '' && g_form.getValue('work_end') == '')
this.setActualDuration('');
else if (g_form.getValue('work_start') != '' && (g_form.getValue('work_end') != '' || g_scratchpad.actualEndDate != '') ){
var startDate = this._gForm.hasField('work_start') ? this._gForm.getValue('work_start') : g_scratchpad.actualStartDate;
var duration = this._gForm.hasField('work_duration') ? this._gForm.getValue('work_duration') : g_scratchpad.actualDuration;
if( duration === '' )
return;
else {
jslog("Into calculateEndDate -> " + startDate);
var ga = new GlideAjax('AjaxProjectTaskUtil');
ga.addParam('sysparm_start_date', startDate);
ga.addParam('sysparm_name','getEndDate');
ga.addParam('sysparm_duration',duration);
ga.addParam('sysparm_sys_id',g_scratchpad.projectTaskSysId);
ga.addParam('sysparm_allow_dates_outside_schedule',this._gForm.hasField('allow_dates_outside_schedule') ? this._gForm.getValue('allow_dates_outside_schedule') : g_scratchpad.allowDatesOutsideSchedule);
ga.addParam('sysparm_state', this._gForm.hasField('state') ? this._gForm.getValue('state') : g_scratchpad.state );
ga.getXML(this.callbackForSettingActualEndDate.bind(this));
}
}
},
callbackForSettingActualEndDate: function (response) {
jslog("Into handleResponse -> " + response);
if(response && response.responseXML) {
var result = response.responseXML.getElementsByTagName("result");
if(result) {
result = result[0];
var status = result.getAttribute("status");
var column = result.getAttribute("column");
var answer = result.getAttribute("answer");
var stateInactiveFlag = result.getAttribute("stateInactiveFlag");
if(status == 'error') {
jslog("Into handleResponse -> Response is INVALID");
this.showErrorMessage(column);
} else {
jslog("Into handleResponse -> Response is valid");
if (stateInactiveFlag == 'true' ||
(this.invokeForScheduleDateFormat && this.isLaterThanActualStart(answer)))
this.setActualEndDate(answer);
}
}
}
},
setActualStartDate: function (startDate) {
if (this._gForm.hasField('work_start')){
if ( this._gForm.getValue('work_start') != startDate ){
g_scratchpad.actual_field_flag = true;
this._gForm.setValue('work_start', startDate);
g_scratchpad.actual_field_flag = false;
}
}
else
g_scratchpad.actualStartDate = startDate;
},
setActualEndDate: function (endDate) {
if (this._gForm.hasField('work_end')){
if (this._gForm.getValue('work_end') != endDate){
g_scratchpad.actual_field_flag = true;
this._gForm.setValue('work_end', endDate);
g_scratchpad.actual_field_flag = false;
}
}
else
g_scratchpad.actualEndDate = endDate;
},
setActualDuration: function(workDuration) {
if (this._gForm.hasField('work_duration')){
if (this._gForm.getValue('work_duration') != workDuration){
g_scratchpad.actual_field_flag = true;
this._gForm.setValue('work_duration', workDuration);
g_scratchpad.actual_field_flag = false;
}
}
else
g_scratchpad.actualDuration = workDuration;
},
setPercentComplete: function(percentComplete) {
if (this._gForm.hasField('percent_complete')){
if (this._gForm.getValue('percent_complete') != percentComplete){
g_scratchpad.actual_field_flag = true;
this._gForm.setValue('percent_complete', percentComplete);
g_scratchpad.actual_field_flag = false;
}
}
else
g_scratchpad.percentComplete = percentComplete;
},
handleActualStartDateChange: function () {
var offset = (new Date()).getTimezoneOffset();
if ( this._gForm.hasField('work_start') &&
(g_scratchpad.projectScheduleFormat == 'date' || g_scratchpad.timeComponentFromPlanned == 'true')){
this.replaceTimeComponentFromSourceToTarget(this._gForm.getUniqueValue(),
'start_date', 'work_start', this._gForm.getValue('start_date'), this._gForm.getValue('work_start'));
}
},
handleActualEndDateChange: function () {
var offset = (new Date()).getTimezoneOffset();
if (this._gForm.hasField('work_end') && (g_scratchpad.projectScheduleFormat == 'date' || g_scratchpad.timeComponentFromPlanned == 'true')){
this.replaceTimeComponentFromSourceToTarget(this._gForm.getUniqueValue(),
'end_date', 'work_end', this._gForm.getValue('end_date'), this._gForm.getValue('work_end'));
}
},
replaceTimeComponentFromSourceToTarget: function (taskId, sourceField, targetField, sourceValue, targetValue) {
this.invokeForScheduleDateFormat = true;
if (this._gForm.hasField(targetField) && targetValue){
jslog("Into replaceTimeComponentFromSourceToTarget -> " + taskId + " | " + targetField);
var ga = new GlideAjax('AjaxProjectTaskUtil');
ga.addParam('sysparm_name','correctTimeAsPerPlanned');
ga.addParam('sysparm_sys_id', taskId);
ga.addParam('sysparm_source_field', sourceField);
ga.addParam('sysparm_target_field', targetField);
ga.addParam('sysparm_source_value', sourceValue);
ga.addParam('sysparm_target_value', targetValue);
if(targetField == 'work_start')
ga.getXML(this.callbackForSettingActualStartDate.bind(this));
else if(targetField == 'work_end')
ga.getXML(this.callbackForSettingActualEndDate.bind(this));
}
},
callbackForSettingActualStartDate: function (response) {
jslog("Into callbackForSettingActualStartDate - handleResponse -> " + response);
if(response && response.responseXML) {
var result = response.responseXML.getElementsByTagName("result");
if(result) {
result = result[0];
var status = result.getAttribute("status");
var answer = result.getAttribute("answer");
var message = result.getAttribute('message');
if(status == 'error') {
jslog("Into handleResponse -> Response is INVALID");
this.showErrorMessage('work_end', message);
} else {
jslog("Into handleResponse -> Response is valid");
this.setActualStartDate(answer);
}
}
}
},
isLaterThanActualStart: function (newWorkEnd) {
jslog("Into isLaterThanActualStart - newWorkEnd -> " + newWorkEnd);
if (this._gForm.hasField('work_start')) {
var workStart = new Date(getDateFromFormat(this._gForm.getValue('work_start'), g_user_date_time_format));
var workEnd = new Date(getDateFromFormat(newWorkEnd, g_user_date_time_format));
if(workEnd.getTime() >= workStart.getTime())
return true;
return false;
}
},
type: 'PmClientDateAndDurationHandler'
};
/*! RESOURCE: /scripts/lib/jquery/jquery_clean.js */
(function() {
if (!window.jQuery)
return;
if (!window.$j_glide)
window.$j = jQuery.noConflict();
if (window.$j_glide && jQuery != window.$j_glide) {
if (window.$j_glide)
jQuery.noConflict(true);
window.$j = window.$j_glide;
}
})();
;
;
