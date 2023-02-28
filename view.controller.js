'use strict';
(function () {
    angular
        .module('cybersponse')
        .controller('top3100Ctrl', top3100Ctrl);

    top3100Ctrl.$inject = ['$q','$scope', 'API', '$resource', 'Query', '$filter', 'PagedCollection'];

    function top3100Ctrl($q, $scope, API, $resource, Query, $filter, PagedCollection) {
        //array of colours for the layers
        $scope.colors = [
            "border-left:4px solid rgba(66, 235, 245, 0.7);background: linear-gradient(90deg, rgba(32, 180, 189, 0.4) 0%, rgba(10, 31, 46, 0) 100%);",
            " border-left:4px solid #DC1982;background: linear-gradient(90deg, rgba(152, 19, 91, 0.4) 0%, rgba(10, 31, 46, 0) 100%);",
            "border-left:4px solid rgba(65, 41, 203, 0.7); background: linear-gradient(90deg, rgba(45, 17, 209, 0.6) 0%, rgba(10, 31, 46, 0) 100%);"            
        ]

        function init(){
            if($scope.config.moduleType==0)
                getTop3records();
            else
                getRecordsFromCustomModule();
        }
        init();

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

        function getRecordsFromCustomModule(){
            var filters = {
                query: $scope.config.query
              };
            var pagedTotalData = new PagedCollection($scope.config.customModule, null, null);
            pagedTotalData.loadByPost(filters).then(function () {
                var data = pagedTotalData.fieldRows[0][$scope.config.customModuleField].value;

                
            })

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
        function createLayers(element){
            var parentDiv =document.getElementById("top3" + $scope.config.wid);
            var leftBorderElement = document.createElement('div');
            leftBorderElement.setAttribute('class','layer-border-left');
            var innerTextElement = document.createElement('div');
            innerTextElement.setAttribute('class', 'innder-div-text');
            var innerNumberElement = document.createElement('class', 'inner-div-number');
            innerNumberElement.setAttribute('class','inner-div-number');
            var innerOuterDiv = document.createElement('div');
            innerOuterDiv.setAttribute('class', 'inner-outer-div');
            var index = 0;
            for (let [key, value] of Object.entries(element)) {

                var leftBorderElement = document.createElement('div');
                leftBorderElement.setAttribute('class','layer-border-left');
                leftBorderElement.setAttribute('id', key+"-leftBorderElement");
                leftBorderElement.setAttribute('style',$scope.colors[index])

                var innerTextElement = document.createElement('div');
                innerTextElement.setAttribute('class', 'innder-div-text');
                innerTextElement.setAttribute('id', key+"-innerTextElement");
                innerTextElement.innerHTML = key;

                var innerNumberElement = document.createElement('class', 'inner-div-number');
                innerNumberElement.setAttribute('class','inner-div-number');
                innerNumberElement.setAttribute('id', key+"-innerNumberElement");
                innerNumberElement.innerHTML = value;

                var innerOuterDiv = document.createElement('div');
                innerOuterDiv.setAttribute('class', 'inner-outer-div');
                innerOuterDiv.setAttribute('id', key+"-innerOuterDiv");

                innerOuterDiv.appendChild(innerTextElement);
                innerOuterDiv.appendChild(innerNumberElement);
                leftBorderElement.appendChild(innerOuterDiv);
                parentDiv.appendChild(leftBorderElement);

                index++;
            }


        }
    }
})();
