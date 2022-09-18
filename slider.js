'use strict'

class Slider {
    static instance = null;
    /*
    baseObject Format
    baseObject = {
        data: [
            {

            },
            {

            }, . . .
        ]
    }
     */

    /*
    optionObject Format
    option = {
        animation : {
            milisecond: 1500, // 1.5s
        },
        direction: ("horizontal" OR "vertical") OR ("row" OR "column"),
        hoverType => 0. null, 1. stop, 2. expand,
        isButton: false OR true,
        isPagination: false OR true,
        isDragged => false OR true,
        customEvent: [
            {eventType: "click", function: ~~~}, . . .
        ]
    }
     */
    constructor(targetElement, option = {}) {
        if (Slider.instance !== null) {
            return Slider.instance;
        }
        // 타깃 엘리먼트가 없으면
        this.sliderElement = targetElement;

        // 옵션이 없으면 기본값 설정해주기
        this.option = option;
        if (!this.option.direction) {
            this.option.direction = 'row';
        }
        if (!this.option.animation) {
            this.option.animation = {}
        }
        if (!this.option.animation.millisecond) {
            this.option.animation.millisecond = 400;
        }

        Slider.instance = this;
    }

    static getInstance(targetElement, option) {
        if (Slider.instance === null) {
            Slider.instance = new Slider(targetElement, option);
        }
        return Slider.instance;
    }

    // Update
    // Insert
    add(element) {
        let index;
        index = this.sliderElement.appendChild(element);
        return index;
    }

    // Delete
    delete(nodeIndex) {
        this.sliderElement.removeChild(nodeIndex);
        return -1;
    }

    search(className) {
        let ret = null;
        let childNodes;

        childNodes = this.sliderElement.childNodes;

        childNodes.forEach((element, i) => {
            if (this.hasClass(element, className)) {
                ret = element;
            }
        });

        return ret;
    }

    getAt(index) {
        let ret = null;
        let childNodes;

        childNodes = this.sliderElement.childNodes;

        childNodes.forEach((element, i) => {
            if (i === index) {
                ret = element;
            }
        });

        return ret;
    }

    getLsit() {
        return this.sliderElement.childNodes;
    }

    hasClass(element, className) {
        return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
    }

    makeOption(option) {
        if (!option || !option.direction) {
            console.log("잘못된 옵션 데이터 형식입니다.");
            return;
        }
        this.option = option;
    }

    /*
    이벤트 설정
    버튼 클릭과 리사이즈
    드래그

    자동 넘기기
    애니메이션의 넘기기 방향도 지정
    Prev, Next로

    넘기기
    Prev, Next

    애니메이션 루프
     */
    async init() {
        // 원소들을 읽는다.
        // 버튼 엘리먼트 선택하기
        this.prevButton = document.querySelector(".slider_prev_button");
        this.nextButton = document.querySelector(".slider_next_button");

        // 슬라이드 전체를 선택해 값을 변경해주기 위해 슬라이드 전체 선택하기
        this.slideItems = document.querySelectorAll(".slider_item");

        this.paginationItems = document.querySelectorAll(".slider_pagination > li");

        // 오프셋 방향 구하기
        // 슬라이크 전체 길이 구하기
        this.offsetAttribute = 'left';
        this.sliderDistance = this.sliderElement.clientWidth;
        if (this.option.direction !== 'horizontal' && this.option.direction === 'vertical' ||
            this.option.direction !== 'row' && this.option.direction === 'column') {
            this.offsetAttribute = 'top';
            this.sliderDistance = this.sliderElement.clientHeight;
        }

        // 현재 슬라이드 위치가 슬라이드 개수를 넘기지 않게 하기 위한 변수
        this.maxSlide = this.slideItems.length;

        // 버튼 클릭할 때 마다 현재 슬라이드가 어디인지 알려주기 위한 변수
        this.currSlide = 1;
    }

