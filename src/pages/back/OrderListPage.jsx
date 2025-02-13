import { useState, useCallback, useEffect,useRef } from "react";
import { apiServiceAdmin } from "../../apiService/apiService";
import {
  Pagination, Orders, OrderEditModal,OrderEditModal2,
  ProductDetailModal,OrderDeleteModal 
} from "../../component/back";
import * as utils from "../../utils/utils";
import { ToastContext } from "../../component/back/ToastContext";
const APIPath = import.meta.env.VITE_API_PATH;
export default function OrderListPage() {
  const [orderData, setOrderData] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const [editProduct, setEditProduct] = useState({});
  const [modalMode, setModalMode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productDetailModalType, setProductDetailModalType] = useState("");
  const ProductDetailModalRef = useRef(null);
  const [isProductDeleteModalOpen,setIsProductDeleteModalOpen] = useState(false);
  const [isShowToast, setIsShowToast] = useState(false);
  const toastContextValue = {
    setIsShowToast,
    isShowToast,
    setProductDetailModalType,
    productDetailModalType,
  };
  const getOrderData = useCallback(async (page = 1) => {
    setProductDetailModalType("checking");
    utils.modalStatus(ProductDetailModalRef, "", null, false);
    try {
      const resOrder = await apiServiceAdmin.axiosGetProductDataByConfig(
        `/api/${APIPath}/admin/orders`,
        {
          params: {
            page: page,
          },
        }
      );
      // console.log(resOrder.data);
      setOrderData(resOrder.data.orders);
      setPageInfo(resOrder.data.pagination);
    } catch (error) {
      console.log(error);
      // navigate('/login');
    } finally {
      ProductDetailModalRef.current.close();
    }
  }, []);
  const handleDeleteModal = useCallback(
    (orderId) => {
      console.log('delete orderId=',orderId);
      const updatedOrder =
      orderData.find((order) => order.id === orderId) ?? {};
      setEditProduct(updatedOrder);
      setIsProductDeleteModalOpen(true);
    },
    [orderData]
  );
  const handleOpenOrderModalWithValue = useCallback(
    (mode, orderId = null) => {
      if (mode === "edit") {
     
        console.log('edit=',orderData.find((order) => order.id === orderId) ?? {});
      
        let temp = orderData.find((order) => order.id === orderId);
        let products = temp.products;
        const filteredProducts = Object.keys(products).reduce((acc, key) => {
          const { id, product_id, qty } = products[key];
          acc[key] = { id, product_id, qty };
          return acc;
        }, {});
        console.log('filteredProducts=',filteredProducts);
        let tempx = {
          data: {
            create_at: temp.create_at,
            is_paid: temp.is_paid,
            message: temp.message,
            products: filteredProducts,
            user: {
              address: temp.user.address,
              email: temp.user.email,
              name: temp.user.name,
              tel: temp.user.tel
            },
            num: temp.num
          },
        };
        setEditProduct(tempx);
        setModalMode(mode);
        console.log('tempx=',tempx);
      } else if (orderId && mode === "view") {
        console.log("orderId=", orderId);
        setEditProduct(
          () => orderData.find((order) => order.id === orderId) ?? {}
        );
        console.log('orderData=',orderData.find((order) => order.id === orderId));
        setModalMode(mode);
      }
      setIsModalOpen(true);
    },
    [orderData]
  );
  useEffect(() => {
    getOrderData();
  }, []);
  return (
    <>
      {orderData.length > 0 ? (
        <>
          <div className="row mt-1 mb-2 mx-1">
            <div>
              <h3>產品列表</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th className="col-1">index</th>
                    <th className="col-1">訂單id</th>
                    <th className="col-1">付款</th>
                    <th className="col-1">金額</th>
                    <th className="col-1">功能</th>
                  </tr>
                </thead>
                <tbody>
                  {orderData.map((order, index) => {
                    return (
                      <Orders
                        key={order.id}
                        {...order}
                        index={index}
                        handleOpenOrderModalWithValue={
                          handleOpenOrderModalWithValue
                        }
                        handleDeleteModal={handleDeleteModal}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination getData={getOrderData} pageInfo={pageInfo} />
        </>
      ) : (
        <h1>沒有訂單或訂單載入中</h1>
      )}
      {/* <OrderEditModal
        editProduct={editProduct}
        setModalMode={setModalMode}
        modalMode={modalMode}
        getData={getOrderData}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      /> */}
      <OrderEditModal2
        editProduct={editProduct}
        setModalMode={setModalMode}
        modalMode={modalMode}
        getData={getOrderData}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />

      <ToastContext.Provider value={toastContextValue}>
        <ProductDetailModal
          ref={ProductDetailModalRef}
          modalBodyText="訊息"
          modalSize={{ width: "300px", height: "200px" }}
          modalImgSize={{ width: "300px", height: "120px" }}
        />
        <OrderDeleteModal
          setModalMode={setModalMode}
          modalMode={modalMode}
          getData={getOrderData}
          isProductDeleteModalOpen={isProductDeleteModalOpen}
          setIsProductDeleteModalOpen={setIsProductDeleteModalOpen}
          editProduct={editProduct}
        // isShowToast={isShowToast}
        // setIsShowToast={setIsShowToast}
        />
      </ToastContext.Provider>
    </>
  );
}
