import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const wasteEntries = await prisma.wasteEntry.findMany({
      include: {
        product: true
      },
      orderBy: { date_discarded: 'desc' }
    })
    return NextResponse.json(wasteEntries)
  } catch (error) {
    console.error('Error fetching waste entries:', error)
    return NextResponse.json({ error: 'Failed to fetch waste entries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create waste entry
    const wasteEntry = await prisma.wasteEntry.create({
      data: {
        product_id: body.product_id,
        purchase_batch_id: body.purchase_batch_id || null,
        thawed_batch_id: body.thawed_batch_id || null,
        batch_type: body.batch_type || null,
        date_discarded: new Date(),
        quantity_discarded: body.quantity_discarded,
        reason: body.reason,
        notes: body.notes || null,
        discarded_by: body.discarded_by || null
      },
      include: {
        product: true
      }
    })
    
    // Update the appropriate batch quantities
    if (body.batch_type === 'thawed' && body.thawed_batch_id) {
      await prisma.thawedBatch.update({
        where: { id: body.thawed_batch_id },
        data: {
          remaining_portions: {
            decrement: body.quantity_discarded
          }
        }
      })
    } else if (body.batch_type === 'purchase' && body.purchase_batch_id) {
      await prisma.purchaseBatch.update({
        where: { id: body.purchase_batch_id },
        data: {
          remaining_portions: {
            decrement: body.quantity_discarded
          }
        }
      })
    }
    
    return NextResponse.json(wasteEntry)
  } catch (error) {
    console.error('Error creating waste entry:', error)
    return NextResponse.json({ error: 'Failed to create waste entry' }, { status: 500 })
  }
}