    async render() {
        let pagination;

        await this.init();

        // + 원소 랜더 기능은 좀 쓸데 없어보임
        // ============================ 변경 예정 ============================
        // 무한 슬라이드를 위해 start, end 슬라이드 복사하기 {1~5가 있으면 복제본 1 1~5 복제본 5로 만들고 복제본이면 다음페이지로 넘기는 형식으로 추정됨.}
        const startSlide = this.slideItems[0];
        const endSlide = this.slideItems[this.slideItems.length - 1];
        const startElem = document.createElement("div");
        const endElem = document.createElement("div");

        endSlide.classList.forEach((c) => endElem.classList.add(c));
        endElem.innerHTML = endSlide.innerHTML;

        startSlide.classList.forEach((c) => startElem.classList.add(c));
        startElem.innerHTML = startSlide.innerHTML;

        // 각 복제한 엘리먼트 추가하기
        this.slideItems[0].before(endElem);
        this.slideItems[this.slideItems.length - 1].after(startElem);

        // 슬라이드 전체를 선택해 값을 변경해주기 위해 슬라이드 전체 선택하기
        this.slideItems = document.querySelectorAll(".slider_item");
        //
        this.offset = this.sliderDistance + this.currSlide;
        this.changedOffset();
        // ============================ /변경 예정 ============================

        // 1. 버튼을 추가해야 되면
        // ==

        // 방향에 따라 위치값을 정한다.
        // 방향에 따라 이전과 다음 버튼에 특수기호를 넣는다.
        if (this.option.isButton !== undefined || this.option.isButton === true) {
            // 1. 이전 버튼과 다음 버튼을 만든다.
            this.prevButton = document.createElement('div');
            this.nextButton = document.createElement('div');

            // 2. 만든 버튼에 기본 클래스를 추가한다.
            this.prevButton.className = 'slider_prev_button slider_button';
            this.nextButton.className = 'slider_next_button slider_button';

            // 3. 슬라이더에 추가한다.
            this.sliderElement.appendChild(this.prevButton);
            this.sliderElement.appendChild(this.nextButton);

            // 4. 방향이 수평이거나 가로이면
            if (this.option.direction === "horizontal" || this.option.direction === "row") {
                // 방향에 따라 위치값을 정한다.
                // ======

                // 방향에 따라 이전과 다음 버튼에 특수기호를 넣는다.
                this.prevButton.innerHTML = "◀";
                this.nextButton.innerHTML = "▶";
            }
            // 5. 방향이 수직이거나 세로이면
            else {
                // 방향에 따라 위치값을 정한다.
                // ======
                // 왼쪽 위치, 오른쪽 위치를 구한다.
                changeCSS('.slider_container', 'flex-wrap', 'wrap');

                changeCSS('.slider_item', 'transition', `${this.offsetAttribute} 400ms`);

                changeCSS('.slider_prev_button', 'top', '10px');
                changeCSS('.slider_prev_button', 'left', 'calc(50% - 16px)');
                changeCSS('.slider_next_button', 'bottom', '10px');
                changeCSS('.slider_next_button', 'left', 'calc(50% - 16px)');

                deleteCSS('.slider_button', 'top');

                // 방향에 따라 이전과 다음 버튼에 특수기호를 넣는다.
                this.prevButton.innerHTML = "▲";
                this.nextButton.innerHTML = "▼";
            }
        }

        // 2. 페이지네이션을 추가해야 되면
        // ==
        // 1. 페이지네이션을 만든다.
        // 2. 만든 페이지네이션에 기본 클래스를 추가한다.
        // 3. 슬라이더에 추가한다.
        // 방향에 따라 수평이면 아래에, 수직이면 우측에 추가한다.

        // 2. 페이지네이션을 추가해야 되면

        this.setEvent();
    }

