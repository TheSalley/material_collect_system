# 素材同步系统

## 已适配组件

1. Basic

    1. heading
    2. text-editor
    3. button
    4. image
    5. video
2. General

    1. counter
    2. icon-list
    3. accordion
    4. toggle

待适配：

1. icon-box
2. timeline-widget-addon
3. call-to-action
4. elementskit-team
5. flip-box

有的counter 是cool number 没有数据，默认填充

## 接口

用户列表没有分页

- [x] 1. 站点标题获取和更新;
- [x] 2. 站点Favicon 获取和更新;



1. /api/auth/login/
2. /api/proxy/get_pages?site_id=${site_id}
3. /api/proxy/elementor_data?id=${id}
4. /api/proxy/update_elementor_data