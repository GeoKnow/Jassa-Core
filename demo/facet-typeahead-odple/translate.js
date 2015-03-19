var translationsEN = {
  HEADLINE: 'People Finder',
  LAST_NAME: 'Last Name',
  FIRST_NAME: 'First Name',
  SITE_NAME: 'Site Name',
  STREET_ADDRESS: 'Street Address',
  POSTAL_CODE: 'Postal Code',
  LANG_SETTINGS: 'Language Settings',
  BUTTON_LANG_DE: 'german',
  BUTTON_LANG_EN: 'english'
};
 
var translationsDE= {
  HEADLINE: 'Personensuche',
  LAST_NAME: 'Nachname',
  FIRST_NAME: 'Vorname',
  SITE_NAME: 'Name des Standorts',
  STREET_ADDRESS: 'Strasse',
  POSTAL_CODE: 'Postleitzahl',
  LANG_SETTINGS: 'Sprachen',
  BUTTON_LANG_DE: 'deutsch',
  BUTTON_LANG_EN: 'englisch'
};
 
app.config(['$translateProvider', function ($translateProvider) {
  // add translation tables
  $translateProvider.translations('en', translationsEN);
  $translateProvider.translations('de', translationsDE);
  $translateProvider.preferredLanguage('de');
  $translateProvider.fallbackLanguage('en');
}]);


app.controller('AppCtrl', ['$translate', '$scope', function ($translate, $scope) {
  $scope.changeLanguage = function (langKey) {
    $translate.use(langKey);
  };
}]);