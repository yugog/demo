/**
 * WkEpg更新升级整理
 * version:2.0
 * LastModified in 2017/04/21
 * Update in 2017/04/19 by xmw
 * pageobj必须在页面初始化出来，且为window对象
 * AreaCreator 区域创建器
 * PageCreator 页面创建器
 * PageObj 页面类
 * Area 区域类
 * DomData Dom类
 * Player 播放器类
 * Util 工具类
 * Nav 导航类
 **/
(function (window) {
    if (!(typeof(window["WkEpg"]) === "object" && window["WkEpg"] !== undefined)) window["WkEpg"] = {};
    window["WkEpg"].AreaCreator = function (numrow, numcolum, directions, domsidstring, domsfocusstyle, domsunfocusstyle) {
        var doms = [];
        if (domsfocusstyle !== undefined && !(domsfocusstyle.constructor === Array)) domsfocusstyle = new Array(domsfocusstyle);

        if (domsunfocusstyle !== undefined && !(domsunfocusstyle.constructor === Array)) domsunfocusstyle = new Array(domsunfocusstyle);

        for (var i = 0; i < numrow * numcolum; i++) {
            doms[i] = new window["WkEpg"].DomData(domsidstring + i, domsfocusstyle, domsunfocusstyle);
        }
        return new window["WkEpg"].Area(numrow, numcolum, doms, directions);
    };

    window["WkEpg"].PageCreator = function (curareaid, index, areas) {
        var temppageobj = new window["WkEpg"].PageObj(curareaid, index, areas);
        if (curareaid !== undefined && index !== undefined && areas !== undefined) {
            temppageobj.areas[curareaid].changefocus(index, true);
            temppageobj.curareaid = curareaid;
        }
        window['WkEpg'].pageobj = temppageobj;
        return temppageobj;
    };

    window["WkEpg"].PageObj = function (curareaid, index, areas) {
        /**
         * 新增 pageobjTurnPageFun ：自定义滚动效果（辽宁index.html、门户3.0的主屏滚动）
         * 新增 pageobjMoveFun ：自定义翻页样式（）
         **/
        this.pageobjTurnPageFun = undefined;
        this.pageobjMoveFun     = undefined;

        this.curareaid = curareaid;
        this.areas = areas;
        this.curdirindex = undefined;
        this.mp = undefined;
        this.pageOkEvent = undefined;
        if (this.areas !== undefined) {
            for (var i = 0; i < this.areas.length; i++) {
                this.areas[i].id = i;
                this.areas[i].pageobj = this;
            }
        }
        this.pageTurn = function (num, areaid) {
            if (this.areas !== undefined) this.areas[areaid === undefined ? this.curareaid : areaid].pageturn(num, areaid);
        };
        this.ok = function () {
            if (!!this.pageOkEvent) this.pageOkEvent();
            if (this.areas !== undefined) this.areas[this.curareaid].ok();
        };
        this.getfocusdom = function () {
            if (this.areas !== undefined) return this.areas[this.curareaid].doms[this.areas[this.curareaid].curindex];
        };
        this.getfocusindex = function () {
            if (this.areas !== undefined) return this.areas[this.curareaid].curindex;
        };
        this.changefocus = function (areaid, index) {
            if (this.areas !== undefined) for (i = 0; i < this.areas.length; i++) {
                this.areas[i].clearfocus();
                if (i === areaid) this.areas[i].changefocus(index, true);
                this.curareaid = areaid;
            }
        };
        this.move = function (dir) {
            var cross;
            var isemptydom = false;
            if (this.curareaid === undefined || this.areas === undefined) {
                return false;
            }
            var tempcurarea = this.areas[this.curareaid];
            var tempAreaEndTurnPageFlag = true;
            if (typeof(tempcurarea.areaEndTurnPage) !== "undefined") {
                tempAreaEndTurnPageFlag = tempcurarea.areaEndTurnPage[dir];
            }

            var num = (dir === 0 || dir === 1 ? -1 : 1);
            var dirindex = dir;

            if (!!this.pageobjTurnPageFun){
                // dirindex
                this.pageobjTurnPageFun(dirindex)
            }
            if (!!this.pageobjMoveFun){
                // dirindex
                this.pageobjMoveFun(dirindex)
            }

            this.curdirindex = dir;
            var tmpnextindex = null;
            if (dirindex === 0 || dirindex === 2) {
                var currow = null;
                if (tempcurarea.columnsort) { /*按列排序*/
                    currow = tempcurarea.curindex % tempcurarea.numrow;
                    if (num > 0) cross = (currow + num) > tempcurarea.numrow - 1;
                    else cross = (currow + num) < 0;
                    if (!cross) {
                        if (tempcurarea.datanum !== undefined) {
                            tmpnextindex = tempcurarea.curindex + num;
                            if (tmpnextindex > tempcurarea.datanum - 1) {
                                cross = true;
                                isemptydom = true;
                            }
                        }
                    }
                    if (tempcurarea.circledir === 1) return tempcurarea.insidemove(true, dirindex, num, cross);
                } else { /*按行排序*/
                    currow = parseInt(tempcurarea.curindex / tempcurarea.numcolum);
                    if (num > 0) cross = (currow + num) > tempcurarea.numrow - 1;
                    else cross = (currow + num) < 0;
                    if (!cross) {
                        if (tempcurarea.datanum !== undefined) {
                            tmpnextindex = tempcurarea.curindex + num * tempcurarea.numcolum;
                            if (tmpnextindex > tempcurarea.datanum - 1) {
                                cross = true;
                                isemptydom = true;
                            }
                        }
                    }
                    if (tempcurarea.circledir === 0) return tempcurarea.insidemove(true, dirindex, num, cross);
                }
            } else if (dirindex === 1 || dirindex === 3) {
                var curcolum = null;
                if (tempcurarea.columnsort) { /*按列排序*/
                    curcolum = parseInt(tempcurarea.curindex / tempcurarea.numrow);
                    if (num > 0) cross = (curcolum + num) > tempcurarea.numcolum - 1;
                    else cross = (curcolum + num) < 0;
                    if (!cross) {
                        if (tempcurarea.datanum !== undefined) {
                            tmpnextindex = tempcurarea.curindex + num * tempcurarea.numrow;
                            if (tmpnextindex > tempcurarea.datanum - 1) {
                                cross = true;
                                isemptydom = true;
                            }
                        }
                    }
                    if (tempcurarea.circledir === 0) return tempcurarea.insidemove(true, dirindex, num, cross);
                } else { /*按行排序*/
                    curcolum = tempcurarea.curindex % tempcurarea.numcolum;
                    if (num > 0) cross = (curcolum + num) > tempcurarea.numcolum - 1;
                    else cross = (curcolum + num) < 0;
                    if (!cross) {
                        if (tempcurarea.datanum !== undefined) {
                            tmpnextindex = tempcurarea.curindex + num;
                            if (tmpnextindex > tempcurarea.datanum - 1) {
                                cross = true;
                                isemptydom = true;
                            }
                        }
                    }
                    if (tempcurarea.circledir === 1) return tempcurarea.insidemove(true, dirindex, num, cross);
                }
            }
            if (cross) {
                if (tempcurarea.endwiseCrossturnpage && tempAreaEndTurnPageFlag && (dirindex === 0 || dirindex === 2) && ((dirindex === 0 && tempcurarea.curpage > 1) || tempcurarea.cirturnpage || (dirindex === 2 && tempcurarea.curpage < tempcurarea.pagecount))) {

                    if (!!tempcurarea.areaCorssEvent) {
                        if (!tempcurarea.areaCorssEvent()) {
                            return false;
                        }
                    }

                    if (tempcurarea.pagecount === 1) return -1;
                    if (dirindex === 0) tempcurarea.pageturn(-1);
                    else if (dirindex === 2) tempcurarea.pageturn(1);
                    return -1;
                } else if (tempcurarea.broadwiseCrossturnpage && tempAreaEndTurnPageFlag && (dirindex === 1 || dirindex === 3) && ((dirindex === 1 && tempcurarea.curpage > 1) || tempcurarea.cirturnpage || (dirindex === 3 && tempcurarea.curpage < tempcurarea.pagecount))) {

                    if (!!tempcurarea.areaCorssEvent) {
                        if (!tempcurarea.areaCorssEvent()) {
                            return false;
                        }
                    }

                    if (tempcurarea.pagecount === 1) return -1;
                    if (dirindex === 1) tempcurarea.pageturn(-1);
                    else if (dirindex === 3) tempcurarea.pageturn(1);
                    return -1;
                } else {
                    if (tempcurarea.directions[dirindex] !== -1) {
                        if (this.areas[tempcurarea.directions[dirindex]].lockin || (this.areas[tempcurarea.directions[dirindex]].datanum !== undefined && this.areas[tempcurarea.directions[dirindex]].datanum <= 0)) return -1;

                        var tempresult = tempcurarea.areaout(tempcurarea.curindex, dirindex);
                        if (!tempresult) return;
                        var tmpstable = 0;
                        var tmpstablearea = parseInt(tempcurarea.directions[dirindex]);
                        if (tempcurarea.stablemoveindex !== undefined && tempcurarea.stablemoveindex[dirindex] !== -1) {
                            var tmpmoveindex = tempcurarea.stablemoveindex[dirindex].split(',');
                            if (isemptydom) {
                                if (dirindex === 2) {
                                    var lastcolumindex = (tempcurarea.numrow - 1) * tempcurarea.numcolum;
                                    var tmpcolum = tempcurarea.curindex % tempcurarea.numcolum;
                                    stableindex = lastcolumindex + tmpcolum;
                                } else if (dirindex === 3) {
                                    var tmprow = parseInt((tempcurarea.curindex + 1) / tempcurarea.numcolum);
                                    stableindex = (tmprow + 1) * tempcurarea.numcolum - 1;
                                }
                            } else {
                                stableindex = tempcurarea.curindex;
                            }
                            for (var k = 0; k < tmpmoveindex.length; k++) {
                                var tmp = tmpmoveindex[k].split('-');
                                if (parseInt(tmp[0]) === stableindex) {
                                    if (tmp[1].indexOf('>') === -1) tmpstable = parseInt(tmp[1]);
                                    else {
                                        tmpstablearea = parseInt(tmp[1].split('>')[0]);
                                        tmpstable = parseInt(tmp[1].split('>')[1]);
                                    }
                                    break;
                                }
                            }
                        }
                        if (!!this.areas[tmpstablearea].doms[tmpstable]) {
                            this.areas[tmpstablearea].areain(tmpstable, dirindex);
                        } else {/*如果不存在直接跳到下一个区域,使用当前区域的tempcurarea*/
                            var nextAreaStation = tempcurarea.doms[tempcurarea.curindex].nextAreaStation;
                            if (!!nextAreaStation) {
                                this.areas[parseInt(nextAreaStation.split('>')[0])].areain(parseInt(nextAreaStation.split('>')[1]), dirindex);
                            }
                        }
                    }
                }
            } else {
                return tempcurarea.insidemove(false, dirindex, num);
            }
        };
    };

    window["WkEpg"].Area = function (numrow, numcolum, doms, directions) {
        this.datanum = undefined;
        /*当前页面数据长度*/
        this.curindex = 0;
        this.doms = doms;
        this.stablemoveindex = undefined;
        this.curpage = 1;
        this.pagecount = 1;
        this.lock = false;
        this.areaInBeforeEvent = undefined;
        this.areaInAfterEvent = undefined;
        this.areaOutBeforeEvent = undefined;
        this.areaOutAfterEvent = undefined;
        this.stayindexarray = [0, 0, 0, 0];
        this.staydirarray = [false, false, false, false];
        this.staystylearray = [];
        this.id = undefined;
        this.numrow = numrow;
        this.numcolum = numcolum;
        this.circledir = undefined;
        this.cirturnpage = false;
        this.directions = directions;
        this.pageobj = undefined;
        this.areaPageTurnEvent = undefined;
        this.changefocusBeforeEvent = undefined;
        this.changefocusAfterEvent = undefined;
        this.changeunfocusBeforeEvent = undefined;
        this.changeunfocusAfterEvent = undefined;
        /*默认按行排序*/
        this.columnsort = false;
        this.directionsallow = [this.directions[0] !== -1, this.directions[1] !== -1, this.directions[2] !== -1, this.directions[3] !== -1];
        this.endwiseCrossturnpage = false;
        this.broadwiseCrossturnpage = false;

        this.areaEndTurnPage = undefined;
        this.areaCorssEvent = undefined;
        this.areaStayInitFocus = false;
        this.pageTurnFlag = 0;
        this.focusfirst = false;
        this.darkfocusstyle = undefined;
        this.darkunfocusstyle = undefined;
        this.darkPage = undefined;
        this.darkIndex = undefined;
        this.rightEVENT = undefined;
        this.leftEVENT = undefined;
        this.upEVENT = undefined;
        this.downEVENT = undefined;
        this.areaOkEvent = undefined;
        this.areaOkAfterEventLock = false;//add 2017.05.08 by xmw.(默认执行areaOkAfterEvent)
        this.areaOkAfterEvent = undefined;//add 2017.05.05 by xmw.
        this.upFlag = false;
        this.rightFlag = false;
        this.leftFlag = false;
        this.downFlag = false;
        this.nextAreaArray = undefined;

        for (var i = 0; i < this.doms.length; i++) {
            this.doms[i].id = i;
            this.doms[i].area = this;
        }
        this.setDarkfocus = function (darkPage, darkIndex, darkfocusstyle, darkunfocusstyle) {
            this.darkPage = darkPage;
            this.darkIndex = darkIndex;

            if (darkfocusstyle !== undefined && !(darkfocusstyle.constructor === Array)) darkfocusstyle = new Array(darkfocusstyle);
            if (darkunfocusstyle !== undefined && !(darkunfocusstyle.constructor === Array)) darkunfocusstyle = new Array(darkunfocusstyle);

            this.darkfocusstyle = darkfocusstyle;
            this.darkunfocusstyle = darkunfocusstyle;
            this.doms[darkIndex].focusstyle = darkfocusstyle;
            this.doms[darkIndex].unfocusstyle = darkunfocusstyle;

            if (this.pageobj.curareaid === this.id && this.curindex === this.darkIndex) {
                this.doms[darkIndex].changestyle(this.darkfocusstyle);
            } else {
                this.doms[darkIndex].changestyle(this.darkunfocusstyle);
            }
        };
        this.changeDarkFocus = function () {
            for (var i = 0; i < this.doms.length; i++) { /*暗焦点*/
                if (this.curpage === this.darkPage && i === this.darkIndex) {
                    if (i === this.curindex) {
                        this.doms[i].changestyle(this.darkfocusstyle);
                    } else {
                        this.doms[i].changestyle(this.darkunfocusstyle);
                    }
                    this.doms[i].focusstyle = this.darkfocusstyle;
                    this.doms[i].unfocusstyle = this.darkunfocusstyle;
                } else {
                    this.doms[i].changestyle(this.doms[i].tempunfocusstyle);
                    this.doms[i].focusstyle = this.doms[i].tempfocusstyle;
                    this.doms[i].unfocusstyle = this.doms[i].tempunfocusstyle;
                }
            }
        };
        this.pageTurnAndChangeFocus = function () {
            if (this.pageTurnFlag !== 0) {
                var num = this.pageTurnFlag;
                if (this.endwiseCrossturnpage) { /*纵向翻页*/
                    this.changefocus(this.curindex, false);
                    if (num > 0) {
                        if (this.datanum < this.curindex % this.numcolum + 1) { /*如果取数之后的数据总数比当前的焦点位置小*/
                            /*聚焦到最后一个*/
                            this.changefocus(this.datanum - 1, true);
                        } else {
                            /*聚焦到第一行的当前位置*/
                            this.changefocus(this.curindex % this.numcolum, true);
                        }
                    } else {
                        if ((this.datanum - 1) % this.numcolum < this.curindex % this.numcolum) { /*如果上一页最后一行的位置比当前的焦点位置小*/
                            /*聚焦到最后一个*/
                            this.changefocus(this.datanum - 1, true);
                        } else {
                            /*聚焦到最后一行的当前位置*/
                            this.changefocus((Math.ceil(this.datanum / this.numcolum) - 1) * this.numcolum + this.curindex % this.numcolum, true);
                        }
                    }
                } else if (this.broadwiseCrossturnpage) { /*横向翻页*/
                    this.changefocus(this.curindex, false);
                    /*当前行*/
                    var curcolumn = Math.ceil((this.curindex + 1) / this.numcolum);
                    /*翻页后的行数*/
                    var gocolumn = Math.ceil(this.datanum / this.numcolum);
                    if (num > 0) {
                        if (gocolumn < curcolumn) {
                            /*聚焦最后一行的第一个*/
                            this.changefocus((gocolumn - 1) * this.numcolum, true);
                        } else {
                            /*聚焦当前行的第一个*/
                            this.changefocus((curcolumn - 1) * this.numcolum, true);
                        }
                    } else {
                        if (gocolumn <= curcolumn) {
                            /*聚焦最后一行的最后一个*/
                            this.changefocus(this.datanum - 1, true);
                        } else {
                            /*聚焦当前行的最后一个*/
                            this.changefocus(curcolumn * this.numcolum - 1, true);
                        }
                    }
                }
            }
        };
        this.changefocus = function (index, focusornot) {
            if (!!this.changefocusBeforeEvent) {
                if (focusornot) {
                    if (this.changefocusBeforeEvent()) return;
                }
            }
            if (!!this.changeunfocusBeforeEvent) {
                if (!focusornot) {
                    if (this.changeunfocusBeforeEvent()) return;
                }
            }
            this.curindex = index;
            if (!!this.doms[index]) {
                this.doms[index].changefocus(focusornot);
            }
            if (!!this.changefocusAfterEvent) {
                if (focusornot) {
                    if (this.changefocusAfterEvent()) return;
                }
            }
            if (!!this.changeunfocusAfterEvent) {
                if (!focusornot) {
                    if (this.changeunfocusAfterEvent()) return;
                }
            }
        };
        this.setfocuscircle = function (circledir) {
            this.circledir = circledir;
        };
        this.insidemove = function (circle, dirindex, num, cross) {
            this.changefocus(this.curindex, false);
            var nextindex;
            if (this.columnsort) {/*按列排序*/
                if (dirindex === 1 || dirindex === 3) nextindex = !circle ? (this.curindex + num * this.numrow) : (num > 0 ? (cross ? (this.curindex - (this.numcolum - 1) * this.numrow) : (this.curindex + num * this.numrow)) : (cross ? (this.curindex + (this.numcolum - 1) * this.numrow) : (this.curindex + num * this.numrow)));
                else nextindex = !circle ? (this.curindex + num) : (num > 0 ? (cross ? (this.curindex - this.numrow + 1) : (this.curindex + num)) : (cross ? (this.curindex + this.numrow - 1) : (this.curindex + num)));
            } else {/*按行排序*/
                if (dirindex === 0 || dirindex === 2) nextindex = !circle ? (this.curindex + num * this.numcolum) : (num > 0 ? (cross ? (this.curindex - (this.numrow - 1) * this.numcolum) : (this.curindex + num * this.numcolum)) : (cross ? (this.curindex + (this.numrow - 1) * this.numcolum) : (this.curindex + num * this.numcolum)));
                else nextindex = !circle ? (this.curindex + num) : (num > 0 ? (cross ? (this.curindex - this.numcolum + 1) : (this.curindex + num)) : (cross ? (this.curindex + this.numcolum - 1) : (this.curindex + num)));
            }
            this.changefocus(nextindex, true);
            this.curindex = nextindex;
            return -1;
        };
        this.changtop = function () {

        };
        this.getid = function () {
            return this.id;
        };
        this.clearfocus = function () {
            this.changefocus(this.curindex, false);
            this.curindex = 0;
        };
        this.setendwiseCrossturnpage = function (tempvalue) {
            this.endwiseCrossturnpage = tempvalue;
        };
        this.setbroadwiseCrossturnpage = function (tempvalue) {
            this.broadwiseCrossturnpage = tempvalue;
        };
        this.ok = function () {
            if (this.areaOkEvent !== undefined) this.areaOkEvent();
            if (this.darkfocusstyle !== undefined && this.darkunfocusstyle !== undefined) {
                this.darkIndex = this.curindex;
                this.darkPage = this.curpage;
                this.changeDarkFocus();
            }
            if (!this.areaOkAfterEventLock && this.areaOkAfterEvent !== undefined) this.areaOkAfterEvent();
            this.doms[this.curindex].ok();
        };
        this.areain = function (stableindex, dir) {
            if (!!this.areaInBeforeEvent) {
                if (this.areaInBeforeEvent()) {
                    return true;
                }
            }
            this.pageobj.curareaid = this.id;
            var tmpindex = stableindex;
            if (stableindex !== undefined) {
                if (this.datanum !== undefined && stableindex > this.datanum - 1) {
                    tmpindex = this.datanum - 1;
                }
            }
            var tempdir = (dir + 2) > 3 ? (dir + 2) % 4 : (dir + 2);
            if (this.staydirarray[tempdir]) {
                tmpindex = this.stayindexarray[tempdir];
            }
            if (this.datanum !== undefined && tmpindex > this.datanum - 1) {
                tmpindex = this.datanum - 1;
            }
            this.changefocus(tmpindex, true);
            if (!!this.areaInAfterEvent) {
                return !!this.areaInAfterEvent();
            }
        };
        this.areaout = function (stableindex, dir) {
            if (!!this.areaOutBeforeEvent) {
                if (this.areaOutBeforeEvent()) {
                    return true;
                }
            }
            if (this.staydirarray[dir]) {
                if (this.stayindexarray[dir] !== undefined) this.stayindexarray[dir] = stableindex;
                if (this.staystylearray[dir] !== undefined) {
                    if (!(this.staystylearray[dir].constructor === Array)) {
                        this.staystylearray[dir] = new Array(this.staystylearray[dir]);
                    }
                    this.doms[this.stayindexarray[dir]].changestyle(this.staystylearray[dir]);
                    this.curindex = stableindex;
                    if (!!this.changeunfocusBeforeEvent) {
                        this.changeunfocusBeforeEvent();
                    }
                } else {
                    this.changefocus(stableindex, false);
                }
            } else {
                this.changefocus(stableindex, false);
            }
            if (!!this.areaOutAfterEvent) {
                if (this.areaOutAfterEvent()) {
                    return true;
                }
            }
            return true;
        };
        this.pageturn = function (num, areaid) {
            if (this.lock) return;
            if (this.curpage !== undefined && this.pagecount !== undefined) {
                var nextpage = this.curpage + num;
                var nextindexid = 0;
                if (nextpage > this.pagecount) {
                    if (this.cirturnpage) nextpage = 1;
                    else {
                        nextpage = this.pagecount;
                        return;
                    }
                }
                if (nextpage < 1) {
                    if (this.cirturnpage) nextpage = this.pagecount;
                    else {
                        nextpage = 1;
                        return;
                    }
                }
                this.curpage = nextpage;
                if (!!this.areaPageTurnEvent) {
                    this.pageTurnFlag = num;
                    this.areaPageTurnEvent(num);
                }
                if (num > 0 || this.focusfirst) {
                    nextindexid = 0;
                } else {
                    nextindexid = (this.datanum === undefined ? this.doms.length - 1 : this.datanum - 1);
                }
                if (this.darkfocusstyle !== undefined && this.darkunfocusstyle !== undefined) {
                    this.changeDarkFocus();
                }
                if (this.id === this.pageobj.curareaid) {
                    if (!this.areaStayInitFocus) {
                        this.changefocus(this.curindex, false);
                        this.changefocus(nextindexid, true);
                    }
                }
            }
        };
    };

    window["WkEpg"].DomData = function (tempdomid, tempfocusstyles, tempunfocusstyles) {
        this.id = undefined;
        this.htmldomid = tempdomid;
        this.htmldom = undefined;
        this.focusEvent = undefined;
        this.unfocusEvent = undefined;
        this.domOkEvent = undefined;
        this.mylink = "";
        this.canfocus = true;
        this.area = undefined;
        this.tempfocusstyle = tempfocusstyles;
        this.tempunfocusstyle = tempunfocusstyles;
        this.focusstyle = tempfocusstyles;
        this.unfocusstyle = tempunfocusstyles;
        this.nextAreaStation = undefined;
        this.ok = function () {
            if (this.domOkEvent !== undefined) this.domOkEvent();
            this.gotolink();
        };
        this.gotolink = function () {
            if (this.mylink !== undefined && this.mylink !== "") {
                window.location.href = this.mylink;
            }
        };
        this.changefocus = function (focusornot) {
            if (focusornot) {
                /*聚焦事件*/
                if (!!this.focusEvent) this.focusEvent();
            } else {
                /*失焦事件*/
                if (!!this.unfocusEvent) this.unfocusEvent();
            }
            if (focusornot) {
                this.changestyle(this.focusstyle);
            } else {
                this.changestyle(this.unfocusstyle);
            }
        };
        this.changestyle = function (newstyle) {
            if (newstyle === undefined) return;
            for (var j = 0; j < newstyle.length; j++) {
                tmpstyle = newstyle[j];
                if (tmpstyle !== undefined) {
                    var tmpproerty = tmpstyle.split(':');
                    if (this.htmldom === undefined) {
                        this.htmldom = window["WkEpg"].Util.$(this.htmldomid);
                    }
                    this.htmldom[tmpproerty[0]] = tmpproerty[1];
                }
            }
        };
    }
})(window);