    setEvent() {
        // 드래그(스와이프) 이벤트를 위한 변수 초기화
        this.startClickPoint = 0;
        this.endClickPoint = 0;

        // 기본적으로 슬라이드 루프 시작하기
        this.loopInterval = setInterval(() => {
            this.onNextMove();
        }, 3000);

        // 슬라이더 원소의 크기가 변경되면
        this.sliderElement.addEventListener("resize", () => {
            this.sliderDistance = this.sliderElement.clientWidth;
        });

        // 버튼들에 클릭 이벤트를 추가한다.
        if (this.prevButton !== null && this.nextButton !== null) {
            this.prevButton.addEventListener("click", this.onPreviousMove);

            this.nextButton.addEventListener("click", this.onNextMove);
        }

        // 각 페이지네이션 클릭 시 해당 슬라이드로 이동하기
        for (let i = 0; i < this.maxSlide && this.paginationItems.length > 0; i++) {
            // 각 페이지네이션마다 클릭 이벤트 추가하기
            this.paginationItems[i].addEventListener("click", () => { // 해당 이벤트는 onPaginationButtonClicked로 빼내기
                // 클릭한 페이지네이션에 따라 현재 슬라이드 변경해주기(currSlide는 시작 위치가 1이기 때문에 + 1)
                this.currSlide = i + 1;
                // 슬라이드를 이동시키기 위한 offset 계산
                this.offset = this.sliderDistance * this.currSlide;
                // 각 슬라이드 아이템의 offsetAttribute에 offset 적용
                this.changedOffset();
                // 슬라이드 이동 시 현재 활성화된 pagination 변경
                this.paginationItems.forEach((i) => i.classList.remove("active"));
                this.paginationItems[this.currSlide - 1].classList.add("active");
            });
        }


        // // PC 클릭 이벤트 (드래그) 해당 이벤트 SliderElement가 this가 된다 => this를 해당 Slider로 지정하거나 링크를 알고 있어야 한다.
        // this.sliderElement.addEventListener("mousedown", (e) => {
        //     this.startClickPoint = e.pageX; // 마우스 드래그 시작 위치 저장
        // });
        //
        // this.sliderElement.addEventListener("mouseup", (e) => {
        //     this.endClickPoint = e.pageX; // 마우스 드래그 끝 위치 저장
        //     if (this.startClickPoint < this.endClickPoint) {
        //         // 마우스가 오른쪽으로 드래그 된 경우
        //         this.prevMove();
        //     } else if (this.startClickPoint > this.endClickPoint) {
        //         // 마우스가 왼쪽으로 드래그 된 경우
        //         this.nextMove();
        //     }
        // });
        //
        // // 모바일 터치 이벤트 (스와이프) => 마찬가지로 Slider 가 this가 되어야 함.
        // this.sliderElement.addEventListener("touchstart", (e) => {
        //     this.startClickPoint = e.touches[0].pageX; // 터치가 시작되는 위치 저장
        // });
        // this.sliderElement.addEventListener("touchend", (e) => {
        //     this.endClickPoint = e.changedTouches[0].pageX; // 터치가 끝나는 위치 저장
        //     if (this.startClickPoint < this.endClickPoint) {
        //         // 오른쪽으로 스와이프 된 경우
        //         prevMove();
        //     } else if (this.startClickPoint > this.endClickPoint) {
        //         // 왼쪽으로 스와이프 된 경우
        //         nextMove();
        //     }
        // });

        // on으로 메소드를 만들어서 접근이 가능하게 만드는 방법이 가장 이상적임.
        // 슬라이드에 마우스가 올라간 경우 루프 멈추기
        this.sliderElement.addEventListener("mouseover", this.onAnimatedStopMove);

        // 슬라이드에서 마우스가 나온 경우 루프 재시작하기
        this.sliderElement.addEventListener("mouseout", this.onAnimatedStartMove);
    }

    onNextMove = () => {
        this.currSlide++;
        // 마지막 슬라이드 이상으로 넘어가지 않게 하기 위해서
        if (this.currSlide <= this.maxSlide) {
            // 슬라이드를 이동시키기 위한 offset 계산
            this.offset = this.sliderDistance * this.currSlide;
            // 각 슬라이드 아이템의 offsetAttribute에 offset 적용
            this.changedOffset();
        } else {
            // 무한 슬라이드 기능 - currSlide 값만 변경해줘도 되지만 시각적으로 자연스럽게 하기 위해 아래 코드 작성
            this.currSlide = 0;
            this.offset = this.sliderDistance * this.currSlide;
            this.changedOffset();

            this.currSlide++;
            this.offset = this.sliderDistance * this.currSlide;
            // 각 슬라이드 아이템의 offsetAttribute에 offset 적용
            this.timeoutID = setTimeout(this.changedOffset, 0);
        }

        // 슬라이드 이동 시 현재 활성화된 pagination 변경
        if (this.paginationItems.length > 0) {
            this.paginationItems.forEach((element) => element.classList.remove("active"));
            this.paginationItems[this.currSlide - 1].classList.add("active");
        }
    }
    onPreviousMove = () => {
        this.currSlide--;
        // 1번째 슬라이드 이하로 넘어가지 않게 하기 위해서
        if (this.currSlide > 0) {
            // 슬라이드를 이동시키기 위한 offset 계산
            this.offset = this.sliderDistance * this.currSlide;
            // 각 슬라이드 아이템의 offsetAttribute에 offset 적용
            this.changedOffset();
        } else {
            // 무한 슬라이드 기능 - currSlide 값만 변경해줘도 되지만 시각적으로 자연스럽게 하기 위해 아래 코드 작성
            this.currSlide = this.maxSlide + 1;
            this.offset = this.sliderDistance * this.currSlide;
            // 각 슬라이드 아이템의 left에 offset 적용
            this.changedOffset();

            this.currSlide--;
            this.offset = this.sliderDistance * this.currSlide;
            this.timeoutID = setTimeout(this.changedOffset, 0);
        }

        // 슬라이드 이동 시 현재 활성화된 pagination 변경
        if (this.paginationItems.length > 0) {
            this.paginationItems.forEach((element) => element.classList.remove("active"));
            this.paginationItems[this.currSlide - 1].classList.add("active");
        }
    }

