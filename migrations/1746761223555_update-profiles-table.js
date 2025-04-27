export async function up(pgm) {
    pgm.addColumns('profiles', {
        color_background: {
            type: 'integer',
            notNull: false,
            comment: 'Цвет фона карточки пользователя в формате int',
            default: '4272705'
        },
        color_text_background: {
            type: 'integer',
            notNull: false,
            comment: 'Цвет фона текста пользователя в формате int',
            default: '3089455'
        },
        color_border: {
            type: 'integer',
            notNull: false,
            comment: 'Цвет рамки карточки пользователя в формате int',
            default: '6310752'
        },
        color_text: {
            type: 'integer',
            notNull: false,
            comment: 'Цвет основного текста карточки в формате int',
            default: '16769398'
        },
        color_secondary: {
            type: 'integer',
            notNull: false,
            comment: 'Цвет второстепенного текста карточки в формате int',
            default: '16777215'
        },
        color_separator: {
            type: 'integer',
            notNull: false,
            comment: 'Цвет разделительной линии в формате int',
            default: '16777215'
        }
    });
}

export async function down(pgm) {
    pgm.dropColumns('profiles', [
        'color_background',
        'color_text_background',
        'color_border',
        'color_text',
        'color_secondary',
        'color_separator'
    ]);
}
