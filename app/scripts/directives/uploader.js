/**
 * @ngdoc directive
 * @name AppWeb.directive:uploader
 * @element dev
 * @element uploader
 * @function
 * @restrict A
 * @description
 *    Ouput modified main._data object with choosen file.
 * @example
    <div uploader uploader-input="main.params" uploader-output="main._data"></div>
 */

'use strict';

angular
  .module('AppWeb')
  .directive('uploader', [function() {
    return {
        scope: {
            params: '=uploaderInput',
            uploadFiles: '=uploaderFn',
            _data: '=?uploaderOutput',
            extFiles: '=?uploaderExtFiles',
            type: '=uploaderFileExtension',
            isMutliple: '=uploaderMultiple'
        },
        restrict: 'EAC',

        controller: ['$scope', '$filter', 'serviceBus', '$timeout', '$q', 'lodash', function($scope, $filter, serviceBus, $timeout, $q, _){//annotated

            $scope.$watch('params', function(){
                init();
            });

            //public
            angular.extend($scope, {
                'getPickedFiles': function(file) {
                    // Because for some cases we want to able to upload many files with the same tag (for instance add contract template)
                    // Also we have to make sure user can upload several files with same tag id but not the same name
                    var key = $scope.isMutliple ? $filter('URIComponent')(file.name, 'encode') : $scope.file_tag_id;
                    $scope._data.file_tags[key] = angular.extend(
                        {
                            file: file,
                            path:  $filter('URIComponent')(file.name, 'encode'),
                            size: file.size,
                            file_tag_id: $scope.file_tag_id,
                            description: $scope.description
                        }
                    );
                },

                'removeFile': function(file_tag_id) {
                    delete $scope._data.file_tags[file_tag_id];
                    angular.element(document.querySelector('input[type="file"]')).attr('value','');
                },

                'chooseFile': function(file_tag_id, description) {
                    if (file_tag_id) {
                        $scope.file_tag_id = file_tag_id;
                        $scope.description = description;
                        $timeout(function() {
                            document.querySelector('input[type="file"]').click(file_tag_id);
                        }, 0);
                    }
                },

                'removeExtFile': function (uuid) {
                  serviceBus.file.delete(uuid)
                    .then(function(resp) {
                      if (resp.success) {
                         $scope.extFilesFiltered =_.reject($scope.extFilesFiltered, {'uuid': uuid});
                      }
                    });
                },

                'uploadFiles': function() {
                    var deferred = $q.defer();

                    var arrayOfKey = Object.keys($scope._data.file_tags) || [];
                    if (!arrayOfKey.length) {
                        //add external attached files
                        deferred.resolve([].concat(_.map($scope.extFilesFiltered, 'id')));
                        return deferred.promise;
                    }

                    var cnt = 0, uploaded_ids = [], endCount = arrayOfKey.length;
                    var func = function () {
                        uploadFile(arrayOfKey[cnt], uploaded_ids).then(function(){
                            cnt++;
                            if (cnt === arrayOfKey.length) {
                                //all files is uploaded + add external attached files
                                deferred.resolve([].concat(uploaded_ids, _.map($scope.extFilesFiltered, 'id')));
                            } else {
                                func();
                            }

                        }).catch(function(){

                                deferred.reject();

                        });
                    };
                    func();

                    return deferred.promise;

                }
            });

            //private
            function uploadFile(file_tag_id, uploaded_ids) {

                var file_data = $scope._data.file_tags[file_tag_id] || {}, fd = new FormData(),
                deferred = $q.defer();
                fd.append('file', file_data.file);
                fd.append('file_tag_id', file_data.file_tag_id);

                return (file_data.uploaded || file_data.external) ?  (function(){
                    deferred.resolve();
                    return deferred.promise;

                })() : serviceBus.contracts.uploadFile(fd).then(function(resp){
                    file_data.uploaded = true;//add state uploaded
                    // In case of multpile upload we need to id plus the name match to the good model to create
                    var result = $scope.isMutliple ? {id: resp.id, name: resp.name } : resp.id;
                    uploaded_ids.push(result);
                    return resp;
                });
            }


            function init() {
                serviceBus.picklists.getFileTags($scope.params)
                // get file tags IDs
                .then(function(resp) {
                    angular.extend($scope._data, {file_tags: {} });
                    angular.extend($scope, {file_tags:resp});
                    return _.map($scope.file_tags, 'id');
                })
                // get external files
                .then(function(file_tags_id) {
                    $scope.extFilesFiltered = _.filter($scope.extFiles, function(extFile) {
                        extFile.external = true;
                        return _.includes(file_tags_id, extFile.file_tag_id); });
                });


            }

        }],

        transclude: true,

        link: function(scope, element, attrs) {
            // scope.params = attrs['uploader-input'];

        },

        template: '<form-template tmpls="\'local_shared/uploader/main.tmpl\'"></form-template><ng-transclude></ng-transclude>'
    };
  }]);
