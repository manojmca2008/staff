window.Staff ={} ;
Staff.version=1;
window.apiUrl = "http://munch-local.com/wapi";
authenticationToken();
function getToken(){
    $.ajax({
            url: apiUrl + "/auth/token",
            dataType: 'json',
            type: 'post',
            success: function(data) {
                if (data['token']) { 
                    $.jStorage.set("oauth.token", data['token']);
                    $.jStorage.setTTL("oauth.token", 315360000000);
                    $.jStorage.set('isAuthenticated', true);
                    Staff.getRestaurantList();                
                $('.reorganizingloader').removeClass('hide');
                }
            },
            error: function(jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
}
function authenticationToken() {
    var token = $.jStorage.get('oauth.token');	
    if (token != null) {
        $.ajax({
                url: apiUrl + "/auth/token/" + $.jStorage.get('oauth.token'),
                cache: false,
                type: 'get',
                success: function(data) {
                    if (data['valid']) {
                    	$.jStorage.set("isAuthenticated", true);
                        Staff.getRestaurantList();                                 
	                } else {
	                    $.jStorage.deleteKey('oauth.token');
	                    $.jStorage.set("isAuthenticated", false);
                        getToken();
	                }
                    $('.reorganizingloader').removeClass('hide');
            	},
            	error: function() {}
        });
	} else {
	    var isAuthenticated = $.jStorage.get("isAuthenticated");
		if (!isAuthenticated) {
                  getToken();
		} else {
	    	$.jStorage.setTTL("oauth.token", 315360000000);
		}
	}
}
Staff.getRestaurantList=function (){
    var options = '';
    $.ajax({
        url:apiUrl+'/servers/restaurantList?token='+$.jStorage.get('oauth.token'),
        cache: false,
        type: 'get',
        dataType: 'json',
        success: function(data) {
            if(data.length > 0){
                options +='<option value="">Select Restaurant</option>';
             $.each(data,function(item,value){        
                   options +='<option value="'+value.id+'">'+value.restaurant_name+' - '+value.address+'</option>';        
              });
            }
            $("#rest-list").empty().html(options);
        },
        error: function() {}
    });
};
Staff.registration=function (){
    if($("input[name=loyality_code]").val() == ''){
        var loyalty_code = '';
    }else{
        var loyalty_code = $("input[name=loyality_code]").val();
    }
    var hasError = Staff.validateFirstName();
        hasError1 = Staff.validateEmail();
        hasError2 = Staff.validatePhone();
        hasError3 = Staff.validateLoyaltyCode();
        hasError4 = Staff.validatePassword();
     if(hasError || hasError1 || hasError2 || hasError3 || hasError4) {
         return false;
     }
     $('.processingImg').removeClass('hide');
    var registerData = {
            'first_name': $("input[name=first_name]").val(),
            'last_name': $("input[name=last_name]").val(),
            'restaurant_id': $( "#rest-list" ).val(),
            'email': $("input[name=email]").val(),
            'phone': $("input[name=phone]").val(),
            'password': $("input[name=password]").val(),
            'loyality_code': loyalty_code,
            'token': $.jStorage.get('oauth.token')
        };
    $.ajax({
        url:apiUrl+'/servers/register',
        data: JSON.stringify(registerData),
        contentType: "application/json; charset=utf-8",
        type: 'post',
        success: function(response) {
            if(response.success == true){
                $('.processingImg').addClass('hide');
                $("#myModal").modal('hide');
                $("#myModal3").modal('show');
                $.jStorage.set('isLoggedIn',true);
                setTimeout(function(){
                    $("#myModal3").modal('hide');
                   location.reload();
                   window.location.href = 'stats.html'
                 },1500);
            }
        },
        error: function(response) {
            $('.processingImg').addClass('hide');
            response = $.parseJSON(response['responseText']);
            var error = response["error"];
            $('.error-message-dym').removeClass('hide');
            $('.error-message-dym').empty().html(error);
        }
    });
};
Staff.login=function (){
    var hasError = Staff.validateloginEmail();
        hasError1 = Staff.validateLoginPassword();
     if(hasError || hasError1) {
         return false;
     }
    $('.processingImg').removeClass('hide');
    var loginData = {
            'email': $("input[name=login_email]").val(),
            'password': $("input[name=login_password]").val(),
            'token': $.jStorage.get('oauth.token')
        };
    $.ajax({
        url:apiUrl+'/servers/login',
        data: JSON.stringify(loginData),
        contentType: "application/json; charset=utf-8",
        type: 'post',
        success: function(response) {
            if(response.success == true){
                $('.processingImg').addClass('hide');
                $('#myModal2').hide();
                $.jStorage.set('isLoggedIn',true);
                window.location.href = 'stats.html'
            }
        },
        error: function(response) {
            $('.processingImg').addClass('hide');
            response = $.parseJSON(response['responseText']);
            var error = response["error"];
            $('.error-message-login-dym').removeClass('hide');
            $('.error-message-login-dym').empty().html(error);
        }
    });
};
Staff.logout=function (){
    $.ajax({
        url:apiUrl+'/servers/logout?token='+$.jStorage.get('oauth.token'),
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        type: 'get',
        success: function(response) {
            if(response.success == true){
             //$("#myModal5").modal('show');
                $.jStorage.set('isLoggedIn',false);
                window.location.href = 'index.html'
            }
        },
        error: function() {}
    });
};

$( ".registerBtn" ).click(function() {
  Staff.registration();
});
$( ".loginBtn" ).click(function() {
  Staff.login();
});
$( "#register-popup" ).click(function() {
    Staff.inputFormatter();
    $(".error-message").addClass("hide");
    $(".error-message-dym").addClass("hide");
    $("input[name=first_name]").val('');
    $("input[name=last_name]").val('');
    $("input[name=email]").val('');
    $("input[name=phone]").val('');
    $("input[name=password]").val('');
    $("input[name=loyality_code]").val('');
});
$( "#login-popup" ).click(function() {
    $(".error-message-login").addClass("hide");
    $(".error-message-password").addClass("hide");
    $(".error-message-login-dym").addClass("hide");
    $("input[name=login_email]").val('');
    $("input[name=login_password]").val('');
});
Staff.validateFirstName = function(){
    var hasError = false;
    var firstName = $("input[name=first_name]");
    var errorMessage = firstName.closest("div").find(".error-message");
    if ($.trim(firstName.val()) === "") {
        errorMessage.removeClass("hide");
        hasError = true;
    } else {
        errorMessage.addClass("hide");
    }
    var value = $.trim(firstName.val());
    $("input[name=first_name]").val(value);
    return hasError;
};
Staff.validateEmail = function(){
    var hasError = false,
        email = $("input[name=email]");
    var emailFormat = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

    if ($.trim(email.val()) === "") {
        email.closest("div").find(".error-message").removeClass("hide").html('Hey, you forgot something');
        hasError = true;
    } else {
        if (!emailFormat.test(email.val())) {
            email.closest("div").find(".error-message").removeClass("hide").html('That don\'t look like any e-mail I ever seen. Maybe the "@" or the "." are in the wrong spot. This isn\'t cubism, put things where they belong!');
            hasError = true;
        } else {
            email.closest("div").find(".error-message").addClass("hide");
        }
    }
    return hasError;
};
Staff.validatePassword = function(){
    var hasError = false,
        password = $("input[name=password]");

    if ($.trim(password.val()) === "") {
        password.closest("div").find(".error-message").removeClass("hide").html('Whoa now, we can\'t let you go without a password.');
        hasError = true;
    } else {
        if (password.val().length < 6) {
            password.closest("div").find(".error-message").removeClass("hide").html('You need to use at least 6 characters. Try making it a personal catchphrase. Like yabadabadoo. But not that. Seriously Don\'t.');
            hasError = true;
        } else {
            password.closest("div").find(".error-message").addClass("hide");
        }
    }
    return hasError;
};
Staff.validateLoginPassword = function(){
    var hasError = false,
        password = $("input[name=login_password]");

    if ($.trim(password.val()) === "") {
        password.closest("div").find(".error-message-login").removeClass("hide").html('Whoa now, we can\'t let you go without a password.');
        hasError = true;
    } else {
        if (password.val().length < 6) {
            password.closest("div").find(".error-message-login").removeClass("hide").html('You need to use at least 6 characters. Try making it a personal catchphrase. Like yabadabadoo. But not that. Seriously Don\'t.');
            hasError = true;
        } else {
            password.closest("div").find(".error-message-login").addClass("hide");
        }
    }
    return hasError;
};
Staff.validateloginEmail = function(){
    var hasError = false,
        email = $("input[name=login_email]");
    var emailFormat = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

    if ($.trim(email.val()) === "") {
        email.closest("div").find(".error-message-login").removeClass("hide").html('Hey, you forgot something');
        hasError = true;
    } else {
        if (!emailFormat.test(email.val())) {
            email.closest("div").find(".error-message-login").removeClass("hide").html('That don\'t look like any e-mail I ever seen. Maybe the "@" or the "." are in the wrong spot. This isn\'t cubism, put things where they belong!');
            hasError = true;
        } else {
            email.closest("div").find(".error-message-login").addClass("hide");
        }
    }
    return hasError;
};
Staff.validatePhone = function(){
    var hasError = false,
        phoneNo = $("input[name=phone]"),
        phoneVal = $.trim(phoneNo.val().replace(/([*()'-\/ ])/g, ''));
    if (phoneVal === '') {
        phoneNo.closest("div").find(".error-message").html("We promise; No prank calls").fadeIn("slow").removeClass("hide");
        hasError = true;
    } else if (phoneVal.length < 10) {
        phoneNo.closest("div").find(".error-message").html('You know, there\'s a cadence to phone numbers. They usually go xxx-xxx-xxxx').fadeIn("slow").removeClass("hide");
        hasError = true;
    } else {
        phoneNo.closest("div").find(".error-message").html("").fadeOut("slow").addClass("hide");
    }
    return hasError;
};
Staff.validateLoyaltyCode = function(){
    var hasError = false;
    var loyalityCode = $("input[name=loyality_code]");
    var errorMessage = loyalityCode.closest("div").find(".error-message");
    if ($.trim(loyalityCode.val()) === "") {
        errorMessage.removeClass("hide");
        hasError = true;
    } else {
        errorMessage.addClass("hide");
    }
    var value = $.trim(loyalityCode.val());
    $("input[name=loyalityCode]").val(value);
    return hasError;
};

$("input[name=first_name]").on('blur', $.proxy(Staff.validateFirstName, Staff));
$("input[name=email]").on('blur', $.proxy(Staff.validateEmail, Staff));
$("input[name=password]").on('blur', $.proxy(Staff.validatePassword, Staff));
$("input[name=login_password]").on('blur', $.proxy(Staff.validateLoginPassword, Staff));
$("input[name=login_email]").on('blur', $.proxy(Staff.validateloginEmail, Staff));
$("input[name=phone]").on('blur', $.proxy(Staff.validatePhone, Staff));
$("input[name=loyality_code]").on('blur', $.proxy(Staff.validateLoyaltyCode, Staff));

Staff.inputFormatter = function(){
    var phoneFormatter = new Formatter($("input[name=phone]").get(0), {
         'pattern': '{{999}}{{999}}{{9999}}'
    });
    var nameFormatter = new Formatter($("input[name=first_name]").get(0), {
        'pattern': '{{aNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN}}'
    });
};
Staff.customerList = function(page){
    $.jStorage.set("page", page);
    var month = ($('#month').val()) ? $('#month').val() : '';
    
    $.ajax({
        url:apiUrl+'/servers/customersList?token='+$.jStorage.get('oauth.token')+'&month='+month+'&page='+page,
        cache: false,
        type: 'get',
        dataType: 'json',
        success: function(response) {
            var tbody = "";
            var pagination = "";
            $("#total-cust").empty().html(response.total_customers);
            $("#total-trans").empty().html(response.total_transaction);
            $("#total-referals").empty().html(response.total_referals);
            if(response.data.length > 0){
             $.each(response.data,function(item,value){
             $('.paginationBox').removeClass('hide');
             $('.no-record').html('');        
                   tbody +='<tr><td>'+ value['s_no'] +'</td>';
                               tbody +='<td>'+ value['customer'] +'</td>';
                               tbody +='<td>'+ value['join_date'] +'</td>';
                               tbody +='<td>'+ value['first_transaction'] +'</td>';
                               //tbody +='<td>'+ value['referals'] +'</td>';
                           tbody +='</tr>';        
              });
             $.jStorage.set("total_page", response.total_pages);
             for (var i = 1; i <=response.total_pages; i++) {
                if(i==1){
                    pagination +='<li class="active page" id="page'+ i +'"><a href="#">'+ i +'</a></li>';
                }else{
                    pagination +='<li class="page" id="page'+ i +'"><a href="#">'+ i +'</a></li>';
                }
                
             }
            }else{
                $('.no-record').empty().html('No Record Found');
                $('.paginationBox').addClass('hide');
            }
            $('#cust-list').empty().html(tbody);
            $('.paging').empty().html(pagination);
            $('.paging li').off('click');
            $('.paging li').on('click', function(e) {
                e.preventDefault();
                $('.paging li').removeClass('active');
                $(this).addClass('active');
                Staff.customerListPagination($(this).text());
            });
        },
        error: function() {}
    });
}
Staff.customerListPagination = function(page){
    var month = ($('#month').val()) ? $('#month').val() : '';
   
    $.ajax({
        url:apiUrl+'/servers/customersList?token='+$.jStorage.get('oauth.token')+'&month='+month+'&page='+page,
        cache: false,
        type: 'get',
        dataType: 'json',
        success: function(response) {
            var tbody = "";
            var pagination = "";
            $("#total-cust").empty().html(response.total_customers);
            $("#total-trans").empty().html(response.total_transaction);
            $("#total-referals").empty().html(response.total_referals);
            if(response.data.length > 0){
             $.each(response.data,function(item,value){
             $('.paginationBox').removeClass('hide');
             $('.no-record').html('');        
                   tbody +='<tr><td>'+ value['s_no'] +'</td>';
                               tbody +='<td>'+ value['customer'] +'</td>';
                               tbody +='<td>'+ value['join_date'] +'</td>';
                               tbody +='<td>'+ value['first_transaction'] +'</td>';
                               //tbody +='<td>'+ value['referals'] +'</td>';
                           tbody +='</tr>';        
              });
              $.jStorage.set("total_page", response.total_pages);
            }else{
                $('.no-record').empty().html('No Record Found');
                $('.paginationBox').addClass('hide');
            }
            $('#cust-list').empty().html(tbody);
        },
        error: function() {}
    });
}