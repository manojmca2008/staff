window.Staff ={} ;
Staff.version=1;
window.apiUrl = "https://demoapi.munchado.com/wapi";
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
        hasError1 = Staff.validateRestaurantName();
        hasError2 = Staff.validateEmail();
        hasError3 = Staff.validatePhone();
        hasError4 = Staff.validateLoyaltyCode();
        hasError5 = Staff.validatePassword();
     if(hasError || hasError1 || hasError2 || hasError3 || hasError4 || hasError5) {
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
Staff.enrollCustomers=function (){
    var hasError = Staff.validateEnrollEmail();
     if(hasError) {
         return false;
     }
    $('.processingImg').removeClass('hide');
    var emails = {
            'email': $("input[name=enroll_email]").val(),
        };
    $.ajax({
        url:apiUrl+'/servers/enrollcustomers',
        data: JSON.stringify(emails),
        contentType: "application/json; charset=utf-8",
        type: 'post',
        success: function(response) {
            if(response.success == true){
                $('.processingImg').addClass('hide');
                $("#myModal4").modal('hide')
                $("#myModal5").modal('show')
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
$( "#enroll-popup" ).click(function() {
    $(".error-message").addClass("hide");
    //$(".error-message-login-dym").addClass("hide");
    $("input[name=enroll_email]").val('');
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
Staff.validateRestaurantName = function(){
    var hasError = false;
    var restName = $("select[name=rest-name]");
    var errorMessage = restName.closest("div").find(".error-message");
    if ($.trim(restName.val()) === "") {
        errorMessage.removeClass("hide");
        hasError = true;
    } else {
        errorMessage.addClass("hide");
    }
    var value = $.trim(restName.val());
    restName.val(value);
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
Staff.validateEnrollEmail = function(){
    var hasError = false,
        email = $("input[name=enroll_email]");
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
$("select[name=rest-name]").on('blur', $.proxy(Staff.validateRestaurantName, Staff));
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
                               tbody +='<td class="text-capitalize">'+ value['customer'] +'</td>';
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
                               tbody +='<td class="text-capitalize">'+ value['customer'] +'</td>';
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
$('#login_password').keyup(function(e) {
    var key = e.which;
    if (key == 13) {
    Staff.login();
    }
});
Staff.getDaysFromTwoDates = function(firstDate){
    var date1 = new Date(firstDate);
    var date2 = new Date();
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
    return diffDays;
}
Staff.leaderboard = function(page){
    var d = new Date();
    var m = d.getMonth();
    var month = ($('#month').val()) ? $('#month').val() : m + 1;
    var year = d.getFullYear();
    $.ajax({
        url:apiUrl+'/servers/leaderboard?token='+$.jStorage.get('oauth.token')+'&month='+month+'&year='+year,
        cache: false,
        type: 'get',
        dataType: 'json',
        success: function(response) {
            var tbody = "";
            if(response.superstar.length > 0){
             $.each(response.superstar,function(item,value){        
                   tbody +='<tr><td class="text-capitalize">'+ value['server_name'] +'</td>';
                               tbody +='<td>'+ value['total_customers'] +'</td>';
                               if(value['total_customers'] > 100){
                                    tbody +='<td>$500</td></tr>';
                               }else{
                                tbody +='<td></td></tr>';
                               } 
              });                                                                                             
            }
            var total = 100-response.server_details.monthwise_customers['total_customers'];
            console.log(response.server_details.monthwise_customers['total_customers']);
            tbody +='<tr class="tableFooter"><td>You</td>';
                 tbody +='<td>'+total+' to go</td>';
                 tbody +='<td>'+response.server_details.monthwise_customers['total_customers']+'</td></tr>';
            $('#leader-superstar').empty().append(tbody);
             var tbody = "";
            if(response.speedster.length > 0){
             $.each(response.speedster,function(item,value){        
                   tbody +='<tr><td class="text-capitalize">'+ value['server_name'] +'</td>';
                               tbody +='<td>Joined '+ Staff.getDaysFromTwoDates(value['date']) +' days ago</td>';
                               tbody +='<td>'+ value['total_customers'] +'</td></tr>';     
              });                                                                                             
            }
            tbody +='<tr class="tableFooter"><td>You</td>';
                 tbody +='<td>Joined '+Staff.getDaysFromTwoDates(response.server_details.monthwise_customers['date'])+' days ago</td>';
                 tbody +='<td>'+response.server_details.monthwise_customers['total_customers']+'</td></tr>';
            $('#leader-speedster').empty().append(tbody);
            var tbody = "";
            if(response.local_hero.length > 0){
             $.each(response.local_hero,function(item,value){        
                   tbody +='<tr><td class="text-capitalize">'+ value['server_name'] +'</td>';
                               tbody +='<td>'+ value['restaurant_name'] +'</td>';
                               tbody +='<td>'+ value['total_customers'] +'</td></tr>';     
              });                                                                                            
            }
            tbody +='<tr class="tableFooter">';
                 tbody +='<td>You</td>';
                 tbody +='<td class="dinaDevistd"><small class="text-capitalize">Customer name: '+response.server_details.yearwise_customers['server_name']+'</small><br></td>';
                 tbody +='<td>'+response.server_details.yearwise_customers['total_customers']+'</td></tr>'; 
            $('#leader-hero').empty().append(tbody);
            var tbody = "";
            if(response.talent_scout.length > 0){
             $.each(response.talent_scout,function(item,value){        
                   tbody +='<tr><td class="text-capitalize">'+ value['server_name'] +'</td>';
                               tbody +='<td>'+ value['restaurant_name'] +'</td>';
                               tbody +='<td>'+ value['total_referals'] +'</td></tr>';     
              });                                                                                             
            }
            tbody +='<tr class="tableFooter">';
                 tbody +='<td>You</td>';
                 tbody +='<td class="dinaDevistd text-capitalize"><small>Customer name: '+response.server_details.yearwise_friends['server_name']+'</small><br></td>';
                 tbody +='<td>'+response.server_details.yearwise_friends['total_referals']+'</td></tr>';
            $('#leader-scout').empty().append(tbody);
            var tbody = "";
            if(response.king_maker.length > 0){
             $.each(response.king_maker,function(item,value){        
                   tbody +='<tr><td class="text-capitalize">'+ value['server_name'] +'</td>';
                               tbody +='<td>'+ value['restaurant_name'] +'</td>';
                               tbody +='<td>'+ value['total_points'] +'</td></tr>';     
              });                                                                                             
            }
            tbody +='<tr class="tableFooter">';
                 tbody +='<td>You</td>';
                 tbody +='<td class="dinaDevistd text-capitalize"><small>Customer name: '+response.server_details.yearwise_points['server_name']+'</small><br></td>';
                 tbody +='<td>'+response.server_details.yearwise_points['total_points']+'</td></tr>';
            $('#leader-king').empty().append(tbody);
            var sstar = "";
            var sster = "";
            var lhero = "";
            var tscout = "";
            var kmaker = "";
            if(response.past_winners.length > 0){
             $.each(response.past_winners,function(item,value){        
                   if(value['reward'] == 'superstar'){
                      sstar +='<tr><td class="text-capitalize" class="col-xs-6">'+ value['server_name'] +'</td>';
                      sstar +='<td class="col-xs-2">'+ value['earning'] +'</td>';
                      sstar +='<td class="col-xs-4">'+ value['created_at'] +'</td></tr>';
                   }
                   if(value['reward'] == 'speedster'){
                      sster +='<tr><td class="text-capitalize" class="col-xs-6">'+ value['server_name'] +'</td>';
                      sster +='<td class="col-xs-2">'+ value['earning'] +'</td>';
                      sster +='<td class="col-xs-4">'+ value['created_at'] +'</td></tr>';
                   }
                   if(value['reward'] == 'local_hero'){
                      lhero +='<tr><td class="text-capitalize" class="col-xs-6">'+ value['server_name'] +'</td>';
                      lhero +='<td class="col-xs-2">'+ value['earning'] +'</td>';
                      lhero +='<td class="col-xs-4">'+ value['created_at'] +'</td></tr>';
                   }
                   if(value['reward'] == 'talent_scout'){
                      tscout +='<tr><td class="text-capitalize" class="col-xs-6">'+ value['server_name'] +'</td>';
                      tscout +='<td class="col-xs-2">'+ value['earning'] +'</td>';
                      tscout +='<td class="col-xs-4">'+ value['created_at'] +'</td></tr>';
                   }
                   if(value['reward'] == 'king_maker'){
                      kmaker +='<tr><td class="text-capitalize" class="col-xs-6">'+ value['server_name'] +'</td>';
                      kmaker +='<td class="col-xs-2">'+ value['earning'] +'<sup>PTS</sup></td>';
                      kmaker +='<td class="col-xs-4">'+ value['created_at'] +'</td></tr>';
                   }
              });                                                                                                  
            }
            sstar +='<tr class="tableFooter"><td colspan="3">You reached 0 at the end of the competition.</td></tr>';
            sstar +='</table></div>';
            sster +='<tr class="tableFooter"><td colspan="3">You reached 0 at the end of the competition.</td></tr>';
            sster +='</table></div>';
            lhero +='<tr class="tableFooter"><td colspan="3">You reached 0 at the end of the competition.</td></tr>';
            lhero +='</table></div>';
            tscout +='<tr class="tableFooter"><td colspan="3">You reached 0 at the end of the competition.</td></tr>';
            tscout +='</table></div>';
            kmaker +='<tr class="tableFooter"><td colspan="3">You reached 0 at the end of the competition.</td></tr>';
            kmaker +='</table></div>';
            $('#super-star').empty().append(sstar);
            $('#speed-ster').empty().append(sster);
            $('#local-hero').empty().append(lhero);
            $('#talent-scout').empty().append(tscout);
            $('#king-maker').empty().append(kmaker);
        },
        error: function() {}
    });
}