(function (window) {
    if (!(typeof(window["WkEpg"]) === "object" && window["WkEpg"] !== undefined)) window["WkEpg"] = {};
    window["WkEpg"].Player = {
        initMedia: function (_left, _top, _width, _heigth) {
            if (!!window.mp) window.mp = null;
            window.mp = new MediaPlayer();
            var instanceId = window.mp.getNativePlayerInstanceID();
            var playListFlag = 0;
            var videoDisplayMode = 1;
            var height = _heigth;
            var width = _width;
            var left = _left;
            var top = _top;
            var muteFlag = 0;
            var subtitleFlag = 0;
            var videoAlpha = 0;
            var cycleFlag = 1;
            var randomFlag = 0;
            var autoDelFlag = 0;
            var useNativeUIFlag = 1;
            /*初始话mediaplayer对象*/
            window.mp.initMediaPlayer(instanceId, playListFlag, videoDisplayMode, height, width, left, top, muteFlag, useNativeUIFlag, subtitleFlag, videoAlpha, cycleFlag, randomFlag, autoDelFlag);
            window.mp.setChannelNoUIFlag(0);
            window.mp.setVideoDisplayArea(_left, _top, _width, _heigth);
            window.mp.setVideoDisplayMode((_left === 0 || _top === 0) ? 1 : 0);
            window.mp.setAllowTrickmodeFlag(0);
            window.mp.setNativeUIFlag(0);
            window.mp.setAudioTrackUIFlag(1);
            window.mp.setMuteUIFlag(1);
            window.mp.setAudioVolumeUIFlag(0);
            window.mp.setProgressBarUIFlag(0);
            window.mp.refreshVideoDisplay();
        },
        playVod: function (url) {
            var mediaStr = '[{mediaUrl:"' + url + '",';
            mediaStr += 'mediaCode: "jsoncode1",';
            mediaStr += 'IsHD:"0",';
            mediaStr += 'mediaType:2,';
            mediaStr += 'audioType:1,';
            mediaStr += 'videoType:1,';
            mediaStr += 'streamType:1,';
            mediaStr += 'drmType:1,';
            mediaStr += 'fingerPrint:0,';
            mediaStr += 'copyProtection:1,';
            mediaStr += 'allowTrickmode:1,';
            mediaStr += 'startTime:0,';
            mediaStr += 'endTime:20000,';
            mediaStr += 'entryID:"jsonentry1"}]';
            /*设置媒体播放器播放媒体内容*/
            window.mp.setSingleMedia(mediaStr);
            window.mp.playFromStart();
        },
        playVodByTime: function (url, playType, beginTime) {
            var mediaStr = '[{mediaUrl:"' + url + '",';
            mediaStr += 'mediaCode: "jsoncode1",';
            mediaStr += 'IsHD:"0",';
            mediaStr += 'mediaType:2,';
            mediaStr += 'audioType:1,';
            mediaStr += 'videoType:1,';
            mediaStr += 'streamType:1,';
            mediaStr += 'drmType:1,';
            mediaStr += 'fingerPrint:0,';
            mediaStr += 'copyProtection:1,';
            mediaStr += 'allowTrickmode:1,';
            mediaStr += 'startTime:0,';
            mediaStr += 'endTime:20000,';
            mediaStr += 'entryID:"jsonentry1"}]';
            /*设置媒体播放器播放媒体内容*/
            window.mp.setSingleMedia(mediaStr);
            if (playType === 6) {
                /*自然播放*/
                var type = 1;
                /*播放速度*/
                var speed = 1;
                window.mp.playByTime(type, beginTime, speed);
            }
            else {
                window.mp.playFromStart();
            }
        },
        playChannel: function (chanNum) {
            window.mp.joinChannel(chanNum);
        },
        vodStop: function () {
            window.mp.stop();
        },
        channelStop: function () {
            window.mp.leaveChannel();
            window.mp.stop();
        },
        vodDestroy: function () {
            window.mp.stop();
            window.mp.releaseMediaPlayer(window.mp.getNativePlayerInstanceID());
        },
        channelDestroy: function () {
            window.mp.leaveChannel();
            window.mp.stop();
            window.mp.releaseMediaPlayer(window.mp.getNativePlayerInstanceID());
        }
    };
})(window);

