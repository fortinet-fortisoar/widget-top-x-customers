'use strict';
(function () {
    angular
        .module('cybersponse')
        .controller('top3100Ctrl', top3100Ctrl);

    top3100Ctrl.$inject = ['$q', '$scope', 'API', '$resource', 'Query', '$filter', 'PagedCollection', '$rootScope', 'dynamicVariableService'];

    function top3100Ctrl($q, $scope, API, $resource, Query, $filter, PagedCollection, $rootScope, dynamicVariableService) {
        //array of colours for the layers
        $scope.colors = [
            "border-left:4px solid rgba(66, 235, 245, 0.7);background: linear-gradient(90deg, rgba(32, 180, 189, 0.4) 0%, rgba(10, 31, 46, 0) 100%);",
            " border-left:4px solid #DC1982;background: linear-gradient(90deg, rgba(152, 19, 91, 0.4) 0%, rgba(10, 31, 46, 0) 100%);",
            "border-left:4px solid rgba(65, 41, 203, 0.7); background: linear-gradient(90deg, rgba(45, 17, 209, 0.6) 0%, rgba(10, 31, 46, 0) 100%);"
        ]


        function init() {
            dynamicVariableService.loadDynamicVariables().then(function (dynamicVariables) {
                var name = "WidgetGlobalVariable";
                $scope.globalVariables = getObjectById(dynamicVariables, name);
                eventListner();
            });
            if ($scope.config.moduleType == 'Across Modules') { getTop3records(); }
            else { getRecordsFromCustomModule(); }
        }
        init();

        function getObjectById(data, name) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].name === name) {
                    if (data[i].value === "true") {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
            return false; // return false if no object with the given id is found
        }

        function eventListner(){
            if($scope.globalVariables){
                $rootScope.$on('GlobalVisiblityEvent', function (event, data) {
                    if($scope.config.funnelModuleType == 'Single Module'){
                        $scope.config.query.filters = [];
                        $scope.config.query.filters.push(
                            {
                                field: "id",
                                operator: "eq",
                                type: "primitive",
                                value: data,
                                _operator: "eq"
                            }
                        )
                        getRecordsFromCustomModule(true)
                    }
                })
            }
        }

        function getTop3records() {
            //building query
            $scope.config.query.sort = [{
                field: 'total',
                direction: 'DESC'
            }];
            $scope.config.query.aggregates = [
                {
                    'operator': 'countdistinct',
                    'field': '*',
                    'alias': 'total'
                },
                {
                    'alias': 'type',
                    'field': $scope.config.groupByPicklistOrLookup + '.itemValue',
                    'operator': 'groupby'
                }
            ];
            $scope.config.query.limit = 3;

            var _queryObj = new Query($scope.config.query);

            getResourceData($scope.config.module, _queryObj).then(function (result) {
                var _dataSource = undefined;
                if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
                    $scope.res = result['hydra:member'];
                    _dataSource = {};
                    if ($scope.res.length > 0) {
                        $scope.res.forEach(element => {
                            if (element.type !== null) {
                                _dataSource[element.type] = $filter('numberToDisplay')(element.total);
                            }
                        });
                        createLayers(_dataSource);
                    }
                }
            });

        }

        function getRecordsFromCustomModule(changeData) {
            var filters = {
                query: $scope.config.query
            };
            var _dataSource = undefined;
            var pagedTotalData = new PagedCollection($scope.config.module, null, null);
            pagedTotalData.loadByPost(filters).then(function () {
                var data = pagedTotalData.fieldRows[0][$scope.config.customModuleField].value;
                var nestedKeysArray = $scope.config.keyForCustomModule.split('.');
                if (nestedKeysArray.length >= 1) {
                    nestedKeysArray.forEach(function (value) {
                        data = data[value];
                    })
                }
                if (data === undefined) {
                    _dataSource = { "Key is invalid... ": "" }
                }
                else {
                    var dataArray = Object.entries(data);
                    dataArray.sort((a, b) => b[1] - a[1]);
                    _dataSource = {};
                    for (var index = 1; index <= Math.min(3, dataArray.length); index++) {
                        _dataSource[dataArray[index - 1][0]] = $filter('numberToDisplay')(dataArray[index - 1][1]);
                    }
                }
                if (changeData) {
                    changeInnerData(_dataSource);
                }
                else {
                    createLayers(_dataSource);
                }
            })
        }

        function changeInnerData(element) {
            var index = 0;
            for (let [key, value] of Object.entries(element)) {
                var getInnerNumber = document.getElementById((index + 1) + "-innerNumberElement-" + $scope.config.wid);
                var getInnerText = document.getElementById((index + 1) + "-innerTextElement-" + $scope.config.wid);
                getInnerText.innerHTML = key;
                getInnerNumber.innerHTML = value;
                index++;
            }
        }

        function getResourceData(resource, queryObject) {
            var defer = $q.defer();
            $resource(API.QUERY + resource).save(queryObject.getQueryModifiers(), queryObject.getQuery(true)).$promise.then(function (response) {
                defer.resolve(response);
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        }

        function createLayers(element) {

            var parentDiv = document.getElementById("top3ParentDiv-" + $scope.config.wid);

            var leftBorderElement = document.createElement('div');
            leftBorderElement.setAttribute('class', 'layer-border-left');
            var innerTextElement = document.createElement('div');
            innerTextElement.setAttribute('class', 'innder-div-text');
            var innerNumberElement = document.createElement('class', 'inner-div-number');
            innerNumberElement.setAttribute('class', 'inner-div-number');
            var innerOuterDiv = document.createElement('div');
            innerOuterDiv.setAttribute('class', 'inner-outer-div');
            var index = 0;

            for (let [key, value] of Object.entries(element)) {

                var leftBorderElement = document.createElement('div');
                leftBorderElement.setAttribute('class', 'layer-border-left');
                leftBorderElement.setAttribute('id', key + "-leftBorderElement");
                leftBorderElement.setAttribute('style', $scope.colors[index])

                var innerTextElement = document.createElement('div');
                innerTextElement.setAttribute('class', 'innder-div-text');
                innerTextElement.setAttribute('id', (index + 1) + "-innerTextElement-" + $scope.config.wid);
                innerTextElement.innerHTML = key;

                var innerNumberElement = document.createElement('div', 'inner-div-number');
                innerNumberElement.setAttribute('class', 'inner-div-number');
                innerNumberElement.setAttribute('id', (index + 1) + "-innerNumberElement-" + $scope.config.wid);
                innerNumberElement.innerHTML = value;

                var innerOuterDiv = document.createElement('div');
                innerOuterDiv.setAttribute('class', 'inner-outer-div');
                innerOuterDiv.setAttribute('id', key + "-innerOuterDiv");

                innerOuterDiv.appendChild(innerTextElement);
                innerOuterDiv.appendChild(innerNumberElement);
                leftBorderElement.appendChild(innerOuterDiv);
                parentDiv.appendChild(leftBorderElement);

                index++;
            }


        }
    }
})();
