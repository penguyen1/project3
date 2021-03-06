const auth = {
  getUsers(cb){
    $.ajax({
      url: "/api/v1/users",
      type: "get",
      beforeSend: function( xhr ) {
        xhr.setRequestHeader("Authorization", "Bearer " + auth.getToken() );
      }
    }).fail((error)=>{
      console.log('error: ', error)
    })
  },

  login(username, password, cb) {
    cb = arguments[arguments.length - 1]

    if (localStorage.token) {     // checks if a token is 
      if (cb) cb(true)
      this.onChange(true)
      return
    }

    if(username && password){  
      loginRequest(username, password, (res) => {

        if (res.authenticated) {
          localStorage.token = res.token
          if (cb) cb(true)
          this.onChange(true)
        } else {
          if (cb) cb(false)
          this.onChange(false)
        }
      })
    }
  },

  getToken() {
    return localStorage.token
  },

  logout(cb) {
    delete localStorage.token
    if (cb) cb()
    this.onChange(false)
  },

  loggedIn() {
    return !!localStorage.token
  },

  onChange() {}
}




function loginRequest(username, password, cb) {
  $.post('/api/v1/users/login', {username: username, password: password})
  .done((data) => {
    cb({
      authenticated: true,
      token: data.token
    })
    auth.getUsers();
  })
  .fail ((data) => {
    cb({
      status:202,
      data: data
    })
  })
}

module.exports = auth;