(function (window) {
    if (!(typeof(window["WkEpg"]) === "object" && window["WkEpg"] !== undefined)) window["WkEpg"] = {};
    window["WkEpg"].Util = {
        createJsonp: function (id, url) {/*jsonp请求创建*/
            var eleScript = document.createElement("script");
            eleScript.type = "text/javascript";
            eleScript.id = id;
            eleScript.src = url;
            document.getElementsByTagName("HEAD")[0].appendChild(eleScript);
        },
        deleteJsonp: function (id) {/*jsonp script移除，对不适用的json进行清理，减少资源占用,需要与createJsonp 一一对应*/
            var tempObj = document.getElementById(id);
            document.head.removeChild(tempObj);
        },
        jsonTrim: function (str) {/*清除字符串里的换行与回车*/
            return str.replace(/\r/g, ' ').replace(/\n/g, ' ');
        },
        isArray: function (obj) {/*判断对象是否为数组*/
            var isArr = Object.prototype.toString.call(obj) === '[object Array]';
            /*兼容ipanel低端盒子*/
            if (!isArr && obj != null) isArr = obj.constructor == Array;
            return isArr;
        },
        argumentsToArray: function (setObj) {/*参数对象转数组*/
            var tempArray = [];
            /*如果传的是个数组，则直接数组赋值*/
            if (setObj.length === 1 && WkEpg.Util.isArray(setObj[0])) {
                tempArray = setObj[0];
            } else {
                for (var i = 0, len = setObj.length; i < len; i++) {
                    if (typeof(setObj[i]) == "object" && setObj[i] != null) {
                        tempArray.push(setObj[i]);
                    }
                }
            }
            /*如果没有参数，则为null*/
            if (tempArray.length === 0) tempArray = null;
            return tempArray;
        },
        ajaxGet: function (url, callBack) {
            var xmlhttp;
            var responseText = "";
            /*code for IE7+, Firefox, Chrome, Opera, Safari*/
            if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
            /*code for IE6, IE5*/
            else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4 && xmlhttp.status === 200 && typeof(callBack) === "function")
                /*兼容低级盒子，不能扩展string*/
                    callBack(window["WkEpg"].Util.jsonTrim(xmlhttp.responseText));
            };
            if (typeof(callBack) === "function") xmlhttp.open("GET", url, true);
            else xmlhttp.open("GET", url, false);
            xmlhttp.send();
            return window["WkEpg"].Util.jsonTrim(xmlhttp.responseText);
        },
        ajaxPost: function (url, content, callBack) {
            var xmlhttp;
            var responseText = "";
            /*code for IE7+, Firefox, Chrome, Opera, Safari*/
            if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest();
            /*code for IE6, IE5*/
            else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState === 4 && xmlhttp.status === 200 && typeof(callBack) === "function")
                    callBack(window["WkEpg"].Util.jsonTrim(xmlhttp.responseText));
            };
            if (typeof(callBack) === "function") xmlhttp.open("POST", url, true);
            else xmlhttp.open("POST", url, false);
            xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xmlhttp.send(content);
            return window["WkEpg"].Util.jsonTrim(xmlhttp.responseText);
        },
        gotoPage: function (url) {/*页面跳转*/
            window.location.href = url;
        },
        setCookie: function (key, val) {
            /*保存7天*/
            var Days = 7;
            var exp = new Date();
            exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
            document.cookie = key + "=" + escape(val) + ";expires=" + exp.toGMTString();
        },
        getCookie: function (key) {
            var arr = null;
            if (document.cookie != null && document.cookie.length > 0)
                arr = document.cookie.match(new RegExp("(^| )" + key + "=([^;]*)(;|$)"));
            if (arr != null)
                return unescape(arr[2]);
            return null;
        },
        delCookie: function (key) {
            /*为了删除指定名称的cookie，可以将其过期时间设定为一个过去的时间*/
            var date = new Date();
            date.setTime(date.getTime() - 10000);
            document.cookie = key + "=;expires=" + date.toGMTString() + ";path=/";
        },
        objectToStr: function (jsonObj) {/*json对象转换为字符串*/
            var reStr = "";
            if (jsonObj != null && typeof(jsonObj) == "object") {
                var beginStr = "{";
                var endStr = "}";
                if (this.isArray(jsonObj)) {
                    beginStr = "[";
                    endStr = "]";
                }
                for (var item in jsonObj) {
                    /*JSON 对象*/
                    if (!(item >= 0)) {
                        reStr += "'" + item + "':";
                    }
                    var type = typeof(jsonObj[item]);
                    if (type == "number") {
                        reStr += jsonObj[item];
                    } else if (type == "object") {
                        reStr += this.objectToStr(jsonObj[item]);
                    } else {
                        reStr += "'" + jsonObj[item] + "'";
                    }
                    reStr += ",";
                }
                if (reStr.length > 0)
                    reStr = reStr.substr(0, reStr.length - 1);
                reStr = beginStr + reStr + endStr;
            }
            return reStr;
        },
        getStrRealLen: function (str) {/*获取字符串真实长度,中文字符算2长度*/
            if (typeof(str) != "string" || str.length == 0)
                return 0;
            var len = 0;
            var strLen = str.length;
            for (var i = 0; i < strLen; i++) {
                a = str.charAt(i);
                len++;
                if (escape(a).length > 4) {/*中文字符的长度经编码之后大于4*/
                    len++;
                }
            }
            return len;
        },

        /**
         * @function getSubStr
         * @param {string} str 截取前字符串
         * @param {number} len 截取长度,中文字符算2长度
         * @param {boolean} isSuffix 是否加省略号，默认不加
         * @return {string} 截取后字符串
         * @description 截取字符串,中文字符算2长度
         * @example var str = WkEpg.Util.getSubStr("test测试",6);普通截取
         * @example var str = WkEpg.Util.getSubStr("test测试",6,true); 截取后面加省略号
         */
        getSubStr: function (str, len, isSuffix) {
            if (typeof(str) != "string" || str.length == 0)
                return "";
            var realLen = this.getStrRealLen(str);
            if (realLen <= len) {
                return str;
            } else {
                var str_length = 0;
                var str_cut = String();
                var str_len = str.length;
                if (isSuffix)
                    len -= 3;
                for (var i = 0; i < str_len; i++) {
                    var a = str.charAt(i);
                    str_length++;
                    if (escape(a).length > 4) {
                        /*中文字符的长度经编码之后大于4*/
                        str_length++;
                    }
                    str_cut = str_cut.concat(a);
                    if (str_length >= len) {
                        if (isSuffix) {
                            str_cut = str_cut.concat("...");
                        }
                        return str_cut;
                    }
                }
                /*如果给定字符串小于指定长度，则返回源字符串；*/
                if (str_length < len)
                    return str;
            }
        },

        /**
         * @function numSupplyZero
         * @param {string} initNumStr 初始化字符串
         * @param {string} numStr 需要格式化数字
         * @return {string} 格式化后字符串
         * @description 数字前面补0
         * @example var str = WkEpg.Util.numSupplyZero("112","0000"); 结果为:0112
         */
        numSupplyZero: function (initNumStr, numStr) {
            var len = initNumStr.length;
            initNumStr = numStr + initNumStr;
            return initNumStr.substring(initNumStr.length - numStr.length);
        },

        /**
         * @function getPageTotal
         * @param {number} totalNum 总条数
         * @param {number} pageSize 每页条数
         * @return {number} 总页数
         * @description 根据总条数与每页条数，计算出总页数
         * @example WkEpg.Util.getPageTotal(112,10);
         */
        getPageTotal: function (totalNum, pageSize) {
            return Math.ceil(parseInt(totalNum, 10) / parseInt(pageSize, 10));
        },

        /**
         * @function getSliceList
         * @param {array} objs 列表数组
         * @param {number} pageIndex 开始页
         * @param {number} pageSize 每页条数
         * @return {array} 本页数组
         * @description 根据数组开始页与每页条数，计算出当前页数组列表
         * @example WkEpg.Util.getSliceList([1,3,5,6,8,9,7],2,3);
         */
        getSliceList: function (objs, pageIndex, pageSize) {
            var tempObj = objs;
            if (objs != null && typeof(objs) == "object" && objs.length > 0) {
                pageIndex = parseInt(pageIndex, 10);
                pageSize = parseInt(pageSize, 10);
                var len = objs.length;
                if (pageIndex > 0 && pageSize > 0 && len > 0) {
                    var begin = pageSize * (pageIndex - 1);
                    if (begin < 0)
                        begin = 0;
                    var end = pageSize * pageIndex;
                    if (end > len)
                        end = len;
                    tempObj = objs.slice(begin, end);
                }
            }
            return tempObj;
        },

        /**
         * @function replaceUrlParams
         * @param {string} url 地址
         * @param {string} key url参数关键字
         * @param {string|number} value 参数值
         * @return {string} 替换后地址
         * @description 替换地址里的参数值,如果地址里没有该参数，则再末尾补参数与值
         * @example WkEpg.Util.replaceUrlParams("test.htm?a=cc&b=kk","a","oo");
         */
        replaceUrlParams: function (url, key, value) {
            var index = url.indexOf(key + "=");
            if (index > -1) {
                var before = url.substring(0, index);
                var after = url.substring(index);
                index = after.indexOf("&");
                after = (index > -1) ? after.substring(index) : "";
                url = before + key + "=" + value + after;
            } else {
                url += (url.indexOf("?") > -1) ? "&" : "?";
                url += key + "=" + value;
            }
            return url;
        },
        getURLParameter: function (param, url) {/*获取URL里面的参数*/
            var params = (url.substr(url.indexOf("?") + 1)).split("&");
            if (params != null) {
                for (var i = 0; i < params.length; i++) {
                    var strs = params[i].split("=");
                    if (strs[0] == param) {
                        return strs[1];
                    }
                }
            }
            return null;
        },

        /**
         * @function getUrlParam
         * @param {string} strname url参数关键字
         * @param {string} url 地址
         * @return {string} 参数值
         * @description 获取URL地址中的参数值
         * @example WkEpg.Util.getUrlParam("a","test.htm?a=cc&b=kk");
         */
        getUrlParam: function (strname, url) {
            var hrefstr, pos, parastr, para, tempstr;
            hrefstr = window.location.href;
            if (typeof(url) != "undefined")
                hrefstr = url;
            pos = hrefstr.indexOf("?");
            /*没有参数，则直接跳出*/
            if (pos == -1 && hrefstr.indexOf("=") == -1)
                return null;
            parastr = decodeURI(hrefstr.substring(pos + 1));
            para = parastr.split("&");
            tempstr = "";
            for (var i = 0; i < para.length; i++) {
                tempstr = para[i];
                pos = tempstr.indexOf("=");
                if (tempstr.substring(0, pos) == strname) {
                    return tempstr.substring(pos + 1);
                }
            }
            return null;
        },
        parseUrl: function (e) {/*解析 Url 中的参数  返回并封装成对象,当传入参数url时处理的是参数url，不传参数 处理的是 当前浏览器中的url.*/
            var t, n, r, i, o, a = {};
            e = e ? e.replace(/[^\?]*\?/, "") : window.location.search.substring(1);
            var l = e.split("&");
            for (i = 0, o = l.length; o > i; i++) t = l[i], n = t.indexOf("="), -1 !== n && (r = t.substr(n + 1), r = decodeURIComponent(r), a[t.substr(0, n)] = r);
            return a;
        },
        /**
         * @function getUrlParameterObj
         * @param {string} url 地址
         * @return {object} 参数对象
         * @description 获取记录地址里的参数对象
         * @example WkEpg.Util.getUrlParameterObj("test.htm?a=cc&b=kk");  结果为 {"a":"cc","b":"kk"}
         */
        getUrlParameterObj: function (url) {
            if (typeof(url) == "undefined" || url == null)
                url = window.location.href;
            var pos = url.indexOf("?");
            var obj = null;
            /*没有参数，则直接跳出*/
            if (pos == -1 && url.indexOf("=") == -1)
                return obj;
            var parastr = decodeURI(url.substring(pos + 1));
            var para = parastr.split("&");
            obj = {};
            for (i = 0; i < para.length; i++) {
                var tempstr = para[i];
                pos = tempstr.indexOf("=");
                obj[tempstr.substring(0, pos)] = tempstr.substring(pos + 1);
            }
            return obj;
        },
        //获取时间戳
        getTimeStamp: function () {
            return Math.round(new Date().getTime() / 1000);
        },
        /**
         * @function timeFormat
         * @param {number} time 需要格式化数值,单位秒s
         * @return {string} 格式化完成字符串
         * @description 时间格式化 hh24:mi:ss
         * @example WkEpg.Util.timeFormat("5700");
         */
        timeFormat: function (time) {
            var hour = parseInt(time / 3600);
            time = parseInt(time % 3600);
            var minute = parseInt(time / 60);
            time = parseInt(time % 60);
            var second = parseInt(time);
            var timeStr = "";
            if (hour < 10)
                timeStr += "0";
            timeStr += hour + ":";
            if (minute < 10)
                timeStr += "0";
            timeStr += minute + ":";
            if (second < 10)
                timeStr += "0";
            timeStr += second;
            return timeStr;
        },
        parseJSON: function (data) {
            if (window.JSON && window.JSON.parse) {
                return window.JSON.parse(data + "");
            }
            var requireNonComma,
                depth = null,
                str = UtilObj.trim(data + "");
            //// after removing valid tokens
            return (Function("return " + str))();
            return str && !UtilObj.trim(str.replace(rvalidtokens, function (token, comma, open, close) {
                if (requireNonComma && comma) {
                    depth = 0;
                }
                if (depth === 0) {
                    return token;
                }
                requireNonComma = open || comma;
                depth += !close - !open;
                return "";
            })) ?
                (Function("return " + str))() :
                console.log("Invalid JSON: " + data);
        },
        trim: function (text) {
            return text == null ?
                "" :
                (text + "").replace(rtrim, "");
        },
        each: function (obj, callback) {
            var length, i = 0;

            if (obj && obj.length >= 0) {
                length = obj.length;
                for (; i < length; i++) {
                    if (callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    if (callback.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            }

            return obj;
        },
        renderTpl: function (data, tpl) {
            var res = "";
            if (data && data.length) {/*数组*/
                var temp = [];
                this.each(data, function (i) {
                    var item = data[i];
                    var s = tpl.replace(/\{\{(\w+)\}\}/g, function (all, key) {
                        return item[key] || "";
                    });
                    temp.push(s);
                });
                s = temp.join("");
            } else {/*对象*/
                res = tpl.replace(/\{\{(\w+)\}\}/g, function (all, key) {
                    return data[key] || "";
                });
            }
            return res;
        },
        maindiv: null,
        e: null,
        container: "debug",
        log: function (error) {
            var self = this;
            if (self.maindiv === null) {
                self.maindiv = document.body;
                if (this.maindiv === null) return;
                self.e = document.createElement("div");
                self.e.id = this.container;
                self.maindiv.appendChild(this.e);
                self.e.style.cssText = 'z-index:20; font-size: 12px; position:absolute; top:10px; left:10px; width:1240px; height:auto; overflow:hidden; padding:10px; background:#14affa; color:red;word-break:break-all; display:block; filter:alpha(opacity=0.7);-moz-opacity: 0.7;-khtml-opacity: 0.7;opacity: 0.7;';
            }
            var obj_type = typeof error;
            switch (obj_type) {
                default:
                    break;
                case 'undefined':
                    fill("undefined");
                    break;
                case 'boolean':
                    fill("(boolean):" + error);
                    break;
                case 'number':
                    fill("(number):" + error);
                    break;
                case 'string':
                    fill("(string):" + error);
                    break;
                case 'object':
                    if (error === null) {
                        fill("(object):null");
                        break;
                    }
                    var text = [];
                    for (var ierror in error) {
                        if (error.hasOwnProperty(ierror)) {
                            var value = error[ierror];
                            text.push(String(ierror + ":" + "(" + (typeof value) + ")" + value));
                        }
                    }
                    fill("(object) => {" + text.join(", ") + "}");
                    break;
            }

            function fill(content) {
                var target = self.$("debug");
                var tempContent = target.innerHTML;
                var date = new Date();
                target.innerHTML = "<div id = 'copyright' style = 'font-size: 12px;color:#FFF;'><strong>"
                    + "debug   @" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
                    + "</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + window.navigator.userAgent + "</div><div id ='debug_box'></div>";
                var targetContent = self.$('debug_box');
                targetContent.innerHTML = content + "<br/>" + tempContent;
            }
        },
        $: function (id) {
            return window.document.getElementById(id);
        }
    };
})(window);

