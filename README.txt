

Jun  3 17:08 2026 README Page 1


    1	JazelKit
    2	========
    3	
    4	Table of Contents
    5	-----------------
    6	
    7	- `JazelKit <#jazelkit>`__
    8	
    9	  - `Table of Contents <#table-of-contents>`__
   10	  - `Install <#install>`__
   11	
   12	    - `Clone and Build for install <#clone-and-build-for-install>`__
   13	    - `Use in your project <#use-in-your-project>`__
   14	
   15	Install
   16	-------
   17	
   18	Clone and Build for install
   19	~~~~~~~~~~~~~~~~~~~~~~~~~~~
   20	
   21	To install JazelKit, do the following in the directory where you want to
   22	install it:
   23	
   24	.. code:: sh
   25	
   26	   git clone https://github.com/Fren507/JazelKit.git
   27	
   28	After cloning, do these steps:
   29	
   30	.. code:: sh
   31	
   32	   cd JazelKit
   33	   npm i
   34	   npm run build
   35	   npm link
   36	
   37	..
   38	
   39	   [!TIP] If ``npm link`` isn’t workig, try it again with ``sudo``:
   40	
   41	   .. code:: sh
   42	
   43	      sudo npm link
   44	
   45	Usage
   46	~~~~~
   47	
   48	To use JazelKit inside an project, run the following to install it:
   49	
   50	.. code:: sh
   51	
   52	   npm link jazelkit
   53	
   54	| Now you can import JazelKit!
   55	| Because JazelKit is still in alpha stage, you have to create files
   56	  manually! But you won’t have to, because you can clone the example







Jun  3 17:08 2026 README Page 2


   57	  template:
   58	
   59	.. code:: sh
   60	
   61	   git clone https://github.com/Fren507/JazelKit-Template.git 
   62	path/to/project
   63	   cd path/to/project
   64	   npm i
   65	   npm link jazelkit
   66	   npm run dev



















































