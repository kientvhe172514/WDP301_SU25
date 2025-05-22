
export const orderContant = {
    delivery: {
        fast: "FAST",
        gojek: "GO_JEK",
    },
    payment: {
        later_money: "Thanh toán tiền mặt khi nhận hàng",
        paypal: "Thanh toán tiền bằng paypal",
    },
};



export const isJsonString = (data) => {
    try {
        JSON.parse(data);
    } catch (error) {
        return false;
    }
    return true;
};

export const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

export const renderOptions = (arr) => {
    let result = [];
    if (arr) {
        result = arr?.map((opt) => {
            return {
                value: opt,
                label: opt,
            };
        });
    }
    result.push({
        label: "Thêm type",
        value: "add_type",
    });
    return result;
};

export const convertPrice = (price) => {
    try {
        const result = price.toLocaleString().replaceAll(",", ".");
        return `${result} `;
    } catch (error) {
        return null;
    }
};

export const initFacebookSDK = () => {
    const locale = "vi_VN";

    return new Promise((resolve) => {
        // Load the Facebook SDK asynchronously
        (function (d, s, id) {
            let js,
                fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);
            js.id = id;
            js.src = `https://connect.facebook.net/${locale}/sdk.js`;
            fjs.parentNode.insertBefore(js, fjs);
        })(document, "script", "facebook-jssdk");

        // Initialize SDK once it's loaded
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: process.env.REACT_APP_FB_ID, // Replace with your app ID
                cookie: true,
                xfbml: true,
                version: "v17.0",
            });

            console.log("Facebook SDK initialized");
            resolve();
        };
    });
};

// export const converDataChart = (data, type) => {
//     try {
//         const object = {};
//         Array.isArray(data) &&
//             data.forEach((opt) => {
//                 console.log("Current type:", type, "Value:", opt[type]);

//                 console.log("opt:", opt, type);
//                 console.log(
//                     "paymentMethod:",
//                     opt["paymentMethod"],
//                     object[opt["paymentMethod"]]
//                 );
//                 if (!object[opt[type]]) {
//                     object[opt[type]] = 1;
//                 } else {
//                     object[opt[type]] += 1;
//                     console.log(
//                         "getBase64",
//                         object[opt[type]],
//                         typeof object[opt[type]]
//                     );
//                 }
//             });
//         console.log("object:", object);
//         const result =
//             Array.isArray(Object.keys(object)) &&
//             Object.keys(object).map((item) => {
//                 return {
//                     name: orderContant.payment[item] || item,
//                     value: object[item],
//                 };
//             });
//         console.log("result: ", result);
//         return result;
//     } catch (error) {
//         console.error("Error in converDataChart:", error);
//         return [];
//     }
// };

export const convertDataChart = (data, type) => {
    try {
        const object = {};
        Array.isArray(data) &&
            data.forEach((opt) => {
                if (!object[opt[type]]) {
                    object[opt[type]] = 1;
                } else {
                    object[opt[type]] += 1;
                    console.log(
                        "c;getBase64",
                        object[opt[type]],
                        typeof object[opt[type]]
                    );
                }
            });
        const results =
            Array.isArray(Object.keys(object)) &&
            Object.keys(object).map((item) => {
                return {
                    name: orderContant.payment[item],
                    value: object[item],
                };
            });
        return results;
    } catch (e) {
        return [];
    }
};