(function (window) {
    if (!(typeof(window["WkEpg"]) === "object" && window["WkEpg"] !== undefined)) window["WkEpg"] = {};
    window["WkEpg"].Nav = {
        onkeydownFlag: false,
        onkeypressFlag: false,
        keyLock: false,
        direction: null,
        keyBind: function () {
            window.document.onkeydown = window["WkEpg"].Nav.onkeydownKeyEvent;
            window.document.onkeypress = window["WkEpg"].Nav.onkeypressKeyEvent;
        },
        onkeydownKeyEvent: function (event) {
            var self = window["WkEpg"].Nav;
            if (self.onkeypressFlag) {
                self.onkeypressFlag = !self.onkeypressFlag;
                return;
            }
            if (!self.onkeydownFlag) self.onkeydownFlag = !self.onkeydownFlag;
            var keyCode = event.which ? event.which : event.keyCode;
            self.keyDo(keyCode);
            /*禁止华数ipanel上下左右及自动返回并兼容返回*/
            if (keyCode === 1 || keyCode === 2 || keyCode === 3 || keyCode === 4 || keyCode === 340 || keyCode === 37 || keyCode === 38 || keyCode === 39 || keyCode === 40) return 0;
        },
        onkeypressKeyEvent: function (event) {
            var self = window["WkEpg"].Nav;
            if (self.onkeydownFlag) {
                self.onkeydownFlag = !self.onkeydownFlag;
                return;
            }
            if (!self.onkeypressFlag) self.onkeypressFlag = !self.onkeypressFlag;
            var keyCode = event.which ? event.which : event.keyCode;
            self.keyDo(keyCode);
            /*禁止华数ipanel上下左右及自动返回并兼容返回*/
            if (keyCode === 1 || keyCode === 2 || keyCode === 3 || keyCode === 4 || keyCode === 340 || keyCode === 37 || keyCode === 38 || keyCode === 39 || keyCode === 40) return 0;
        },
        keyDo: function (keyCode) {
            var self = window["WkEpg"].Nav;

            if (self.keyLock) return;
            var KEY_BACK = 8,
                KEY_OK = 13,
                KEY_LEFT = 37,
                KEY_UP = 38,
                KEY_RIGHT = 39,
                KEY_DOWN = 40,
                KEY_PAGEUP = 33,
                KEY_PAGEDOWN = 34,
                KEY_0 = 48,
                KEY_1 = 49,
                KEY_2 = 50,
                KEY_3 = 51,
                KEY_4 = 52,
                KEY_5 = 53,
                KEY_6 = 54,
                KEY_7 = 55,
                KEY_8 = 56,
                KEY_9 = 57,
                KEY_VOLUP = 259,
                KEY_VOLDOWN = 260,
                KEY_MUTE = 261,
                KEY_PAUSE_PLAY = 263,
                /*del海信键值*/
                KEY_DEL = 46,
                /*IPTV虚拟事件*/
                KEY_IPTV_EVENT = 768;
            switch (keyCode) {

                case KEY_0:
                case KEY_1:
                case KEY_2:
                case KEY_3:
                case KEY_4:
                case KEY_5:
                case KEY_6:
                case KEY_7:
                case KEY_8:
                case KEY_9:
                    self.keyNumberEvent(keyCode - 48);
                    break;
                case 1:  /*ipannel*/
                case KEY_UP:
                    self.direction = "up";
                    self.keyUpEvent();
                    break;
                case 2: /*ipannel*/
                case KEY_DOWN:
                    self.direction = "down";
                    self.keyDownEvent();
                    break;
                case 3:  /*ipannel*/
                case KEY_LEFT:
                    self.direction = "left";
                    self.keyLeftEvent();
                    break;
                case 4:  /*ipannel*/
                case KEY_RIGHT:
                    self.direction = "right";
                    self.keyRightEvent();
                    break;
                case KEY_OK:
                    self.keyOkEvent();
                    break;
                case 32: /*空格键*/
                case 45: /*兼容云平台*/
                case 340: /*ipannel 返回*/
                case 1249: /*兼容烽火盒子*/
                case KEY_BACK:
                    self.keyBackEvent();
                    break;
                case KEY_PAGEUP:
                    self.keyPageUpEvent();
                    break;
                case KEY_PAGEDOWN:
                    self.keyPageDownEvent();
                    break;
                case KEY_DEL:
                    self.keyDelEvent();
                    break;
                case KEY_VOLUP:
                    self.keyVolUpEvent();
                    break;
                case KEY_VOLDOWN:
                    self.keyVolDownEvent();
                    break;
                case KEY_MUTE:
                    self.keyMuteEvent();
                    break;
                case KEY_PAUSE_PLAY:
                    self.keyPausePlayEvent();
                    break;
                case KEY_IPTV_EVENT:
                    eval("eventJson=" + Utility.getEvent());
                    var typeStr = eventJson.type;
                    switch (typeStr) {
                        case "EVENT_TVMS":
                        case "EVENT_TVMS_ERROR":
                            return;
                        case "EVENT_MEDIA_ERROR":
                            self.keyMediaErrorEvent();
                            return;
                        case "EVENT_MEDIA_END":
                            self.keyMediaEndEvent();
                            return;
                        case "EVENT_PLTVMODE_CHANGE":
                            return;
                        case "EVENT_PLAYMODE_CHANGE":
                            self.keyPlayModeChange(eventJson);
                            return;
                        case "EVENT_MEDIA_BEGINING":
                            self.keyMediaBeginEvent();
                            return;
                        case "EVENT_GO_CHANNEL":
                            return;
                    }
                    break;
                default:
                    self.keyDefaultEvent(keyCode);
                    break;
            }
        },
        keyNumberEvent: function (num) {

        },
        keyUpEvent: function () {
            if (!window['WkEpg'].pageobj) return;
            if (pageobj.areas[pageobj.curareaid].upFlag) {
                window['WkEpg'].pageobj.areas[pageobj.curareaid].upEVENT();
            } else {
                window['WkEpg'].pageobj.move(0);
            }
        },
        keyDownEvent: function () {
            if (!window['WkEpg'].pageobj) return;
            if (pageobj.areas[pageobj.curareaid].downFlag) {
                window['WkEpg'].pageobj.areas[pageobj.curareaid].downEVENT();
            } else {
                window['WkEpg'].pageobj.move(2);
            }
        },
        keyLeftEvent: function () {
            if (!window['WkEpg'].pageobj) return;
            if (pageobj.areas[pageobj.curareaid].leftFlag) {
                pageobj.areas[pageobj.curareaid].leftEVENT();
            } else {
                pageobj.move(1);
            }
        },
        keyRightEvent: function () {
            if (!window['WkEpg'].pageobj) return;
            if (pageobj.areas[pageobj.curareaid].rightFlag) {
                pageobj.areas[pageobj.curareaid].rightEVENT();
            } else {
                pageobj.move(3);

            }
        },
        keyOkEvent: function () {
            if (!window['WkEpg'].pageobj) return;
            window.pageobj.ok();
        },
        keyBackEvent: function () {
        },
        keyPageUpEvent: function () {
            if (!window['WkEpg'].pageobj) return;
            window.pageobj.pageTurn(-1);
        },
        keyPageDownEvent: function () {
            if (!window['WkEpg'].pageobj) return;
            window.pageobj.pageTurn(1);
        },
        keyDelEvent: function () {

        },
        keyVolUpEvent: function () {

        },
        keyVolDownEvent: function () {

        },
        keyMuteEvent: function () {

        },
        keyPausePlayEvent: function () {

        },
        keyMediaErrorEvent: function () {

        },
        keyMediaEndEvent: function () {
        },
        keyMediaBeginEvent: function () {

        },
        keyPlayModeChange: function (eventJson) {

        },
        keyDefaultEvent: function () {

        }
    };
    /*默认绑定*/
    window["WkEpg"].Nav.keyBind();
})(window);
(function () {
    'use strict';

    function safeAdd(x, y) {
        var lsw = (x & 0xffff) + (y & 0xffff);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xffff)
    }

    function bitRotateLeft(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt))
    }

    function md5cmn(q, a, b, x, s, t) {
        return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
    }

    function md5ff(a, b, c, d, x, s, t) {
        return md5cmn((b & c) | (~b & d), a, b, x, s, t)
    }

    function md5gg(a, b, c, d, x, s, t) {
        return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
    }

    function md5hh(a, b, c, d, x, s, t) {
        return md5cmn(b ^ c ^ d, a, b, x, s, t)
    }

    function md5ii(a, b, c, d, x, s, t) {
        return md5cmn(c ^ (b | ~d), a, b, x, s, t)
    }

    function binlMD5(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (len % 32);
        x[((len + 64) >>> 9 << 4) + 14] = len;

        var i;
        var olda;
        var oldb;
        var oldc;
        var oldd;
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5ff(a, b, c, d, x[i], 7, -680876936);
            d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

            a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5gg(b, c, d, a, x[i], 20, -373897302);
            a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5hh(d, a, b, c, x[i], 11, -358537222);
            c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = md5ii(a, b, c, d, x[i], 6, -198630844);
            d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = safeAdd(a, olda);
            b = safeAdd(b, oldb);
            c = safeAdd(c, oldc);
            d = safeAdd(d, oldd);
        }
        return [a, b, c, d];
    }

    /*
    * Convert an array of little-endian words to a string
    */
    function binl2rstr(input) {
        var i;
        var output = '';
        var length32 = input.length * 32;
        for (i = 0; i < length32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xff)
        }
        return output;
    }

    /*
    * Convert a raw string to an array of little-endian words
    * Characters >255 have their high-byte silently ignored.
    */
    function rstr2binl(input) {
        var i;
        var output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0
        }
        var length8 = input.length * 8;
        for (i = 0; i < length8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << (i % 32);
        }
        return output;
    }

    /*
    * Calculate the MD5 of a raw string
    */
    function rstrMD5(s) {
        return binl2rstr(binlMD5(rstr2binl(s), s.length * 8));
    }

    /*
    * Calculate the HMAC-MD5, of a key and some data (raw strings)
    */
    function rstrHMACMD5(key, data) {
        var i;
        var bkey = rstr2binl(key);
        var ipad = [];
        var opad = [];
        var hash;
        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
            bkey = binlMD5(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5c5c5c5c;
        }
        hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binlMD5(opad.concat(hash), 512 + 128));
    }

    /*
    * Convert a raw string to a hex string
    */
    function rstr2hex(input) {
        var hexTab = '0123456789abcdef';
        var output = '';
        var x;
        var i;
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
        }
        return output;
    }

    /*
    * Encode a string as utf-8
    */
    function str2rstrUTF8(input) {
        return unescape(encodeURIComponent(input));
    }

    /*
    * Take string arguments and return either raw or hex encoded strings
    */
    function rawMD5(s) {
        return rstrMD5(str2rstrUTF8(s));
    }

    function hexMD5(s) {
        return rstr2hex(rawMD5(s));
    }

    function rawHMACMD5(k, d) {
        return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d));
    }

    function hexHMACMD5(k, d) {
        return rstr2hex(rawHMACMD5(k, d));
    }

    function md5(string, key, raw) {
        if (!key) {
            if (!raw) {
                return hexMD5(string);
            }
            return rawMD5(string);
        }
        if (!raw) {
            return hexHMACMD5(key, string);
        }
        return rawHMACMD5(key, string);
    }

    window.md5 = md5
})(window);