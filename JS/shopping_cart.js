let cart = [];                                                 //商品資訊array
let lastSentTime = 0;                                          //記錄上次發送 Email 的時間


//加入商品,商品的name、price為參數
function addToCart(name, price) {            
    price = parseFloat(price);                                 //讓price變成float

    if (isNaN(price)) {
        console.error(`價格轉換失敗: ${price}`);
        return;                                                //若price 不是數字，則不加入購物車
    }                 
    let item = cart.find(item => item.name === name);          //使用find檢查有沒有相同名稱         
    if (item) {
        item.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    saveCartToStorage();
    updateCart();
}

//將購物車資料存到localStorage，避免跳轉頁面資料消失
function saveCartToStorage() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

//移除商品
function removeFromCart(name) {                               
    cart = cart.filter(item => item.name !== name);            //filter篩選
    saveCartToStorage();
    updateCart();
}

let selectedItem = { name: "", price: 0 };                    //初始化存取點擊商品的變數

//讓使用者刷新頁面不會遺失購物車資料
function loadCartFromStorage() {
    let storedCart = localStorage.getItem("cart");
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
}

//即時更新購物車資料
document.addEventListener("DOMContentLoaded", function() {
    loadCartFromStorage();                                    // 載入購物車內容
    updateCart();                                             // 更新畫面
});

//用來讀取div的onclick及資料
document.addEventListener("DOMContentLoaded", function() {    //DOMContentLoaded = 讓HTML先解析完再執行才讀的到menuItems
    let menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach(item => {
        item.addEventListener("click", function() {
            let name = item.querySelector("h3").innerText;
            let priceText = item.querySelector(".amount").innerText.trim();
            let price = Number(priceText);                    //確保 price 是數字

            if (isNaN(price)) {
                console.error(`讀取價格錯誤: ${priceText}`);
                return;
            }

            openModal(name, price);
        });
    });
});

//顯示彈出確認提示視窗(modal)
function openModal(name, price) {
    selectedItem.name = name;
    selectedItem.price = price;
    document.getElementById("modal-title").innerText = `是否將 ${name} 加入購物車？`;     //動態更新標題
    document.getElementById("modal").style.display = "block";                           //把Modal設成block
    document.getElementById("overlay").style.display = "block";                         //半透明背景
}

//關閉確認提示視窗(modal)
function closeModal() {
    document.getElementById("modal").style.display = "none";                            //把Modal設成none
    document.getElementById("overlay").style.display = "none";                          //隱藏背景
}

//使用者確認將商品加入購物車後關閉確認提示視窗並將商品加入購物車。
function addToCartConfirmed() {
    closeModal();
    addToCart(selectedItem.name, selectedItem.price);                                   //呼叫addToCart
}

//更新購物車畫面及計算總金額
function updateCart() {                                        
    let cartItems = document.getElementById("cart-items"); 
    let totalPrice = document.getElementById("total-price");
    cartItems.innerHTML = "";                              // 清空購物車內容

    let total = 0;                                         //初始化金額
    cart.forEach(item => {                                 //使用forEach讀取購物車所有商品
        let cartItem = document.createElement("div");      //建立一個div來存放商品資訊
        cartItem.classList.add("cart-item");               //將div樣式套用為cart-item
        //設定 cartItem 內的 HTML：顯示順序：名稱→數量→總價(單價*數量)→刪除按鈕(調用removeFromCart)
            cartItem.innerHTML = `                                                        
            <span>${item.name} x ${item.quantity}</span>
            <span>$${item.price * item.quantity}</span>
            <button onclick="removeFromCart('${item.name}')">刪除</button>
        `;
        cartItems.appendChild(cartItem);                    //將div新增到cart-items裡,進而顯示在頁面
        total += item.price * item.quantity;                //計算總金額到total變數
    });

    totalPrice.textContent = total;                         //將total顯示在頁面
}

//顯示購物車內容的視窗
function openCart() {
    let cartItemsList = document.getElementById("cart-items-list");
    let cartTotal = document.getElementById("cart-total");
    cartItemsList.innerHTML = ""; // 清空購物車內容

    let total = 0;

    if (cart.length === 0) {
        cartItemsList.innerHTML = "<p>購物車是空的。</p>";
    } else {
        cart.forEach(item => {
            let cartItem = document.createElement("div");
            cartItem.innerHTML = `${item.name} x ${item.quantity} - $${item.price * item.quantity}`;
            cartItemsList.appendChild(cartItem);
            total += item.price * item.quantity;
        });
    }

    cartTotal.innerText = total;

    document.getElementById("cart-modal").style.display = "block";
    document.getElementById("cart-overlay").style.display = "block";
}

//關閉購物車內容的視窗
function closeCart() {
    document.getElementById("cart-modal").style.display = "none";
    document.getElementById("cart-overlay").style.display = "none";
}

//清空購物車
function clearCart() {
    cart = [];
    localStorage.removeItem("cart");
    document.getElementById("cart-items-list").innerHTML = "<p>購物車是空的。</p>";
    document.getElementById("cart-total").innerText = "0";
    updateCart();
}

// 打開 Email 輸入視窗
function openEmailPrompt() {
    document.getElementById("email-modal").style.display = "block";
    document.getElementById("email-overlay").style.display = "block";
    closeCart()
}

// 關閉 Email 視窗
function closeEmailModal() {
    document.getElementById("email-modal").style.display = "none";
    document.getElementById("email-overlay").style.display = "none";
}

//使用者Email輸入視窗
function submitEmail() {
    let userEmail = document.getElementById("user-email").value.trim();

    if (!validateEmail(userEmail)) {
        alert("請輸入有效的電子郵件地址！");
        return;
    }

    sendOrderEmail(userEmail);
    closeEmailModal();
    closeCart();
}

//判定使用者Email格式是否輸入正確
function validateEmail(email) {
    let re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

//發送Email
function sendOrderEmail(userEmail, sendButton) {
    let currentTime = Date.now();                          //取得當前時間（毫秒）

    //如果距離上次執行少於 10 秒，不執行sendOrderEmail
    if (currentTime - lastSentTime < 10000) {
        alert("請稍候 10 秒後再送出訂單！");
        return;
    }

    lastSentTime = currentTime;                            //更新最後發送時間

    if (cart.length === 0) {
        alert("購物車是空的，無法送出訂單！");
        return;
    }


    let orderDetails = cart.map(item => `${item.name} x ${item.quantity} - $${item.price * item.quantity}`).join("\n");
    let totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let emailParams = {
        to_email: userEmail,
        order_details: orderDetails,
        total_price: `$${totalPrice.toFixed(2)}`
    };

    emailjs.send("service_982glau", "template_30k2nzc", emailParams)
        .then(response => {
            alert("訂單確認信已發送至 " + userEmail);
            clearCart();
        })
        .catch(error => {
            console.error("Email 發送錯誤: ", error);
            lastSentTime = 0;                              //如果發送失敗，允許再次發送
        });
}


// 確保 DOM 加載後執行
document.addEventListener("DOMContentLoaded", function() {
    console.log("shopping_cart.js 已成功載入！");
});
