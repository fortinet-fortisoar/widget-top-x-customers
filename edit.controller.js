'use strict';
(function () {
    angular
        .module('cybersponse')
        .controller('editTop3100Ctrl', editTop3100Ctrl);

    editTop3100Ctrl.$inject = ['$scope', '$uibModalInstance', 'config', 'appModulesService', 'Entity'];

    function editTop3100Ctrl($scope, $uibModalInstance, config, appModulesService, Entity) {
        $scope.cancel = cancel;
        $scope.save = save;
        $scope.config = config;
        $scope.onModuleChange = onModuleChange;
        $scope.onChangeModuleType = onChangeModuleType;
        $scope.moduleType = {
            type: ['Across Modules', 'Single Module']
        }

        $scope.layers = ['1', '2', '3'];

        function init() {
            appModulesService.load(true).then(function (modules) {
                $scope.modules = modules;
            })
            $scope.config.query = $scope.config.query ? $scope.config.query : [];

        }
        init();

        function onChangeModuleType() {
            delete $scope.config.module;
            delete $scope.config.query;
            delete $scope.config.groupByPicklistOrLookup;
        }

        function loadAttributes() {
            $scope.fields = [];
            $scope.fieldsArray = [];
            $scope.config.picklistOrLookup = [];
            var entity = new Entity($scope.config.module);
            entity.loadFields().then(function () {
                if ($scope.config.moduleType === 0) {
                    for (var key in entity.fields) {
                        if (entity.fields[key].type === "picklist" || entity.fields[key].type === "lookup") {
                            $scope.config.picklistOrLookup.push(entity.fields[key]);
                        }
                    }
                }
                else{
                    for (var key in entity.fields) {
                        if (entity.fields[key].type === "object") {
                            $scope.config.jsonFields.push(entity.fields[key]);
                        }
                    }
                }

                $scope.config.fields = entity.getFormFields();
                angular.extend($scope.fields, entity.getRelationshipFields());
                $scope.config.fieldsArray = entity.getFormFieldsArray();
                // loadPicklistFields();
            });
        }

        function onModuleChange() {
            loadAttributes()
        }

        function cancel() {
            $uibModalInstance.dismiss('cancel');
        }

        function save() {
            $uibModalInstance.close($scope.config);
        }

    }
})();
