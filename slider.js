'use strict'

class Slider {
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
        isExpand => false OR true,
        customEvent: [
            {eventType: "click", function: ~~~}, . . .
        ]
    }
     */
    constructor(targetElement, option = {}) {
        // 타깃 엘리먼트sliderElem가 없으면
        this.slider = targetElement;

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

    // Update
    // Insert
    add(element) {
        let index;
        index = this.slider.appendChild(element);
        return index;
    }

    // Delete
    delete(nodeIndex) {
        this.slider.removeChild(nodeIndex);
        return -1;
    }

    search(className) {
        let ret = null;
        let childNodes;

        childNodes = this.slider.childNodes;

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

        childNodes = this.slider.childNodes;

        childNodes.forEach((element, i) => {
            if (i === index) {
                ret = element;
            }
        });

        return ret;
    }

    getLsit() {
        return this.slider.childNodes;
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

    init() {
        // 원소들을 읽는다.
        this.sliderContainer = this.slider.querySelector(".slider_container");

        this.slideItems = this.slider.querySelectorAll(".slider_item");

        this.prevButton = this.slider.querySelector(".slider_prev_button");
        this.nextButton = this.slider.querySelector(".slider_next_button");

        this.paginationItems = this.slider.querySelectorAll(".slider_pagination > li");

        // 오프셋 방향과 슬라이크 전체 길이를 구한다.
        // 속성도 정한다.
        this.maxSlide = this.slideItems.length;
        this.currentSlide = 0;

        if(this.option.direction === "horizontal" || this.option.direction === "row") {
            this.offsetAttribute = 'left';
            this.sliderDistance = this.slider.clientWidth;

            // 속성 값들을 변경한다.
            this.sliderContainer.style.flexWrap = 'nowrap';
        }
        else if (this.option.direction === "vertical" || this.option.direction === "column") {
            this.offsetAttribute = 'top';
            this.sliderDistance = this.slider.clientHeight;

            // 속성 값들을 변경한다.
            this.sliderContainer.style.flexWrap = 'wrap';
        }

        this.slideItems.forEach((element) => {
            element.style.transition = `${this.offsetAttribute} ${this.option.animation.millisecond}ms`;
        })
    }

    render() {
        this.init();

        // + 원소 랜더 기능은 좀 쓸데 없어보임
        this.offset = this.sliderDistance * this.currentSlide;
        this.changedOffset();

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
            this.slider.appendChild(this.prevButton);
            this.slider.appendChild(this.nextButton);

            // 4. 방향이 수평이거나 가로이면
            if (this.option.direction === "horizontal" || this.option.direction === "row") {
                // 방향에 따라 이전과 다음 버튼에 특수기호를 넣는다.
                this.prevButton.innerHTML = "◀";
                this.nextButton.innerHTML = "▶";

                this.prevButton.style.top = 'calc(50% - 16px)';
                this.nextButton.style.top = 'calc(50% - 16px)';

                this.prevButton.style.left = '10px';
                this.nextButton.style.right = '10px';
            }
            // 5. 방향이 수직이거나 세로이면
            else {
                // 방향에 따라 이전과 다음 버튼에 특수기호를 넣는다.
                this.prevButton.innerHTML = "▲";
                this.nextButton.innerHTML = "▼";

                this.prevButton.style.left = 'calc(50% - 16px)';
                this.nextButton.style.left = 'calc(50% - 16px)';

                this.prevButton.style.top = '10px';
                this.nextButton.style.bottom = '10px';
            }
        }
        // 2. 확장을 추가해야 되면
        if(this.option.isExpand !== undefined || this.option.isExpand === true) {
            // slider_container_hoverable
            this.sliderContainer.classList.add('slider_container_hoverable');
        }

        // 3. 페이지네이션을 추가해야 되면
        if (this.option.isPagination !== undefined || this.option.isPagination === true) {
            // 1. 페이지네이션을 만든다.
            this.pagination = document.createElement('ul');

            // 2. 만든 페이지네이션에 기본 클래스를 추가한다.
            this.pagination.className = 'slider_pagination';

            // 3. 페에지의 개수만큼 자식들을 추가한다.
            this.paginationItems = [];
            for(let i = 0; i < this.maxSlide; i++) {
                this.paginationItems[i] = document.createElement('li');

                if(i === 0) {
                    this.paginationItems[i].className = 'active';
                }

                this.paginationItems[i].innerText = '•';

                this.pagination.appendChild(this.paginationItems[i]);
            }

            // 3. 슬라이더에 추가한다.
            this.slider.appendChild(this.pagination);

            if (this.option.direction === "horizontal" || this.option.direction === "row") {
                this.pagination.style.display = 'flex';
                this.pagination.style.left = '50%';
                this.pagination.style.transform = 'translateX(-50%)';
            }
            else {
                this.pagination.style.display = 'block';
                this.pagination.style.top = '50%';
                this.pagination.style.right = '0%';
                this.pagination.style.transform = 'translateY(-50%)';
            }
        }

        this.setEvent();
    }

    setEvent() {
        let isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
        // 드래그(스와이프) 이벤트를 위한 변수 초기화
        this.startClickPoint = 0;
        this.endClickPoint = 0;

        // 기본적으로 슬라이드 루프 시작하기
        this.loopInterval = setInterval(() => {
            this.onNextMove();
        }, 3000);

        // 슬라이더 원소의 크기가 변경되면
        this.slider.addEventListener("resize", () => {
            this.sliderDistance = this.slider.clientWidth;
        });

        // 버튼들에 클릭 이벤트를 추가한다.
        if (this.prevButton !== null && this.nextButton !== null) {
            this.prevButton.addEventListener("click", this.onPreviousMove);

            this.nextButton.addEventListener("click", this.onNextMove);
        }

        // 각 페이지네이션 클릭 시 해당 슬라이드로 이동하기
        for (let i = 0; i < this.maxSlide && this.paginationItems.length > 0; i++) {
            // 각 페이지네이션마다 클릭 이벤트 추가하기
            this.paginationItems[i].addEventListener("click", this.onPaginationItemClicked);
        }

        if(isMobile !== true) this.slider.addEventListener("mousedown", this.onSetPointing);
        if(isMobile !== true) this.slider.addEventListener("mouseup", this.onKillPointing);

        if(isMobile === true) this.slider.addEventListener("touchstart", this.onSetPointing);
        if(isMobile === true) this.slider.addEventListener("touchend", this.onKillPointing);

        this.slider.addEventListener("mouseover", this.onMouseOver);
        this.slider.addEventListener("mouseout", this.onMouseOut);
    }

    onNextMove = () => {
        this.currentSlide++;
        if(this.currentSlide >= this.maxSlide) {
            this.currentSlide = 0;
        }
        // offset을 계산한다.
        this.offset = this.sliderDistance * this.currentSlide;
        // offset을 변경한다.
        this.changedOffset();

        // 슬라이드 이동 시 현재 활성화된 pagination 변경
        if (this.paginationItems.length > 0) {
            this.paginationItems.forEach((element) => element.classList.remove("active"));
            this.paginationItems[this.currentSlide].classList.add("active");
        }
    }
    onPreviousMove = () => {
        this.currentSlide--;
        if(this.currentSlide < 0) {
            this.currentSlide = this.maxSlide - 1;
        }

        // offset을 계산한다.
        this.offset = this.sliderDistance * this.currentSlide;
        // offset을 변경한다.
        this.changedOffset();

        // 슬라이드 이동 시 현재 활성화된 pagination 변경
        if (this.paginationItems.length > 0) {
            this.paginationItems.forEach((element) => element.classList.remove("active"));
            this.paginationItems[this.currentSlide].classList.add("active");
        }
    }

    // 오버일 때
    onMouseOver = (event) => {
        // 1. 애니메이션을 종료한다.
        clearInterval(this.loopInterval);
        this.loopInterval = undefined;

        // 2. expand 속성이 있으면
        if(this.option.isExpand !== undefined && this.option.isExpand === true) {
            // 2.1. overflow 속성을 변경한다.
            // this.slider.style.maxHeight = `${this.sliderDistance * this.maxSlide}px`;
            // this.sliderContainer.style.overflow = 'visible'
            // this.sliderContainer.style.visibility = 'visible';

            // 2.2. 오프셋의 위치를 변경한다.
            this.offset = 0;
            this.changedOffset();
        }
    }

    // 오버가 아닐 때
    onMouseOut = (event) => {
        // 1. expand 속성이 있으면
        if(this.option.isExpand !== undefined && this.option.isExpand === true) {
            // 1.1. overflow 속성을 변경한다.
            // this.slider.style.maxHeight = `${this.sliderDistance}px`;
            // this.sliderContainer.style.overflow = 'hidden'
            // this.sliderContainer.style.visibility = 'hidden';

            // 1.2. 오프셋의 위치를 변경한다.
            this.offset = this.sliderDistance * this.currentSlide;
            this.changedOffset();
        }

        // 2. 애니메이션을 추가한다.
        if(this.loopInterval !== undefined) {
            clearInterval(this.loopInterval);
            this.loopInterval = undefined;
        }
        this.loopInterval = setInterval(() => {
            this.onNextMove();
        }, 3000);
    }

    // 시작 위치를 읽는다.
    onSetPointing = (event) => {
        this.startClickPoint = event.pageX;
        if(event.touches !== undefined) this.startClickPoint = event.touches[0].pageX;

        if(this.option.direction === 'horizontal' || this.option.direction === 'column') {
            this.startClickPoint = event.pageY;
            if(event.touches !== undefined) this.startClickPoint = event.touches[0].pageY;
        }
    }

    // 마지막 위치를 읽는다.
    onKillPointing = (event) => {
        this.endClickPoint = event.pageX;
        if(event.touches !== undefined) this.endClickPoint = event.changedTouches[0].pageX;

        if(this.option.direction === 'horizontal' || this.option.direction === 'column') {
            this.endClickPoint = event.pageY;
            if(event.touches !== undefined) this.endClickPoint = event.changedTouches[0].pageY;
        }

        if (this.startClickPoint < this.endClickPoint) {
            this.onPreviousMove();
        }
        else if (this.startClickPoint > this.endClickPoint) {
            this.onNextMove();
        }
    }

    onPaginationItemClicked = (event) => {
        let index;

        this.paginationItems.forEach((element, i) => {
            if(element === event.currentTarget) {
                index = i;
            }
        });
        if(index >= this.maxSlide) return;

        this.currentSlide = index;

        // offset을 계산한다.
        this.offset = this.sliderDistance * this.currentSlide;
        // offset으로 변경한다.
        this.changedOffset();
        // 슬라이드 이동 시 현재 활성화된 pagination 변경
        this.paginationItems.forEach((element) => element.classList.remove("active"));
        this.paginationItems[this.currentSlide].classList.add("active");
    }

    changedOffset = () => {
        // 각 슬라이드 아이템의 offsetAttribute에 offset 적용
        this.slideItems.forEach((element) => {
            element.setAttribute("style", `transition: ${this.offsetAttribute} ${this.option.animation.millisecond}ms; ${this.offsetAttribute}: ${-this.offset}px`);
        });
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