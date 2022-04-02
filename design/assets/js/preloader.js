/*
 * nPreLoader - jQuery plugin
 * www.nazmul.me
 */
! function (n) {
    var e = new Array,
        t = new Array,
        o = function () {},
        i = 0,
        a = {
            splashVPos: "35%",
            loaderVPos: "50%",
            splashID: "#npreContent",
            showSplash: !0,
            showPercentage: !0,
            autoClose: !0,
            closeBtnText: "Start!",
            onetimeLoad: 1,
            debugMode: !1,
            splashFunction: function () {}
        },
        r = function (e) {
            var o = new Image;
            n(o).load(function () {
                d()
            }).error(function () {
                t.push(n(this).attr("src")), d()
            }).attr("src", e)
        },
        d = function () {
            i++;
            var t = Math.round(i / e.length * 100);
            if (n(nBar).stop().animate({
                    width: t + "%"
                }, 200, "linear"), a.showPercentage && n(nPer).text(t + "%"), i >= e.length) {
                if (i = e.length, function (n) {
                        if (a.onetimeLoad) {
                            var e = new Date;
                            e.setDate(e.getDate() + n);
                            var t = null == n ? "" : "expires=" + e.toUTCString();
                            document.cookie = "npreLoader=loaded; " + t
                        }
                    }(), a.showPercentage && n(nPer).text("100%"), a.debugMode) h();
                n(nBar).stop().animate({
                    width: "100%"
                }, 500, "linear", function () {
                    a.autoClose ? s() : n(nButton).fadeIn(500)
                })
            }
        },
        s = function () {
            n(nOverlay).fadeOut(500, function () {
                n(nOverlay).remove(), o()
            })
        },
        h = function () {
            if (t.length > 0) {
                t.length + " image files cound not be found. \n\r", "Please check your image paths and filenames:\n\r";
                for (var n = 0; n < t.length; n++) "- " + t[n] + "\n\r";
                return !0
            }
            return !1
        };
    n.fn.npreLoader = function (t, i) {
        return t && n.extend(a, t), "function" == typeof i && (o = i), n("body").css({
            display: "block"
        }), this.each(function () {
            ! function () {
                if (a.onetimeLoad) {
                    for (var n, e = document.cookie.split("; "), t = 0; n = e[t] && e[t].split("="); t++)
                        if ("npreLoader" === n.shift()) return n.join("=");
                    return !1
                }
                return !1
            }() ? (function () {
                if (nOverlay = n("<div></div>").attr("id", "npreOverlay").css({
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: 9999999
                    }).appendTo("body"), a.showSplash) {
                    nContent = n("<div></div>").attr("id", "npreSlide").appendTo(nOverlay);
                    var e = n(window).width() - n(nContent).width();
                    n(nContent).css({
                        position: "absolute",
                        top: a.splashVPos,
                        left: Math.round(50 / n(window).width() * e) + "%"
                    }), n(nContent).html(n(a.splashID).wrap("<div/>").parent().html()), n(a.splashID).remove(), a.splashFunction()
                }
                nLoader = n("<div></div>").attr("id", "npreLoader").appendTo(nOverlay);
                var t = n(window).width() - n(nLoader).width();
                n(nLoader).css({
                    position: "absolute",
                    top: a.loaderVPos,
                    left: Math.round(50 / n(window).width() * t) + "%"
                }), nBar = n("<div></div>").attr("id", "npreBar").css({
                    width: "0%",
                    height: "100%"
                }).appendTo(nLoader), a.showPercentage && (nPer = n("<div></div>").attr("id", "nprePercentage").css({
                    position: "relative",
                    height: "100%"
                }).appendTo(nLoader).html("Loading...")), a.autoclose || (nButton = n("<div></div>").attr("id", "npreButton").on("click", function () {
                    s()
                }).css({
                    position: "relative",
                    height: "100%"
                }).appendTo(nLoader).text(a.closeBtnText).hide())
            }(), n(this).find("*:not(script)").each(function () {
                var t = "";
                if (-1 == n(this).css("background-image").indexOf("none") && -1 == n(this).css("background-image").indexOf("-gradient")) {
                    if (-1 != (t = n(this).css("background-image")).indexOf("url")) {
                        var o = t.match(/url\((.*?)\)/);
                        t = o[1].replace(/\"/g, "")
                    }
                } else "img" == n(this).get(0).nodeName.toLowerCase() && void 0 !== n(this).attr("src") && (t = n(this).attr("src"));
                t.length > 0 && e.push(t)
            }), function () {
                for (var n = 0; n < e.length; n++) r(e[n])
            }()) : (n(a.splashID).remove(), o())
        })
    }
}(jQuery);