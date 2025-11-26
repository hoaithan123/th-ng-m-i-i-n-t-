import React from 'react';
import { Carousel, Typography, Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import './SimplePromoSlider.css';

const { Title, Paragraph } = Typography;

const slides = [
  {
    id: 1,
    title: 'Siêu khuyến mãi hôm nay',
    description: 'Giảm giá nhiều sản phẩm thiết yếu, giao hàng nhanh trong ngày.',
    image:
      'https://images.pexels.com/photos/5632394/pexels-photo-5632394.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    id: 2,
    title: 'Tươi ngon mỗi ngày',
    description: 'Sản phẩm chất lượng, nguồn gốc rõ ràng cho gia đình bạn.',
    image:
      'https://images.pexels.com/photos/3737632/pexels-photo-3737632.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    id: 3,
    title: 'Giao hàng tận nơi',
    description: 'Đặt hàng online dễ dàng, giao nhanh trong 15-30 phút tại khu vực hỗ trợ.',
    image:
      'https://images.pexels.com/photos/4393669/pexels-photo-4393669.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
];

const SimplePromoSlider = ({ onViewProducts }) => {
  return (
    <section className="simple-promo-slider">
      <div className="simple-promo-container">
        <Carousel autoplay autoplaySpeed={5000} effect="fade">
          {slides.map((slide) => (
            <div key={slide.id} className="simple-promo-slide">
              <div className="simple-promo-image-wrapper">
                <img src={slide.image} alt={slide.title} className="simple-promo-image" />
              </div>
              <div className="simple-promo-overlay" />
              <div className="simple-promo-content">
                <Title level={2} className="simple-promo-title">
                  {slide.title}
                </Title>
                <Paragraph className="simple-promo-description">
                  {slide.description}
                </Paragraph>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  className="simple-promo-button"
                  onClick={onViewProducts}
                >
                  Xem sản phẩm
                </Button>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default SimplePromoSlider;
