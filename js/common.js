$.ajaxSetup({
  beforeSend: function(xhr){
    xhr.setRequestHeader('Accept', 'application/vnd.puxin.v1+json');
    xhr.setRequestHeader('Authorization', "Bearer " + md5(USERID));
  }
});