    onAnimatedStopMove = (event) => {
        clearInterval(this.loopInterval);
        this.loopInterval = undefined;
    }

    onAnimatedStartMove = (event) => {
        this.loopInterval = setInterval(() => {
            this.onNextMove();
        }, 3000);
    }

    changedOffset = () => {
        if (typeof this.timeoutID === "number") {
            clearTimeout(this.timeoutID);
            this.timeoutID = undefined;
        }
        // 각 슬라이드 아이템의 offsetAttribute에 offset 적용
        this.slideItems.forEach((element) => {
            // i.setAttribute("style", `transition: ${0}s; left: ${-offset}px`);
            element.setAttribute("style", `transition: ${this.option.animation.millisecond}ms; ${this.offsetAttribute}: ${-this.offset}px`);
        })
    }
}

function changeCSS(theClass, element, value) {
    let cssRules;
    let added = false;

    if (document.all) {
        cssRules = 'rules';
    } else if (document.getElementById) {
        cssRules = 'cssRules';
    }

    for (let S = 0; S < document.styleSheets.length; S++) {
        for (let R = 0; R < document.styleSheets[S][cssRules].length; R++) {
            if (document.styleSheets[S][cssRules][R].selectorText === theClass &&
                document.styleSheets[S][cssRules][R].style[element] === "") {
                document.styleSheets[S][cssRules][R].style[element] = value;
                added = true;
                break;

            }
        }

        if (!added) {
            if (document.styleSheets[S].insertRule) {
                document.styleSheets[S].insertRule(theClass + '{' + element + ': ' + value + ';}',
                    document.styleSheets[S][cssRules].length
                );
            } else if (document.styleSheets[S].addRule) {
                document.styleSheets[S].addRule(theClass, element + ':' + value + ';');
            }
        }
    }
}

function deleteCSS(theClass, element) {
    let cssRules;
    let deleted = false;

    if (document.all) {
        cssRules = 'rules';
    } else if (document.getElementById) {
        cssRules = 'cssRules';
    }

    for (let S = 0; S < document.styleSheets.length; S++) {
        for (let R = 0; R < document.styleSheets[S][cssRules].length; R++) {
            if (document.styleSheets[S][cssRules][R].selectorText === theClass &&
                document.styleSheets[S][cssRules][R].style[element] !== "") {
                document.styleSheets[S][cssRules][R].style[element] = "";
                deleted = true;
                break;
            }
        }
    }
}

/*
let trElement;

        // 1. 태그 thead를 만든다.
        this.theadElement = document.createElement('thead');

        // 2. 줄을 만든다.
        trElement = document.createElement('tr');

        // 3. 줄에서 정보를 추가한다.
        this.recursiveWriteHeaderInfo(trElement, this.configure.data[0]);

        // 4. 테이블의 헤더에 줄을 추가한다.
        this.theadElement.appendChild(trElement);

        // 5. 테이블에 thead를 추가한다.
        this.tableElement.appendChild(this.theadElement);
 */

/*
MakeElement

MakeMethod

Render

SetEvent

onEventFunction
 */