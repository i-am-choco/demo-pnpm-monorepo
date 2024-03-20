## Monorepo

###### 前言

    年少不懂事，错把Multrepo当作Monorepo,今日我要把失去的所有拿回来

## 概念

[官方概念传送门](https://monorepo.tools/#what-is-a-monorepo)

    mono代表的是单一，而repo代表的是仓库。字面意思来理解，就是这个项目是一个集成在一个仓库作管理控制的项目。
    简单来说，就是这个项目存在于同一个仓库，内部包含了不同的包，而包之间通过父级统一的workspace来管理相互作用。

![Monorepo](/monorepo/monorepo-polyrepo.svg)

## 脱离对 Monorepo 的误区

### Monorepo 不是 Garganturepo

    garganturepo是一个代码托管的构建方案，只能目标服务于一个庞大的项目。而monorepo更为强大的不同是其能支持不同包的托管工作，并且协调不同包之前的使用。

### Monorepo 不是 Monolith

[官方解释传送门](https://blog.nrwl.io/misconceptions-about-monorepos-monorepo-monolith-df1250d4b03c)

#### 总结下被误解的痛点及解释

1. 被迫同时发布所有包！Monoliths 是不好的！

   首先回归到我们 monorepo 的概念，在上诉提到过的单一项目包含着不同包。而我们在编码的时候是针对某一个包 A 进行修改，然后在项目 A~Z 不同包中 B 包涉及使用到 A 包的代码，那么 A 包发生变化会迫使 B 包也要随之变化。但我们在构建打包发布的过程中，我们只需要更新发布 A 包后，发布 B 包即可。而 C~Z 包中因为未涉及到对 A 包或者 B 包的使用，我们无须对其进行构建发布。

   我们可以称其为一个链式反应的过程，毕竟只有 B 被 A 影响到了才需要发布，而 C 没受到 A 和 B 的影响无须发布。

   相反monorepo是简化了代码间的共享与跨项目重构的过程。

![链式图](/monorepo/WeCom20240319-165111.png)


2. 团队合作中无法管理到他人修改项目的代码

    众所周知，这其实可以通过对仓库的设置来介入对仓库项目代码的管理。引用一下文章中提到的例子说明。

    当项目APP存在子包app-a和app-b，但app-a是属于susan团队的项目，app-b属于bob的项目。我们通过设置需要发起pr请求才可合并代码设置，且设置目录下app-a的评判人为susan，app-b的评判人为bob。那么当别的团队修改设置到目录app-a的代码时，必须要通过susan的review及批准，才可以合并修改app-a的代码。app-b同理。

3. 代码庞大容易造成引入混乱

    可能存在单个项目下它文件量和代码量是很庞大的，然后有多个项目集成到同一个仓库下，那么这多个项目就可能存在相同文件名或者变量相同、函数名相同等等的情况。在multrepo中我们习惯了任何文件都能被导入，而在monorepo中我们也容易进入这样一个误区。事实上当我们使用lerna、nx等monorepo工具进行管理项目时，每个子项目都是独立的，不同项目间的文件不会混乱地被引用。它们间存在着一个关系网，我们可以通过这个关系网决策是否引入相应的文件
    
    但是事实上这种混乱情况是非常少的，因为monorepo提倡的是解耦。我们可以绘制不同包之间复杂的关系网来整理。而不是一股脑的不对不同包间的关系作处理。否则monorepo的作用未被发挥，而更偏向于传统的monolith和multirepo。

![关系网图](/monorepo/1_EXH_owC0P-BxSrZJNQ1NyQ.webp)

4. 不方便横向拓展，需要持续运行ci较长时间

    在每次提交时重新构建和重新测试所有内容是十分缓慢的，但事实上monorepo中重新构建及重新测试内容是局部的。当我们集成的项目非常大的时候，我们可以考虑别的ci方案对其进行优化。因为集成项目非常大时，尽管平均时间低于别的方案，但一股脑单一方案来进行处理项目ci是不理智的。

5. git会不会因为monorepo崩坏？

    因为一个项目所存在的代码量是庞大的，当我们项目中集成了更多子项目，那么在进行git操作时会担忧。我们可以借助git的拓展工具GVFS来协助处理。

## Monorepo的好处

1. 无需建立额外的仓库，适用于只需要一个仓库维护所有项目的团队(笑~
2. 不同项目间做到原子化提交，单个项目的提交不会干扰到别的项目代码正常提交
3. 不同项目间均有对应的版本管理
4. 开发者的流动性

## Monorepo的特点

1. 本地缓存

    存储和复用文件及处理任务的输出，减少二次构建及测试相同东西。当然，当我们项目输出收到污染的时候，也需要手动清除下缓存。
![本地缓存解析图](/monorepo/local-computation-caching.svg)

2. 本地项目运行顺序

    能够以正确的顺序并行运行项目。即存在项目A、B、C，C同时使用到了A和B的输出内容，那么我们只需在运行项目时按ABC的顺序进行启动即可。

    * lerna可能有点不太一样
![本地项目运行顺序解析图](/monorepo/local-task-orchestration.svg)

3. 分布式计算缓存

    在同一个程序中，不同项目项目环境地运行由于分布式设计，不会复用同一块缓存进行构建和测试

![分布式计算缓存解析图](/monorepo/distributed-computation-caching.svg)

4. 分布式运行任务

    在同一个程序中，能够给不同机器分发对应的命令，然后执行相应的任务。
    举个例子，存在A、B、C相互独立的子项目，我们开启三个shell分别执行command，其项目不会受任何影响。对于测试某个子项目的测试用例，运行同理。

![分布式执行命令解析图](/monorepo/distributed-tasks-execution.svg)

5. 可视化远程运行项目

    可以在不同机器中，通过控制命令远程分发运行。

6. 可以检测到因为修改所影响到不同项目的内容

![检测](/monorepo/dependency-graph.svg)

7. 无需额外的工作区域进行配置管理项目

![工作区域](/monorepo/workspace-analysis.svg)

8. 能够输出不同子项间的依赖关系图

9. 原始代码共享，无需多层封装处理

![code](/monorepo/source-code-sharing.svg)

10. 框架的一致性

11. 代码结构整理

![结构](/monorepo/code-generation.svg)

12. 易于对项目的管理及限制

![管理](/monorepo/project-constrains-and-visibility.svg)

## Monorepo的工具

    Bazel、Gradle、Lage、Lerna、moon、Nx、Pants、Rush、Turborepo

## Monorepo的实用用例

#### [Lerna官方提供的一个简单用例](https://github.com/lerna/getting-started-example/tree/main)


#### [PNPM实现的monorepo](https://github.com/i-am-choco/demo-pnpm-monorepo)

    在搭建monorepo环境时，pnpm可以不借助任何工具来实现。


## 后续再更新CI相关